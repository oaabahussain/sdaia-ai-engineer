import copy
import json
import sqlite3
import pytest

from app.main import init_db
import app.evidence_store as store


def eid(n):
    return f"10000000-0000-4000-8000-{n:012d}"


def event(n=1, learner="learner:a"):
    return {"event_id": eid(n), "origin_id": eid(99), "origin_seq": n, "learner_id": learner,
            "activity_id": eid(90), "content_release_id": "release:test", "definition_id": "learner.activity.started@1",
            "schema_version": 2, "track_id": "sdaia-ai-engineer", "mode": "practice", "locale": "en",
            "occurred_at": "2026-10-03T16:00:00Z", "payload": {}}


def request(operation="DELETE"):
    policy = {"policy_ref": "policy:approved", "linked_metadata": "ERASE" if operation == "DELETE" else "RETAIN",
              "export_records": "ERASE", "projection_caches": "INVALIDATE_ALL"}
    if operation == "DELINK":
        policy["retention_reason_code"] = "EVIDENCE_RETENTION_APPROVED"
    return {"learner_id": "learner:a", "operation": operation, "authority_ref": "authority:test",
            "reason_code": "SUBJECT_REQUEST", "policy": policy}


def export(n=10, **changes):
    record = {"schema_version": 1, "export_record_id": eid(n), "event_id": eid(1), "adapter_id": "adapter:test",
              "adapter_version": "1", "destination_class": "TEST", "mapping_version": "1", "action": "EXPORTED",
              "occurred_at": "2026-10-03T16:00:00Z", "privacy_disposition": "ALLOW", "external_ref": "external:1"}
    return dict(record, **changes)


@pytest.fixture
def db(tmp_path):
    path = tmp_path / "privacy.db"
    url = f"sqlite:///{path}"
    init_db(url)
    store.accept_evidence(url, event())
    store.accept_evidence(url, event(2, "learner:b"))
    return url, path


def lifecycle(url, authorize=lambda r: True):
    # Before implementation, a no-op baseline proves the missing erasure behavior.
    factory = getattr(store, "create_privacy_lifecycle", None)
    return factory(url, authorize=authorize) if factory else lambda r: {"status": "NOT_IMPLEMENTED"}


def test_authorized_delete_erases_raw_fingerprint_and_receipt_columns(db):
    url, path = db
    result = lifecycle(url)(request())
    assert store.get_evidence(url, eid(1)) is None
    assert store.get_evidence(url, eid(2)) == event(2, "learner:b")
    with sqlite3.connect(path) as conn:
        assert conn.execute("SELECT count(*) FROM k3_evidence_events WHERE learner_id = 'learner:a'").fetchone()[0] == 0
    assert result["status"] == "APPLIED"
    assert result["replay_complete"] is False
    assert result["external_deletion"] == "NOT_PERFORMED"


def test_unauthorized_request_and_forged_authority_have_no_side_effect(db):
    url, _ = db
    with pytest.raises(PermissionError):
        lifecycle(url, lambda r: False)(request())
    assert store.get_evidence(url, eid(1)) == event()


def test_export_ledger_is_append_only_and_conflict_safe(db):
    url, _ = db
    append = getattr(store, "append_export_record", lambda *a, **k: {"disposition": "NOT_IMPLEMENTED"})
    read = getattr(store, "read_export_records", lambda *a: [])
    assert append(url, export(), destination_policy={"deletion_support": "SUPPORTED"})["disposition"] == "ACCEPTED"
    assert append(url, export(), destination_policy={"deletion_support": "SUPPORTED"})["disposition"] == "DUPLICATE"
    append(url, export(11, action="DELETE_REQUESTED", predecessor_record_id=eid(10)))
    append(url, export(12, action="DELETION_UNSUPPORTED", predecessor_record_id=eid(11)))
    assert [r["action"] for r in read(url)] == ["EXPORTED", "DELETE_REQUESTED", "DELETION_UNSUPPORTED"]
    assert read(url)[0] == export()
    with pytest.raises(ValueError, match="conflict"):
        append(url, export(external_ref="changed"), destination_policy={"deletion_support": "SUPPORTED"})


