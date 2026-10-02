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

import sqlite3

from app.main import init_db


def _store_api():
    try:
        from app.evidence_store import (
            accept_evidence,
            accept_evidence_batch,
            get_evidence,
            read_evidence,
        )
        return accept_evidence, accept_evidence_batch, get_evidence, read_evidence
    except ImportError:
        return (None, None, None, None)


def _event(**overrides):
    base = {
        "schema_version": 2,
        "event_id": "123e4567-e89b-42d3-a456-426614174000",
        "definition_id": "learner.response.recorded@1",
        "learner_id": "learner:p1",
        "origin_id": "223e4567-e89b-42d3-a456-426614174001",
        "origin_seq": 1,
        "activity_id": "323e4567-e89b-42d3-a456-426614174002",
        "assessment_attempt_id": "423e4567-e89b-42d3-a456-426614174003",
        "track_id": "sdaia-ai-engineer",
        "content_release_id": "release-1",
        "mode": "practice",
        "locale": "en",
        "occurred_at": "2026-10-02T19:00:00.000Z",
        "item_interaction_id": "523e4567-e89b-42d3-a456-426614174004",
        "item_version_id": "item-v1",
        "payload": {
            "response_version": 1,
            "response_kind": "OPTION",
            "response": {"option_index": 0},
        },
    }
    base.update(overrides)
    return base


def test_k3_sqlite_schema_is_additive_indexed_and_idempotent(tmp_path):
    db_url = f"sqlite:///{tmp_path / 'schema.db'}"
    init_db(db_url)
    init_db(db_url)
    db_path = str(tmp_path / "schema.db")
    with sqlite3.connect(db_path) as db:
        tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        indexes = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='index'")}
    assert "learner_events" in tables
    assert "k3_evidence_events" in tables
    assert "k3_evidence_store_meta" in tables
    assert {
        "idx_k3_evidence_learner_seq",
        "idx_k3_evidence_activity_seq",
        "idx_k3_evidence_attempt_seq",
        "idx_k3_evidence_item_seq",
        "idx_k3_evidence_release_seq",
        "idx_k3_evidence_definition_seq",
    }.issubset(indexes)


def test_k3_sqlite_accept_exact_retry_and_conflicts(tmp_path):
    accept_evidence, _, _, _ = _store_api()
    assert callable(accept_evidence), "accept_evidence behavior is missing"
    db_url = f"sqlite:///{tmp_path / 'accept.db'}"
    init_db(db_url)

    first = accept_evidence(db_url, _event())
    assert first["disposition"] == "ACCEPTED"
    assert first["store_seq"] == 1
    assert len(first["event_fingerprint"]) == 64

    duplicate = accept_evidence(db_url, _event())
    assert duplicate["disposition"] == "DUPLICATE"
    assert duplicate["store_seq"] == first["store_seq"]
    assert duplicate["accepted_at"] == first["accepted_at"]
    assert duplicate["event_fingerprint"] == first["event_fingerprint"]

    changed = _event(payload={"response_version": 1, "response_kind": "OPTION", "response": {"option_index": 1}})
    conflict = accept_evidence(db_url, changed)
    assert conflict["disposition"] == "CONFLICT"
    assert conflict["reason_code"] == "EVENT_ID_CONFLICT"

    origin_conflict = accept_evidence(
        db_url,
        _event(
            event_id="623e4567-e89b-42d3-a456-426614174005",
            payload={"response_version": 1, "response_kind": "OPTION", "response": {"option_index": 2}},
        ),
    )
    assert origin_conflict["disposition"] == "CONFLICT"
    assert origin_conflict["reason_code"] == "ORIGIN_SEQ_CONFLICT"


def test_k3_sqlite_batch_sequence_lookup_and_filters(tmp_path):
    accept_evidence, accept_batch, get_evidence, read_evidence = _store_api()
    assert callable(accept_evidence), "accept_evidence behavior is missing"
    assert callable(accept_batch), "accept_evidence_batch behavior is missing"
    assert callable(get_evidence), "get_evidence behavior is missing"
    assert callable(read_evidence), "read_evidence behavior is missing"

    db_url = f"sqlite:///{tmp_path / 'query.db'}"
    init_db(db_url)
    one = _event()
    two = _event(
        event_id="723e4567-e89b-42d3-a456-426614174006",
        origin_seq=2,
        activity_id="823e4567-e89b-42d3-a456-426614174007",
        assessment_attempt_id="923e4567-e89b-42d3-a456-426614174008",
        content_release_id="release-2",
        item_interaction_id="a23e4567-e89b-42d3-a456-426614174009",
        item_version_id="item-v2",
        definition_id="learner.response.evaluated@1",
        payload={
            "response_event_id": "123e4567-e89b-42d3-a456-426614174000",
            "scoring_policy_ref": "policy:1",
            "evaluation_status": "GRADED",
            "correct": True,
            "score": 1,
        },
    )
    result = accept_batch(db_url, [one, two])
    assert result["schema_version"] == 1
    assert [r["store_seq"] for r in result["receipts"]] == [1, 2]
    assert get_evidence(db_url, two["event_id"]) == two

    assert read_evidence(db_url, "learner:p1") == [one, two]
    assert read_evidence(db_url, "learner:p1", after_store_seq=1) == [two]
    assert read_evidence(db_url, "learner:p1", filters={"activity_id": two["activity_id"]}) == [two]
    assert read_evidence(db_url, "learner:p1", filters={"assessment_attempt_id": two["assessment_attempt_id"]}) == [two]
    assert read_evidence(db_url, "learner:p1", filters={"item_version_id": "item-v2"}) == [two]
    assert read_evidence(db_url, "learner:p1", filters={"content_release_id": "release-2"}) == [two]
    assert read_evidence(db_url, "learner:p1", filters={"definition_id": "learner.response.evaluated@1"}) == [two]
    assert read_evidence(db_url, "learner:p1", filters={"type": "learner.response.evaluated@1"}) == [two]
    assert read_evidence(db_url, "learner:other") == []

