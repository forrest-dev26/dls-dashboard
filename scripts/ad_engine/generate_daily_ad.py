#!/usr/bin/env python3
"""
DLS Daily Ad Engine — generates one ad proposal per day.
Targets Eleanor avatar. Equal rotation: Salem -> Titanic -> Asylum.
Uses OpenAI for copy + image generation. Audits copy via social-engine.
"""
from __future__ import annotations

import json
import logging
import os
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import psycopg2

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

COPY_PROMPT_VERSION = "eleanor-v1"
SERIES_ROTATION = ["salem", "titanic", "asylum"]
SERIES_DISPLAY = {"salem": "Salem (1692)", "titanic": "Titanic (1912)", "asylum": "Asylum (1920s)"}
MAX_AUDIT_RETRIES = 3

PROJECT_ROOT = Path.home() / "Code" / "dls-dashboard"
AD_IMAGES_DIR = PROJECT_ROOT / "public" / "ad-images"
AD_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

LOG_PATH = Path.home() / "Library" / "Logs" / "ai.sarah.dls-ad-engine.log"
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("dls-ad-engine")

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def get_db():
    dsn = os.environ.get("DATABASE_URL", "postgresql://localhost:5432/personal_os")
    return psycopg2.connect(dsn)


def proposal_exists_today(conn, series: str) -> bool:
    """Check if a proposal for today's date + series already exists."""
    cur = conn.cursor()
    cur.execute(
        "SELECT 1 FROM ad_proposals WHERE series = %s AND created_at::date = CURRENT_DATE LIMIT 1",
        (series,),
    )
    exists = cur.fetchone() is not None
    cur.close()
    return exists


def insert_proposal(conn, data: dict) -> str:
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO ad_proposals
           (series, headline, primary_copy, cta, hook_label, image_path,
            image_prompt, copy_prompt_version, metadata)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
           RETURNING id""",
        (
            data["series"],
            data["headline"],
            data["primary_copy"],
            data["cta"],
            data.get("hook_label"),
            data.get("image_path"),
            data.get("image_prompt"),
            COPY_PROMPT_VERSION,
            json.dumps(data.get("metadata", {})),
        ),
    )
    row_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    return str(row_id)


# ---------------------------------------------------------------------------
# Series determination
# ---------------------------------------------------------------------------

def get_today_series() -> str:
    override = os.environ.get("DLS_AD_SERIES", "").strip().lower()
    if override in SERIES_ROTATION:
        return override
    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    return SERIES_ROTATION[day_of_year % 3]


# ---------------------------------------------------------------------------
# Copy generation
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are a direct-response copywriter for Dead Letter Studio (DLS), a subscription mystery experience delivered by physical mail.

TARGET AUDIENCE — Eleanor:
- 52, married, two kids in college or just out. Healthcare admin / education / nonprofit / middle management.
- Lives in Charlotte, Raleigh, suburban Boston, Madison, Boise — or somewhere comparable.
- Wants something that respects her intelligence and gives her a small thing to look forward to.
- The physical mail is the point — she is tired of screens and likes the deliberateness of it.
- Reads Tana French, Kate Atkinson, Anthony Horowitz, Erik Larson, Hilary Mantel. Subscribes to The Atlantic or The New Yorker.
- Found DLS via Instagram/Facebook ad, podcast, friend, or a gift she re-bought for herself.
- Will pay $199 without flinching; $249 if framing is right. Time-sensitive and quality-sensitive.

VOICE RULES — MUST FOLLOW:
- Respect-for-intelligence framing. She doesn't want to be sold to; she wants to be invited to something good.
- Anti-screen / pro-physical / pro-deliberate hooks work well.
- "Something to look forward to" is the emotional engine — anticipation, not adrenaline.
- Copy: literate, confident, never breathless. Em-dashes welcome. Short or long sentences, never juvenile.
- Say "members" — NEVER "subscribers."
- No wax seals, no handwritten claims, no "inserts," no "printed cards."
- No emojis in body copy. No exclamation marks in body copy.
- No fake urgency ("Last chance!", "Only 50 left!").
- No "you won't believe..." breathless copy.

SERIES COLOR PALETTES (for image_prompt):
- Salem (1692): candlelight, deep brown, dusk
- Titanic (1912): navy, brass, pale gold, soft fog
- Asylum (1920s): jade, cream, sepia, art-deco accents

IMAGE PROMPT RULES:
- Warm, atmospheric, period-accurate. Slightly cinematic but never cartoonish.
- Salem: NO jack-o-lanterns, NO cackling witches, NO green skin, NO cliched Halloween imagery.
- Titanic: NO sinking ship, NO iceberg crash. It's a story aboard the ship, not a disaster movie.
- Asylum: NO straitjackets, NO institutional-horror imagery. It's gothic mystery, not exploitation.
"""


