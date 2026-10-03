import hashlib
import json
import sqlite3
import uuid
from datetime import datetime, timezone

import rfc8785


def _sqlite_path(db_url):
    value = db_url or "sqlite:///./dev.db"
    if not value.startswith("sqlite:///"):
        raise RuntimeError("K3 EvidenceStore supports sqlite:/// DB_URL values only")
    path = value[len("sqlite:///"):]
    return path or "./dev.db"


def _connect(db_url):
    db = sqlite3.connect(_sqlite_path(db_url))
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def _now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _fingerprint(event):
    return hashlib.sha256(rfc8785.dumps(event)).hexdigest()


def _event_json(event):
    return json.dumps(event, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _store_id(db):
    row = db.execute("SELECT store_id FROM k3_evidence_store_meta WHERE id = 1").fetchone()
    if row:
        return row["store_id"]
    store_id = f"sqlite-k3:{uuid.uuid4()}"
    db.execute("INSERT INTO k3_evidence_store_meta (id, store_id) VALUES (1, ?)", (store_id,))
    return store_id


def _stored_receipt(row, disposition):
    return {
        "schema_version": 1,
        "store_id": row["store_id"],
        "event_id": row["event_id"],
        "event_fingerprint": row["event_fingerprint"],
        "disposition": disposition,
        "accepted_at": row["accepted_at"],
        "store_seq": row["store_seq"],
        "warnings": [],
    }


def _conflict_receipt(store_id, event, fingerprint, reason_code):
    return {
        "schema_version": 1,
        "store_id": store_id,
        "event_id": event["event_id"],
        "event_fingerprint": fingerprint,
        "disposition": "CONFLICT",
        "accepted_at": _now_iso(),
        "reason_code": reason_code,
        "warnings": [],
    }


def accept_evidence(db_url, event):
    fingerprint = _fingerprint(event)
    with _connect(db_url) as db:
        store_id = _store_id(db)

        row = db.execute(
            "SELECT * FROM k3_evidence_events WHERE store_id = ? AND event_id = ?",
            (store_id, event["event_id"]),
        ).fetchone()
        if row:
            if row["event_fingerprint"] == fingerprint:
                return _stored_receipt(row, "DUPLICATE")
            return _conflict_receipt(store_id, event, fingerprint, "EVENT_ID_CONFLICT")

        row = db.execute(
            "SELECT * FROM k3_evidence_events WHERE store_id = ? AND origin_id = ? AND origin_seq = ?",
            (store_id, event["origin_id"], event["origin_seq"]),
        ).fetchone()
        if row:
            return _conflict_receipt(store_id, event, fingerprint, "ORIGIN_SEQ_CONFLICT")

        accepted_at = _now_iso()
        cursor = db.execute(
            """
            INSERT INTO k3_evidence_events (
              store_id, event_id, event_fingerprint, origin_id, origin_seq,
              learner_id, activity_id, assessment_attempt_id, item_version_id,
              content_release_id, definition_id, accepted_at, event_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                store_id,
                event["event_id"],
                fingerprint,
                event["origin_id"],
                event["origin_seq"],
                event["learner_id"],
                event["activity_id"],
                event.get("assessment_attempt_id"),
                event.get("item_version_id"),
                event["content_release_id"],
                event["definition_id"],
                accepted_at,
                _event_json(event),
            ),
        )
        row = db.execute(
            "SELECT * FROM k3_evidence_events WHERE store_seq = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return _stored_receipt(row, "ACCEPTED")


def accept_evidence_batch(db_url, events):
    return {
        "schema_version": 1,
        "receipts": [accept_evidence(db_url, event) for event in events],
    }


def get_evidence(db_url, event_id):
    with _connect(db_url) as db:
        store_id = _store_id(db)
        row = db.execute(
            "SELECT event_json FROM k3_evidence_events WHERE store_id = ? AND event_id = ?",
            (store_id, event_id),
        ).fetchone()
        return None if row is None else json.loads(row["event_json"])


def read_evidence(db_url, learner_id, after_store_seq=None, filters=None):
    filters = dict(filters or {})
    if "type" in filters:
        if "definition_id" in filters and filters["definition_id"] != filters["type"]:
            return []
        filters["definition_id"] = filters.pop("type")

    allowed = {
        "activity_id",
        "assessment_attempt_id",
        "item_version_id",
        "content_release_id",
        "definition_id",
    }
    unknown = set(filters) - allowed
    if unknown:
        raise ValueError(f"Unsupported evidence filters: {sorted(unknown)}")

    with _connect(db_url) as db:
        store_id = _store_id(db)
        clauses = ["store_id = ?", "learner_id = ?"]
        params = [store_id, learner_id]
        if after_store_seq is not None:
            clauses.append("store_seq > ?")
            params.append(after_store_seq)
        for key, value in filters.items():
            clauses.append(f"{key} = ?")
            params.append(value)

        rows = db.execute(
            "SELECT event_json FROM k3_evidence_events WHERE "
            + " AND ".join(clauses)
            + " ORDER BY store_seq ASC",
            params,
        ).fetchall()
        return [json.loads(row["event_json"]) for row in rows]


def _identity_link_json(record):
    return json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def append_identity_link_record(db_url, record):
    required = (
        "identity_link_record_id", "link_id", "action", "source_learner_id",
        "target_learner_id", "effective_at", "authority_ref", "reason_code", "created_at",
    )
    if record.get("schema_version") != 1:
        raise ValueError("identity-link schema_version must equal 1")
    if record.get("action") not in {"LINK", "UNLINK"}:
        raise ValueError("identity-link action must be LINK or UNLINK")
    for field in required:
        if not isinstance(record.get(field), str) or not record[field]:
            raise ValueError(f"identity-link {field} is required")
    body = _identity_link_json(record)
    with _connect(db_url) as db:
        previous = db.execute(
            "SELECT record_json FROM k3_identity_link_records WHERE identity_link_record_id = ?",
            (record["identity_link_record_id"],),
        ).fetchone()
        if previous:
            if previous["record_json"] == body:
                return {"disposition": "DUPLICATE", "identity_link_record_id": record["identity_link_record_id"]}
            raise ValueError(f"identity-link record conflict: {record['identity_link_record_id']}")
        db.execute(
            """
            INSERT INTO k3_identity_link_records (
              identity_link_record_id, link_id, action, source_learner_id, target_learner_id,
              effective_at, authority_ref, reason_code, predecessor_record_id, created_at, record_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["identity_link_record_id"], record["link_id"], record["action"],
                record["source_learner_id"], record["target_learner_id"], record["effective_at"],
                record["authority_ref"], record["reason_code"], record.get("predecessor_record_id"),
                record["created_at"], body,
            ),
        )
        return {"disposition": "ACCEPTED", "identity_link_record_id": record["identity_link_record_id"]}


def read_identity_link_records(db_url):
    with _connect(db_url) as db:
        rows = db.execute(
            "SELECT record_json FROM k3_identity_link_records ORDER BY record_seq ASC"
        ).fetchall()
        return [json.loads(row["record_json"]) for row in rows]
