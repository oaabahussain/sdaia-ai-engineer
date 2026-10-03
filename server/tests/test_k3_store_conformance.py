import json
from pathlib import Path

import pytest

from app.evidence_store import (
    accept_evidence,
    accept_evidence_batch,
    get_evidence,
    read_evidence,
)
from app.main import init_db

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = json.loads((ROOT / "tests/fixtures/k3/store-conformance.json").read_text(encoding="utf-8"))["parity"]


@pytest.fixture
def db_url(tmp_path):
    value = f"sqlite:///{tmp_path / 'parity.db'}"
    init_db(value)
    return value


def test_sqlite_append_order_late_arrival_and_multi_origin(db_url):
    events = FIXTURE["events"]
    result = accept_evidence_batch(db_url, events)
    assert [r["disposition"] for r in result["receipts"]] == FIXTURE["expected"]["accepted_dispositions"]
    assert [r["store_seq"] for r in result["receipts"]] == FIXTURE["expected"]["store_seq"]
    assert [e["event_id"] for e in read_evidence(db_url, events[0]["learner_id"])] == FIXTURE["expected"]["read_ids"]
    assert events[1]["occurred_at"] < events[0]["occurred_at"]
    assert events[0]["origin_seq"] == events[2]["origin_seq"]
    assert events[0]["origin_id"] != events[2]["origin_id"]


def test_sqlite_retry_and_conflicts(db_url):
    first = accept_evidence(db_url, FIXTURE["events"][0])
    retry = accept_evidence(db_url, dict(FIXTURE["events"][0]))
    assert retry["disposition"] == "DUPLICATE"
    assert retry["store_seq"] == first["store_seq"]
    assert retry["accepted_at"] == first["accepted_at"]
    assert retry["event_fingerprint"] == first["event_fingerprint"]

    changed = {**FIXTURE["events"][0], **FIXTURE["id_conflict"]}
    assert accept_evidence(db_url, changed)["reason_code"] == "EVENT_ID_CONFLICT"

    accept_evidence(db_url, FIXTURE["events"][1])
    conflict = accept_evidence(db_url, FIXTURE["origin_seq_conflict"])
    assert conflict["disposition"] == "CONFLICT"
    assert conflict["reason_code"] == "ORIGIN_SEQ_CONFLICT"


def test_sqlite_lookup_and_filtered_reads(db_url):
    events = FIXTURE["events"]
    accept_evidence_batch(db_url, events)
    assert get_evidence(db_url, events[2]["event_id"]) == events[2]
    assert [e["event_id"] for e in read_evidence(db_url, events[0]["learner_id"], filters={"item_version_id": "item-b"})] == FIXTURE["expected"]["item_filter_ids"]
    assert [e["event_id"] for e in read_evidence(db_url, events[0]["learner_id"], filters={"type": "learner.response.evaluated@1"})] == FIXTURE["expected"]["type_filter_ids"]
