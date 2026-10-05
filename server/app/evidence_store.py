import hashlib
import math
import copy
from app.evidence_validation import validate_evidence
import json
import re
import sqlite3
import uuid
from contextlib import closing
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


QUERY_COLUMNS = (
    'domain_id', 'form_id', 'item_interaction_id', 'locale', 'mode',
    'objective_id', 'occurred_at', 'question_family_id', 'track_id',
)


def migrate_evidence_query_columns(db):
    """Add metadata columns from verified raw events; never rewrite evidence.

    The caller holds a write transaction, so concurrent initializers cannot
    both decide to add the same column. SAVEPOINT keeps a failure atomic even
    for callers that choose to catch the exception inside that transaction.
    """
    db.execute('SAVEPOINT k3_query_columns')
    try:
        existing = {row[1] for row in db.execute('PRAGMA table_info(k3_evidence_events)')}
        missing = [key for key in QUERY_COLUMNS if key not in existing]
        if missing:
            for key in missing:
                db.execute(f'ALTER TABLE k3_evidence_events ADD COLUMN {key} TEXT')
            rows = db.execute('SELECT store_seq, event_json, event_fingerprint FROM k3_evidence_events').fetchall()
            for row in rows:
                event = json.loads(row['event_json'])
                if validate_evidence(event) or _fingerprint(event) != row['event_fingerprint']:
                    raise ValueError('Cannot migrate corrupt evidence')
                assignments = ', '.join(f'{key} = ?' for key in missing)
                db.execute(f'UPDATE k3_evidence_events SET {assignments} WHERE store_seq = ?',
                           [event.get(key) for key in missing] + [row['store_seq']])
        db.execute('RELEASE k3_query_columns')
    except Exception:
        db.execute('ROLLBACK TO k3_query_columns')
        db.execute('RELEASE k3_query_columns')
        raise


