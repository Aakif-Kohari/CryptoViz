#!/usr/bin/env python3
"""
audit_issues.py

Logger-style issue audit for a single repo. Each run:
  1. Reads the existing output file (if any) to see which issue numbers
     are already logged.
  2. Fetches every issue on the repo (open + closed, from any author) —
     pull requests are excluded since GitHub's API treats them as issues
     too.
  3. Appends only the ones NOT already in the file — title, author, and
     state only, no descriptions — under a timestamped section.

Re-running never duplicates an entry; the file just grows over time.

Usage:
    GITHUB_TOKEN=... python3 audit_issues.py <owner/repo> <output_txt>
"""

import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone

API = "https://api.github.com"
LINE_RE = re.compile(r"^\[#(?P<number>\d+)\]")


def api_get(path: str, token: str):
    req = urllib.request.Request(f"{API}{path}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def fetch_all_issues(repo: str, token: str) -> list[dict]:
    """repo is 'owner/name'. Uses the repo issues endpoint (not search),
    since it has no separate rate-limit ceiling and paginates cleanly."""
    issues = []
    page = 1
    while True:
        batch = api_get(f"/repos/{repo}/issues?state=all&per_page=100&page={page}", token)
        if not batch:
            break
        # the issues endpoint also returns PRs; filter those out
        issues.extend(i for i in batch if "pull_request" not in i)
        if len(batch) < 100:
            break
        page += 1
    return issues


def load_seen(output: str) -> set[str]:
    """Returns the set of issue numbers already logged in the file."""
    if not os.path.exists(output):
        return set()
    seen = set()
    with open(output) as f:
        for line in f:
            m = LINE_RE.match(line.strip())
            if m:
                seen.add(m.group("number"))
    return seen


def format_line(issue: dict) -> str:
    number = str(issue["number"])
    state = issue["state"]
    author = issue["user"]["login"]
    return f"[#{number}] ({state}) by @{author}: {issue['title']}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", help="owner/name, e.g. csxark/cryptoviz")
    ap.add_argument("output")
    args = ap.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("error: GITHUB_TOKEN is required", file=sys.stderr)
        sys.exit(1)

    seen = load_seen(args.output)
    all_issues = fetch_all_issues(args.repo, token)

    new_issues = [i for i in all_issues if str(i["number"]) not in seen]

    if not new_issues:
        print("No new issues since last run — file unchanged.")
        return

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    with open(args.output, "a") as f:
        f.write(f"\n=== Audited {timestamp} ({len(new_issues)} new) ===\n")
        for issue in new_issues:
            f.write(format_line(issue) + "\n")

    print(f"Appended {len(new_issues)} new issue(s) to {args.output}")


if __name__ == "__main__":
    main()