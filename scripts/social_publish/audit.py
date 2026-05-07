#!/usr/bin/env python3
"""
DLS Dashboard — Audit helper
Reads post body from stdin, runs audit_post(), prints JSON result to stdout.
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

from post_audit import audit_post  # noqa: E402

def main():
    body = sys.stdin.read()
    if not body.strip():
        print(json.dumps({"violations": [], "positives": [], "clean": False, "error": "empty body"}))
        sys.exit(0)
    try:
        result = audit_post(body)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"violations": [], "positives": [], "clean": False, "error": str(e)}))

if __name__ == "__main__":
    main()
