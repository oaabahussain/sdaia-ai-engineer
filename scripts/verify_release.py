#!/usr/bin/env python3

import argparse
import hashlib
import json
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path


class InlineScriptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == "script" and "src" not in dict(attrs):
            self.current = []

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.current is not None:
            self.scripts.append("".join(self.current))
            self.current = None


def verify_inline_scripts(text):
    parser = InlineScriptParser()
    parser.feed(text)
    if not parser.scripts:
        raise SystemExit("No inline scripts found")

    for index, script in enumerate(parser.scripts):
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
            handle.write(script)
            script_path = handle.name
        result = subprocess.run(["node", "--check", script_path], text=True, capture_output=True)
        if result.returncode != 0:
            print(result.stdout)
            print(result.stderr)
            raise SystemExit(f"Inline script {index} failed Node syntax check")
    print(f"Inline script parse result: PASS ({len(parser.scripts)} script(s))")


def verify_json_files(root):
    manifest = root / "manifest.webmanifest"
    if manifest.exists():
        json.loads(manifest.read_text(encoding="utf-8"))
        print("Manifest JSON parse: PASS")

    data_dir = root / "data"
    if data_dir.exists():
        for path in sorted(data_dir.glob("*.json")):
            json.loads(path.read_text(encoding="utf-8"))
            print(f"JSON parse: PASS ({path.as_posix()})")

        weights_path = data_dir / "weights.json"
        if weights_path.exists():
            weights = json.loads(weights_path.read_text(encoding="utf-8"))
            total = sum(float(value) for value in weights.values())
            if abs(total - 100.0) > 1e-9:
                raise SystemExit(f"Weights must sum to 100.0; found {total}")
            print("Weights sum: PASS (100.0)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("html")
    parser.add_argument("--html-only", action="store_true")
    args = parser.parse_args()

    html_path = Path(args.html)
    payload = html_path.read_bytes()
    if len(payload) <= 100000:
        raise SystemExit(f"HTML must exceed 100 KB; found {len(payload)} bytes")

    text = payload.decode("utf-8")
    if "DecompressionStream" in text:
        raise SystemExit("DecompressionStream is not allowed in the release HTML")

    question_count = text.count('"id": "q')
    if question_count != 121:
        raise SystemExit(f"Expected 121 inline fallback question entries; found {question_count}")
    print(f"Question entries: PASS ({question_count})")

    verify_inline_scripts(text)
    sha256 = hashlib.sha256(payload).hexdigest()
    print(f"INDEX_SHA256={sha256}")

    if not args.html_only:
        verify_json_files(Path("."))


if __name__ == "__main__":
    main()
