import inspect

import pytest
from starlette.requests import Request

from app.main import create_app


def _auth_api():
    try:
        from app.evidence_auth import (
            AuthorizedLearner,
            DenyLearnerAuthorization,
            LearnerAuthorizationDenied,
            StaticLearnerAuthorization,
        )
        return {
            "AuthorizedLearner": AuthorizedLearner,
            "DenyLearnerAuthorization": DenyLearnerAuthorization,
            "LearnerAuthorizationDenied": LearnerAuthorizationDenied,
            "StaticLearnerAuthorization": StaticLearnerAuthorization,
        }
    except ImportError:
        return {}


def _request(headers=None, query=""):
    raw_headers = [
        (name.lower().encode("latin-1"), value.encode("latin-1"))
        for name, value in (headers or {}).items()
    ]
    return Request({
        "type": "http",
        "http_version": "1.1",
        "method": "GET",
        "scheme": "https",
        "path": "/v1/learner-evidence",
        "raw_path": b"/v1/learner-evidence",
        "query_string": query.encode("ascii"),
        "headers": raw_headers,
        "client": ("127.0.0.1", 1234),
        "server": ("testserver", 443),
    })


def test_default_authorization_fails_closed_even_with_claimed_learner_and_x_anon_id():
    api = _auth_api()
    assert "DenyLearnerAuthorization" in api, "fail-closed learner authorization behavior is missing"
    denied = api["DenyLearnerAuthorization"]()
    request = _request(
        headers={"X-Anon-Id": "123e4567-e89b-42d3-a456-426614174000"},
        query="learner_id=learner%3Ap1",
    )
    with pytest.raises(api["LearnerAuthorizationDenied"]):
        denied.resolve(request)


def test_static_authorization_returns_only_its_configured_principal():
    api = _auth_api()
    assert "StaticLearnerAuthorization" in api, "static learner authorization behavior is missing"
    auth = api["StaticLearnerAuthorization"]("learner:authorized")
    request = _request(
        headers={"X-Anon-Id": "223e4567-e89b-42d3-a456-426614174001"},
        query="learner_id=learner%3Aattacker",
    )
    resolved = auth.resolve(request)
    assert isinstance(resolved, api["AuthorizedLearner"])
    assert resolved.learner_id == "learner:authorized"
    assert resolved.learner_id != request.query_params["learner_id"]


def test_create_app_defaults_to_fail_closed_authorization(tmp_path):
    api = _auth_api()
    assert "DenyLearnerAuthorization" in api, "fail-closed learner authorization behavior is missing"
    app = create_app(f"sqlite:///{tmp_path / 'default-auth.db'}")
    assert isinstance(app.state.learner_auth, api["DenyLearnerAuthorization"])


def test_create_app_accepts_explicit_authorization_port(tmp_path):
    api = _auth_api()
    assert "StaticLearnerAuthorization" in api, "static learner authorization behavior is missing"
    auth = api["StaticLearnerAuthorization"]("learner:authorized")
    signature = inspect.signature(create_app)
    assert "learner_auth" in signature.parameters, "create_app learner_auth injection is missing"
    app = create_app(f"sqlite:///{tmp_path / 'injected-auth.db'}", learner_auth=auth)
    assert app.state.learner_auth is auth
