#!/usr/bin/env python3
"""
DLS Dashboard — Backfill content_items with generated social posts.
Generates one post per product (salem/titanic/asylum), picks an image,
and inserts into Postgres as 'reviewed' status.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

import psycopg2

social_engine_dir = os.environ.get(
    "DLS_SOCIAL_ENGINE_DIR",
    str(Path.home() / ".openclaw/workspace/manhattan-project/social-engine"),
)
sys.path.insert(0, social_engine_dir)

from content_generator import generate_all_posts, load_config, load_state  # noqa: E402
from engine import pick_image  # noqa: E402

DB = os.environ.get("DATABASE_URL", "postgresql://localhost:5432/personal_os")


def sanitize(text: str) -> str:
    """Remove surrogate characters that can't be encoded to UTF-8."""
    return text.encode("utf-8", errors="replace").decode("utf-8")


def truncate_title(body: str, max_len: int = 80) -> str:
    """First max_len chars of body, ending at a word boundary."""
    if len(body) <= max_len:
        return body
    truncated = body[:max_len]
    last_space = truncated.rfind(" ")
    if last_space > 20:
        truncated = truncated[:last_space]
    return truncated.rstrip(".,;:!? ") + "\u2026"


def main():
    config = load_config()
    state = load_state()

    print("Generating posts...")
    posts = generate_all_posts(config, state)
    print(f"  Generated {len(posts)} posts.")

    conn = psycopg2.connect(DB)
    cur = conn.cursor()
    inserted = []

    for post in posts:
        product = post["product"]
        body = sanitize(post["body"])
        content_type = post.get("content_type", "social_post")
        title = truncate_title(body)

        # Idempotency: skip if same body+series exists
        cur.execute(
            "SELECT id FROM content_items WHERE series = %s AND body = %s LIMIT 1",
            (product, body),
        )
        existing = cur.fetchone()
        if existing:
            print(f"  [{product}] Already exists (id={existing[0]}), skipping.")
            continue

        # Pick image
        image_path = pick_image(product, config, state)

        metadata = json.dumps({
            "content_type": content_type,
            "generated_at": datetime.now().isoformat(),
            "source": "backfill_2026-05-07",
        })

        cur.execute(
            """INSERT INTO content_items
               (project, series, asset_type, platform, status, title, body, image_url, metadata)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
               RETURNING id""",
            ("dls", product, "social_post", "facebook", "reviewed", title, body, image_path, metadata),
        )
        row = cur.fetchone()
        if row:
            inserted.append({"id": str(row[0]), "series": product})
            print(f"  [{product}] Inserted id={row[0]}")
        else:
            print(f"  [{product}] Insert failed.")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone. Inserted {len(inserted)} content items.")
    for item in inserted:
        print(f"  {item['series']}: {item['id']}")


if __name__ == "__main__":
    main()
