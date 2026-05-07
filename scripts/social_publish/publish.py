#!/usr/bin/env python3
"""
DLS Dashboard — Facebook publish helper
Reads JSON {series, body, image_path} from stdin, posts to Facebook, prints JSON result.
"""

import json
import os
import sys
from pathlib import Path

social_engine_dir = os.environ.get(
    "DLS_SOCIAL_ENGINE_DIR",
    str(Path.home() / ".openclaw/workspace/manhattan-project/social-engine"),
)
sys.path.insert(0, social_engine_dir)

from content_generator import load_config  # noqa: E402
from facebook_poster import get_page_tokens, load_access_token, publish_post  # noqa: E402


def main():
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        print(json.dumps({"ok": False, "error": f"Invalid JSON input: {e}"}))
        return

    series = payload.get("series")
    body = payload.get("body", "")
    image_path = payload.get("image_path")

    if not series or not body:
        print(json.dumps({"ok": False, "error": "series and body are required"}))
        return

    config = load_config()
    page_config = config["pages"].get(series)
    if not page_config:
        print(json.dumps({"ok": False, "error": f"Unknown series: {series}"}))
        return

    try:
        access_token = load_access_token(config["credentials_file"])
        page_tokens = get_page_tokens(access_token)
    except Exception as e:
        print(json.dumps({"ok": False, "error": f"Token error: {e}"}))
        return

    page_id = page_config["page_id"]
    if page_id not in page_tokens:
        print(json.dumps({"ok": False, "error": f"No page token for {series} (page {page_id})"}))
        return

    post_data = {"body": body, "content_type": "dashboard_publish"}
    result = publish_post(series, page_config, page_tokens, post_data, config, image_path=image_path)

    if result and "id" in result:
        fb_post_id = result["id"]
        fb_url = f"https://www.facebook.com/{fb_post_id}"
        print(json.dumps({"ok": True, "fb_post_id": fb_post_id, "fb_url": fb_url}))
    else:
        print(json.dumps({"ok": False, "error": "Facebook API returned no post ID"}))


if __name__ == "__main__":
    main()