def test_delete_covers_exports_links_caches_and_persists_replay_limit(db):
    url, path = db
    append = getattr(store, "append_export_record", None)
    assert callable(append), "governed export persistence behavior is missing"
    append(url, export(), destination_policy={"deletion_support": "SUPPORTED"})
    link = {"schema_version": 1, "identity_link_record_id": eid(20), "link_id": "link:a", "action": "LINK",
            "source_learner_id": "learner:a", "target_learner_id": "learner:b", "effective_at": "2026-10-03T16:00:00Z",
            "authority_ref": "authority:test", "reason_code": "ACCOUNT_LINK", "created_at": "2026-10-03T16:00:00Z"}
    store.append_identity_link_record(url, link)
    with sqlite3.connect(path) as conn:
        conn.execute("INSERT INTO k3_projection_caches VALUES (?, ?, ?)", ("projection:b", "learner:b", "{}"))
    lifecycle(url)(request())
    assert store.read_export_records(url) == []
    assert store.read_identity_link_records(url) == []
    with sqlite3.connect(path) as conn:
        assert conn.execute("SELECT count(*) FROM k3_projection_caches").fetchone()[0] == 0
    assert store.get_privacy_replay_state(url)["replay_complete"] is False


def test_delink_preserves_explicitly_retained_evidence(db):
    url, _ = db
    result = lifecycle(url)(request("DELINK"))
    assert result["status"] == "APPLIED"
    assert result["replay_complete"] is False
    assert store.get_evidence(url, eid(1)) == event()
    assert store.accept_evidence(url, event())["disposition"] == "DUPLICATE"


def test_invalid_policy_and_undocumented_retention_are_rejected(db):
    url, _ = db
    for invalid in (dict(request(), policy={}), dict(request(), policy=dict(request()["policy"], export_records="RETAIN"))):
        with pytest.raises(ValueError):
            lifecycle(url)(invalid)
    assert store.get_evidence(url, eid(1)) == event()


def test_authorization_callback_cannot_retarget_the_operation(db):
    url, _ = db
    def authorize(r):
        r["learner_id"] = "learner:b"
        return True
    lifecycle(url, authorize)(request())
    assert store.get_evidence(url, eid(1)) is None
    assert store.get_evidence(url, eid(2)) == event(2, "learner:b")


def test_privacy_database_failure_rolls_back_all_changes(db):
    url, path = db
    with sqlite3.connect(path) as conn:
        conn.execute("CREATE TRIGGER privacy_failure BEFORE DELETE ON k3_evidence_events BEGIN SELECT RAISE(ABORT, 'privacy blocked'); END")
    with pytest.raises(sqlite3.DatabaseError, match="privacy blocked"):
        lifecycle(url)(request())
    assert store.get_evidence(url, eid(1)) == event()
    assert store.get_privacy_replay_state(url)["replay_complete"] is not False


def test_later_privacy_operation_preserves_prior_retention_policy_basis(db):
    url, _ = db
    store.append_export_record(url, export(), destination_policy={"deletion_support": "SUPPORTED"})
    retained = request()
    retained["policy"].update(export_records="RETAIN", retention_reason_code="APPROVED_EXPORT_RETENTION")
    lifecycle(url)(retained)
    other = request()
    other["learner_id"] = "learner:b"
    other["policy"]["policy_ref"] = "policy:second"
    lifecycle(url)(other)
    assert store.read_export_records(url) == [export()]
    assert any(p["policy_ref"] == "policy:approved" and p.get("retention_reason_code") == "APPROVED_EXPORT_RETENTION"
               for p in store.get_privacy_replay_state(url).get("policies", []))
