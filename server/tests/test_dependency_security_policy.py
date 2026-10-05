from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _requirements() -> set[str]:
    return {
        line.strip()
        for line in (ROOT / "server/requirements.txt").read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }


def test_server_dependency_security_baseline_is_pinned():
    requirements = _requirements()
    assert "fastapi==0.141.1" in requirements
    assert "starlette==1.7.0" in requirements
    assert "httpx2==2.13.1" in requirements
    assert "pytest==9.0.3" in requirements
    assert all(not requirement.startswith("httpx==") for requirement in requirements)
