import hashlib
import json
from pathlib import Path

import rfc8785

ROOT = Path(__file__).resolve().parents[2]
VECTORS = json.loads((ROOT / "tests/fixtures/k3/jcs-vectors.json").read_text(encoding="utf-8"))["vectors"]


def test_python_rfc8785_matches_shared_jcs_vectors():
    for vector in VECTORS:
        canonical = rfc8785.dumps(vector["value"])
        assert canonical.decode("utf-8") == vector["canonical"], vector["id"]
        assert hashlib.sha256(canonical).hexdigest() == vector["sha256"], vector["id"]


def test_rfc8785_dependency_is_pinned():
    requirements = (ROOT / "server/requirements.txt").read_text(encoding="utf-8")
    assert "rfc8785==0.1.4" in requirements