def build_user_prompt(series: str) -> str:
    display = SERIES_DISPLAY[series]
    return f"""Generate a Facebook/Instagram feed ad for the DLS series: {display}.

Output JSON with these keys:
- headline: max 8 words, compelling but not breathless
- primary_copy: 2-4 sentences, max 200 characters total, literate and confident
- cta: 3-5 words, inviting not pushy
- hook_label: 1-3 word category (e.g. "anti-screen", "intelligence-respect", "anticipation", "gift-for-self")
- image_prompt: A detailed prompt for an image model — describe the scene, mood, color palette (use the {series} palette), period-accurate details. Avoid all DON'Ts. The image should be 1:1 square format, atmospheric and cinematic."""


def generate_copy(series: str) -> dict:
    """Call OpenAI Chat Completions to generate ad copy."""
    from openai import OpenAI

    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(series)},
        ],
        response_format={"type": "json_object"},
        temperature=0.8,
    )
    content = response.choices[0].message.content
    return json.loads(content)


# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------

AUDIT_SCRIPT = PROJECT_ROOT / "scripts" / "social_publish" / "audit.py"


def audit_copy(text: str) -> dict:
    """Run copy through the social-engine audit."""
    try:
        result = subprocess.run(
            [sys.executable, str(AUDIT_SCRIPT)],
            input=text,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0 and result.stdout.strip():
            return json.loads(result.stdout)
    except Exception as e:
        log.warning("Audit script error: %s", e)
    return {"clean": True, "violations": [], "error": None}


# ---------------------------------------------------------------------------
# Image generation
# ---------------------------------------------------------------------------

def generate_image(image_prompt: str, series: str) -> str | None:
    """Generate ad image via OpenAI gpt-image-1 API. Returns saved file path."""
    try:
        from openai import OpenAI
        import base64

        client = OpenAI()
        result = client.images.generate(
            model="gpt-image-1",
            prompt=image_prompt,
            size="1024x1024",
            n=1,
        )

        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        short_id = uuid.uuid4().hex[:8]
        filename = f"{today}-{series}-{short_id}.png"
        filepath = AD_IMAGES_DIR / filename

        # gpt-image-1 returns base64
        image_data = base64.b64decode(result.data[0].b64_json)
        filepath.write_bytes(image_data)

        log.info("Image saved: %s", filepath)
        return f"public/ad-images/{filename}"

    except Exception as e:
        log.error("Image generation failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    series = get_today_series()
    log.info("Daily ad generation starting — series: %s", series)

    conn = get_db()
    try:
        # Idempotency: skip if already generated today for this series
        if proposal_exists_today(conn, series):
            log.info("Proposal already exists for today + %s — skipping.", series)
            print(json.dumps({"skipped": True, "series": series, "reason": "already_exists"}))
            return

        # Generate copy with audit loop
        ad_data = None
        audit_warning = False

        for attempt in range(1, MAX_AUDIT_RETRIES + 1):
            log.info("Generating copy — attempt %d/%d", attempt, MAX_AUDIT_RETRIES)
            ad_data = generate_copy(series)

            # Audit the combined text
            audit_text = f"{ad_data.get('headline', '')} {ad_data.get('primary_copy', '')} {ad_data.get('cta', '')}"
            audit_result = audit_copy(audit_text)

            if audit_result.get("clean", False):
                log.info("Audit passed on attempt %d", attempt)
                break
            else:
                violations = audit_result.get("violations", [])
                log.warning("Audit failed (attempt %d): %s", attempt, violations)
                if attempt == MAX_AUDIT_RETRIES:
                    log.warning("Max retries reached — proceeding with audit warning")
                    audit_warning = True

        if ad_data is None:
            log.error("No ad data generated — aborting")
            return

        # Generate image
        image_prompt = ad_data.get("image_prompt", "")
        image_path = generate_image(image_prompt, series)

        # Build proposal record
        metadata = {}
        if audit_warning:
            metadata["audit_warning"] = True

        proposal = {
            "series": series,
            "headline": ad_data["headline"],
            "primary_copy": ad_data["primary_copy"],
            "cta": ad_data["cta"],
            "hook_label": ad_data.get("hook_label"),
            "image_path": image_path,
            "image_prompt": image_prompt,
            "metadata": metadata,
        }

        row_id = insert_proposal(conn, proposal)
        log.info("Proposal inserted: id=%s series=%s", row_id, series)

        print(json.dumps({"ok": True, "id": row_id, "series": series}))

    finally:
        conn.close()


if __name__ == "__main__":
    main()
