#!/usr/bin/env python3

import argparse
import hashlib
import json
import subprocess
from html.parser import HTMLParser
from pathlib import Path


class ScriptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inline_scripts = []
        self.module_sources = []
        self.current = None
        self.current_type = None

    def handle_starttag(self, tag, attrs):
        if tag != "script":
            return
        attrs = dict(attrs)
        source = attrs.get("src")
        script_type = attrs.get("type", "")
        if source:
            if script_type == "module":
                self.module_sources.append(source)
            return
        self.current = []
        self.current_type = script_type

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag != "script" or self.current is None:
            return
        if self.current_type != "application/json":
            self.inline_scripts.append("".join(self.current))
        self.current = None
        self.current_type = None


def check_js(path):
    result = subprocess.run(["node", "--check", str(path)], text=True, capture_output=True)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
        raise SystemExit(f"JavaScript syntax check failed: {path}")
    print(f"JavaScript syntax: PASS ({path})")


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
            total = sum(float(value) for value in json.loads(weights_path.read_text(encoding="utf-8")).values())
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
    if len(payload) <= 50000:
        raise SystemExit(f"HTML must exceed 50 KB; found {len(payload)} bytes")
    text = payload.decode("utf-8")
    if "DecompressionStream" in text:
        raise SystemExit("DecompressionStream is not allowed in release HTML")
    question_count = text.count('"id":"q') + text.count('"id": "q')
    if question_count != 121:
        raise SystemExit(f"Expected 121 inline fallback question entries; found {question_count}")
    print(f"Question entries: PASS ({question_count})")

    parser_state = ScriptParser()
    parser_state.feed(text)
    if not parser_state.module_sources:
        raise SystemExit("Expected at least one module script source")
    print(f"Module scripts: PASS ({', '.join(parser_state.module_sources)})")

    if not args.html_only:
        for source in parser_state.module_sources:
            if source.startswith("./"):
                module_path = Path(source[2:])
                if not module_path.exists():
                    raise SystemExit(f"Module source is missing: {module_path}")
                check_js(module_path)
        verify_json_files(Path("."))

    sha256 = hashlib.sha256(payload).hexdigest()
    print(f"INDEX_SHA256={sha256}")


if __name__ == "__main__":
    main()