def _store_id(db):
    row = db.execute("SELECT store_id FROM k3_evidence_store_meta WHERE id = 1").fetchone()
    if row:
        return row["store_id"]
    store_id = f"sqlite-k3:{uuid.uuid4()}"
    db.execute("INSERT INTO k3_evidence_store_meta (id, store_id) VALUES (1, ?) ON CONFLICT(id) DO NOTHING", (store_id,))
    return db.execute("SELECT store_id FROM k3_evidence_store_meta WHERE id = 1").fetchone()["store_id"]


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
    event = copy.deepcopy(event)
    validation = validate_evidence(event)
    if validation:
        raise ValueError(validation)
    fingerprint = _fingerprint(event)
    with closing(_connect(db_url)) as db, db:
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
            if row["event_id"] == event["event_id"]:
                return (_stored_receipt(row, "DUPLICATE") if row["event_fingerprint"] == fingerprint
                        else _conflict_receipt(store_id, event, fingerprint, "EVENT_ID_CONFLICT"))
            return _conflict_receipt(store_id, event, fingerprint, "ORIGIN_SEQ_CONFLICT")

        accepted_at = _now_iso()
        cursor = db.execute(
            """
            INSERT INTO k3_evidence_events (
              store_id, event_id, event_fingerprint, origin_id, origin_seq,
              learner_id, activity_id, assessment_attempt_id, item_version_id,
              content_release_id, definition_id, accepted_at, event_json,
              domain_id, form_id, item_interaction_id, locale, mode,
              objective_id, occurred_at, question_family_id, track_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT DO NOTHING
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
                *(event.get(key) for key in QUERY_COLUMNS),
            ),
        )
        if cursor.rowcount == 0:
            # Another connection may have committed after the optimistic reads.
            # Re-select after the constraint-protected insert; never update history.
            same_id = db.execute(
                "SELECT * FROM k3_evidence_events WHERE store_id = ? AND event_id = ?",
                (store_id, event["event_id"]),
            ).fetchone()
            if same_id:
                return (_stored_receipt(same_id, "DUPLICATE") if same_id["event_fingerprint"] == fingerprint
                        else _conflict_receipt(store_id, event, fingerprint, "EVENT_ID_CONFLICT"))
            same_origin = db.execute(
                "SELECT * FROM k3_evidence_events WHERE store_id = ? AND origin_id = ? AND origin_seq = ?",
                (store_id, event["origin_id"], event["origin_seq"]),
            ).fetchone()
            if same_origin:
                return _conflict_receipt(store_id, event, fingerprint, "ORIGIN_SEQ_CONFLICT")
            raise RuntimeError("Evidence insertion failed without an identity conflict")
        row = db.execute(
            "SELECT * FROM k3_evidence_events WHERE store_seq = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return _stored_receipt(row, "ACCEPTED")


def _assert_batch_encoding(value):
    if isinstance(value, bool) or value is None or isinstance(value, str):
        return
    if isinstance(value, (int, float)):
        if not math.isfinite(value) or (value % 1 == 0 and abs(value) > 9007199254740991):
            raise ValueError('batch numeric value is not interoperable')
    elif isinstance(value, list):
        for item in value:
            _assert_batch_encoding(item)
    elif isinstance(value, dict) and all(isinstance(key, str) for key in value):
        for item in value.values():
            _assert_batch_encoding(item)
    else:
        raise ValueError('batch must contain JSON values')


def prepare_evidence_batch(events):
    if not isinstance(events, list):
        raise ValueError('events must be an array')
    prepared = []
    for event in copy.deepcopy(events):
        identity = event.get('event_id') if isinstance(event, dict) else None
        if not isinstance(identity, str) or not re.fullmatch(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}', identity):
            raise ValueError('batch event identity cannot form a receipt')
        _assert_batch_encoding(event)
        prepared.append((event, _fingerprint(event), validate_evidence(event)))
    return prepared


def accept_evidence_batch(db_url, events):
    prepared = prepare_evidence_batch(events)
    receipts = []
    for event, fingerprint, invalid in prepared:
        if invalid:
            with closing(_connect(db_url)) as db, db:
                store_id = _store_id(db)
            receipts.append({
                'schema_version': 1, 'store_id': store_id, 'event_id': event['event_id'],
                'event_fingerprint': fingerprint, 'disposition': 'REJECTED',
                'accepted_at': _now_iso(), 'reason_code': 'INVALID_EVIDENCE', 'warnings': [],
            })
        else:
            receipts.append(accept_evidence(db_url, event))
    return {'schema_version': 1, 'receipts': receipts}


def get_evidence(db_url, event_id):
    with closing(_connect(db_url)) as db, db:
        store_id = _store_id(db)
        row = db.execute(
            "SELECT event_json FROM k3_evidence_events WHERE store_id = ? AND event_id = ?",
            (store_id, event_id),
        ).fetchone()
        return None if row is None else json.loads(row["event_json"])


def read_evidence(db_url, learner_id, after_store_seq=None, filters=None):
    if after_store_seq is not None and (type(after_store_seq) is not int or not 0 <= after_store_seq <= 9007199254740991):
        raise ValueError("after_store_seq must be a nonnegative safe integer")
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

    with closing(_connect(db_url)) as db, db:
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


def _assert_pseudonymous_principal(value, field):
    if not isinstance(value, str) or not value or "@" in value or re.fullmatch(r"\+?\d[\d\s().-]{6,}", value):
        raise ValueError(f"{field} must be a pseudonymous principal and must not contain direct PII")


def _identity_link_json(record):
    return json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def append_identity_link_record(db_url, record):
    record = copy.deepcopy(record)
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
    _assert_pseudonymous_principal(record["source_learner_id"], "source_learner_id")
    _assert_pseudonymous_principal(record["target_learner_id"], "target_learner_id")
    body = _identity_link_json(record)
    with closing(_connect(db_url)) as db, db:
        previous = db.execute(
            "SELECT record_json FROM k3_identity_link_records WHERE identity_link_record_id = ?",
            (record["identity_link_record_id"],),
        ).fetchone()
        if previous:
            if previous["record_json"] == body:
                return {"disposition": "DUPLICATE", "identity_link_record_id": record["identity_link_record_id"]}
            raise ValueError(f"identity-link record conflict: {record['identity_link_record_id']}")
        inserted = db.execute(
            """
            INSERT INTO k3_identity_link_records (
              identity_link_record_id, link_id, action, source_learner_id, target_learner_id,
              effective_at, authority_ref, reason_code, predecessor_record_id, created_at, record_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(identity_link_record_id) DO NOTHING
            """,
            (
                record["identity_link_record_id"], record["link_id"], record["action"],
                record["source_learner_id"], record["target_learner_id"], record["effective_at"],
                record["authority_ref"], record["reason_code"], record.get("predecessor_record_id"),
                record["created_at"], body,
            ),
        )
        if inserted.rowcount == 0:
            # Another connection may have committed after the initial SELECT.
            previous = db.execute(
                "SELECT record_json FROM k3_identity_link_records WHERE identity_link_record_id = ?",
                (record["identity_link_record_id"],),
            ).fetchone()
            if previous and previous["record_json"] == body:
                return {"disposition": "DUPLICATE", "identity_link_record_id": record["identity_link_record_id"]}
            raise ValueError(f"identity-link record conflict: {record['identity_link_record_id']}")
        return {"disposition": "ACCEPTED", "identity_link_record_id": record["identity_link_record_id"]}


def read_identity_link_records(db_url):
    with closing(_connect(db_url)) as db, db:
        rows = db.execute(
            "SELECT record_json FROM k3_identity_link_records ORDER BY record_seq ASC"
        ).fetchall()
        return [json.loads(row["record_json"]) for row in rows]


# These privileged lifecycle functions are not exposed by the ordinary evidence
# port or HTTP routes. Deployment must inject an authorizer checking both the
# subject/operation and the referenced policy, not just authority_ref presence.
def _privacy_request(value):
    import copy
    if not isinstance(value, dict):
        raise ValueError("privacy policy request is required")
    request = copy.deepcopy(value)
    _assert_pseudonymous_principal(request.get("learner_id"), "learner_id")
    for field in ("authority_ref", "reason_code"):
        if not isinstance(request.get(field), str) or not request[field].strip():
            raise ValueError(f"privacy {field} is required")
    policy = request.get("policy")
    if (not isinstance(policy, dict)
            or not isinstance(policy.get("policy_ref"), str) or not policy["policy_ref"].strip()
            or request.get("operation") not in ("DELETE", "DELINK")
            or policy.get("projection_caches") != "INVALIDATE_ALL"
            or policy.get("export_records") not in ("ERASE", "RETAIN")
            or policy.get("linked_metadata") != ("ERASE" if request["operation"] == "DELETE" else "RETAIN")):
        raise ValueError("unsupported privacy policy or linked metadata disposition")
    if (policy["linked_metadata"] == "RETAIN" or policy["export_records"] == "RETAIN") and (
            not isinstance(policy.get("retention_reason_code"), str) or not policy["retention_reason_code"].strip()):
        raise ValueError("retention requires a documented policy reason")
    return request


def create_privacy_lifecycle(db_url, *, authorize):
    import copy
    from contextlib import closing
    if not callable(authorize):
        raise TypeError("privacy authorization callback is required")

    def apply(value):
        request = _privacy_request(value)
        if authorize(copy.deepcopy(request)) is not True:
            raise PermissionError("privacy authorization denied")
        learner = request["learner_id"]
        with closing(_connect(db_url)) as db, db:
            db.execute("BEGIN IMMEDIATE")
            if request["policy"]["export_records"] == "ERASE":
                db.execute("DELETE FROM k3_evidence_export_records WHERE learner_id = ?", (learner,))
            db.execute("""DELETE FROM k3_identity_link_records WHERE link_id IN (
                SELECT link_id FROM k3_identity_link_records
                WHERE source_learner_id = ? OR target_learner_id = ?)""", (learner, learner))
            # No dependency index exists yet; the policy explicitly authorizes
            # invalidating every projection, including cross-principal caches.
            db.execute("DELETE FROM k3_projection_caches")
            if request["operation"] == "DELETE":
                # Raw bytes, fingerprints and receipt metadata share these rows.
                db.execute("DELETE FROM k3_evidence_events WHERE learner_id = ?", (learner,))
            policy = {key: request["policy"][key] for key in (
                "policy_ref", "linked_metadata", "export_records", "projection_caches", "retention_reason_code"
            ) if key in request["policy"]}
            prior = db.execute("SELECT policy_json FROM k3_privacy_replay_state WHERE id = 1").fetchone()
            policies = json.loads(prior["policy_json"]) if prior else []
            if not isinstance(policies, list):
                raise ValueError("invalid privacy policy history")
            if policy not in policies:
                policies.append(policy)
            db.execute("""INSERT INTO k3_privacy_replay_state (id, replay_complete, policy_json)
                VALUES (1, 0, ?) ON CONFLICT(id) DO UPDATE SET
                replay_complete = 0, policy_json = excluded.policy_json""", (_event_json(policies),))
        return {"status": "APPLIED", "replay_complete": False, "external_deletion": "NOT_PERFORMED"}

    return apply


def get_privacy_replay_state(db_url):
    from contextlib import closing
    with closing(_connect(db_url)) as db:
        row = db.execute("SELECT * FROM k3_privacy_replay_state WHERE id = 1").fetchone()
        # No privacy operation is not proof of complete historical replay.
        if row is None:
            return {"replay_complete": None, "policies": []}
        policies = json.loads(row["policy_json"])
        return {"replay_complete": False, "policy": policies[-1], "policies": policies}


def _validate_export_record(record):
    from pathlib import Path
    from jsonschema import Draft7Validator, FormatChecker
    schema = json.loads((Path(__file__).resolve().parents[2] / "data/schema/evidence-export-record-v1.schema.json").read_text())
    errors = list(Draft7Validator(schema, format_checker=FormatChecker()).iter_errors(record))
    if errors:
        raise ValueError("invalid export schema")


def _validate_export_destination(policy):
    if not isinstance(policy, dict) or policy.get("deletion_support") not in ("SUPPORTED", "UNSUPPORTED"):
        raise ValueError("destination deletion support is unknown")
    if policy["deletion_support"] == "UNSUPPORTED" and (
            not isinstance(policy.get("limitation_ref"), str) or not policy["limitation_ref"].strip()):
        raise ValueError("unsupported destination deletion requires a documented limitation")


def _read_valid_export_history(db):
    rows = db.execute('SELECT * FROM k3_evidence_export_records ORDER BY record_seq ASC').fetchall()
    seen, children, owners, records = {}, set(), {}, []
    identity = ('event_id', 'adapter_id', 'adapter_version', 'destination_class', 'mapping_version', 'external_ref')
    for stored in rows:
        record = json.loads(stored['record_json'])
        _validate_export_record(record)
        key = record['export_record_id']
        if key in seen or key != stored['export_record_id'] or record['event_id'] != stored['event_id']:
            raise ValueError('invalid persisted export identity')
        if record['action'] == 'EXPORTED':
            if record.get('predecessor_record_id'):
                raise ValueError('export root cannot have a predecessor')
        else:
            parent_id = record.get('predecessor_record_id')
            parent = seen.get(parent_id)
            if not parent or any(parent.get(field) != record.get(field) for field in identity) or owners[parent_id] != stored['learner_id']:
                raise ValueError('export predecessor identity mismatch')
            valid = (parent['action'] in ('EXPORTED', 'DELETION_FAILED', 'DELETION_UNSUPPORTED')
                     if record['action'] == 'DELETE_REQUESTED' else parent['action'] == 'DELETE_REQUESTED')
            if not valid:
                raise ValueError('invalid export predecessor transition')
            if parent_id in children:
                raise ValueError('export predecessor conflict')
            children.add(parent_id)
        seen[key], owners[key] = record, stored['learner_id']
        records.append(record)
    return records


def append_export_record(db_url, record, *, destination_policy=None):
    import copy
    from contextlib import closing
    record = copy.deepcopy(record)
    _validate_export_record(record)
    body = _event_json(record)
    with closing(_connect(db_url)) as db, db:
        db.execute("BEGIN IMMEDIATE")
        _read_valid_export_history(db)
        previous = db.execute("SELECT * FROM k3_evidence_export_records WHERE export_record_id = ?",
                              (record["export_record_id"],)).fetchone()
        if previous:
            if previous["record_json"] != body:
                raise ValueError("export record conflict")
            return {"disposition": "DUPLICATE", "export_record_id": record["export_record_id"]}
        if record["action"] == "EXPORTED":
            _validate_export_destination(destination_policy)
            if record.get("predecessor_record_id"):
                raise ValueError("export root cannot have a predecessor")
            event = db.execute("SELECT learner_id FROM k3_evidence_events WHERE event_id = ?",
                               (record["event_id"],)).fetchone()
            if event is None:
                raise ValueError("export must reference existing evidence")
            learner_id = event["learner_id"]
        else:
            predecessor = db.execute("SELECT * FROM k3_evidence_export_records WHERE export_record_id = ?",
                                     (record.get("predecessor_record_id"),)).fetchone()
            if predecessor is None:
                raise ValueError("export predecessor is missing")
            parent = json.loads(predecessor["record_json"])
            if any(parent.get(key) != record.get(key) for key in (
                    "event_id", "adapter_id", "adapter_version", "destination_class", "mapping_version", "external_ref")):
                raise ValueError("export predecessor identity mismatch")
            valid = (parent["action"] in ("EXPORTED", "DELETION_FAILED", "DELETION_UNSUPPORTED")
                     if record["action"] == "DELETE_REQUESTED" else parent["action"] == "DELETE_REQUESTED")
            if not valid:
                raise ValueError("invalid export predecessor transition")
            for row in db.execute("SELECT record_json FROM k3_evidence_export_records WHERE event_id = ?", (record["event_id"],)):
                if json.loads(row["record_json"]).get("predecessor_record_id") == parent["export_record_id"]:
                    raise ValueError("export predecessor conflict")
            learner_id = predecessor["learner_id"]
        db.execute("""INSERT INTO k3_evidence_export_records
            (export_record_id, event_id, learner_id, record_json) VALUES (?, ?, ?, ?)""",
                   (record["export_record_id"], record["event_id"], learner_id, body))
    return {"disposition": "ACCEPTED", "export_record_id": record["export_record_id"]}


def read_export_records(db_url):
    from contextlib import closing
    with closing(_connect(db_url)) as db:
        return _read_valid_export_history(db)
