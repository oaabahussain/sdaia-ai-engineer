import json
import sqlite3

from app.main import init_db
import app.evidence_store as evidence_store


def record(record_id="10000000-0000-4000-8000-000000000001", target="learner:b"):
    return {
        "schema_version": 1,
        "identity_link_record_id": record_id,
        "link_id": "link-1",
        "action": "LINK",
        "source_learner_id": "learner:a",
        "target_learner_id": target,
        "effective_at": "2026-10-03T10:00:00Z",
        "authority_ref": "authority:test",
        "reason_code": "ACCOUNT_LINK",
        "created_at": "2026-10-03T10:00:00Z",
    }


def test_sqlite_identity_link_store_is_additive_and_idempotent(tmp_path):
    append = getattr(evidence_store, "append_identity_link_record", None)
    read_all = getattr(evidence_store, "read_identity_link_records", None)
    assert callable(append), "append_identity_link_record behavior is missing"
    assert callable(read_all), "read_identity_link_records behavior is missing"
    db_url = f"sqlite:///{tmp_path / 'links.db'}"
    init_db(db_url)
    first = append(db_url, record())
    duplicate = append(db_url, record())
    assert first["disposition"] == "ACCEPTED"
    assert duplicate["disposition"] == "DUPLICATE"
    assert read_all(db_url) == [record()]

    with sqlite3.connect(tmp_path / "links.db") as db:
        rows = db.execute("SELECT record_json FROM k3_identity_link_records ORDER BY record_seq").fetchall()
    assert len(rows) == 1
    assert json.loads(rows[0][0]) == record()


def test_sqlite_identity_link_store_rejects_same_record_id_with_different_body(tmp_path):
    append = getattr(evidence_store, "append_identity_link_record", None)
    assert callable(append), "append_identity_link_record behavior is missing"
    db_url = f"sqlite:///{tmp_path / 'conflict.db'}"
    init_db(db_url)
    append(db_url, record())
    try:
        append(db_url, record(target="learner:c"))
    except ValueError as exc:
        assert "conflict" in str(exc).lower()
    else:
        raise AssertionError("identity-link record conflict must fail closed")


def test_identity_link_table_is_additive_to_raw_evidence_schema(tmp_path):
    db_url = f"sqlite:///{tmp_path / 'schema.db'}"
    init_db(db_url)
    with sqlite3.connect(tmp_path / "schema.db") as db:
        tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert "k3_evidence_events" in tables
    assert "k3_identity_link_records" in tables


def test_sqlite_identity_link_store_rejects_direct_pii_principals(tmp_path):
    append = getattr(evidence_store, "append_identity_link_record", None)
    db_url = f"sqlite:///{tmp_path / 'pii-links.db'}"
    init_db(db_url)
    for field, value in (
        ("source_learner_id", "person@example.com"),
        ("target_learner_id", "+1 555 123 4567"),
        ("source_learner_id", "192.0.2.55"),
    ):
        bad = record(record_id=f"10000000-0000-4000-8000-00000000000{len(value)%9+1}")
        bad[field] = value
        try:
            append(db_url, bad)
        except ValueError as exc:
            assert "pseudonymous" in str(exc).lower() or "pii" in str(exc).lower()
        else:
            raise AssertionError(f"{field} direct PII must fail closed")
