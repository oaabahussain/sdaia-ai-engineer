import hashlib
import json
import sqlite3

import rfc8785

from app.main import init_db


def legacy_text_response_event():
    return {
        "schema_version": 2,
        "event_id": "123e4567-e89b-42d3-a456-426614174000",
        "definition_id": "learner.response.recorded@1",
        "learner_id": "learner:legacy",
        "origin_id": "223e4567-e89b-42d3-a456-426614174001",
        "origin_seq": 1,
        "activity_id": "323e4567-e89b-42d3-a456-426614174002",
        "track_id": "sdaia-ai-engineer",
        "content_release_id": "legacy.release.v1",
        "mode": "practice",
        "locale": "en",
        "occurred_at": "2026-09-29T00:00:00Z",
        "item_interaction_id": "423e4567-e89b-42d3-a456-426614174003",
        "item_version_id": "legacy-item-v1",
        "payload": {
            "response_version": 1,
            "response_kind": "TEXT",
            "response": {"text": "legacy answer"},
        },
    }


def test_query_column_migration_grandfathers_schema_valid_legacy_response(tmp_path):
    path = tmp_path / "legacy-query-columns.db"
    db_url = f"sqlite:///{path}"
    event = legacy_text_response_event()
    body = json.dumps(event, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    fingerprint = hashlib.sha256(rfc8785.dumps(event)).hexdigest()

    with sqlite3.connect(path) as db:
        db.execute(
            """
            CREATE TABLE k3_evidence_events (
              store_seq INTEGER PRIMARY KEY AUTOINCREMENT,
              store_id TEXT NOT NULL,
              event_id TEXT NOT NULL,
              event_fingerprint TEXT NOT NULL,
              origin_id TEXT NOT NULL,
              origin_seq INTEGER NOT NULL CHECK (origin_seq >= 1),
              learner_id TEXT NOT NULL,
              activity_id TEXT NOT NULL,
              assessment_attempt_id TEXT,
              item_version_id TEXT,
              content_release_id TEXT NOT NULL,
              definition_id TEXT NOT NULL,
              accepted_at TEXT NOT NULL,
              event_json TEXT NOT NULL,
              UNIQUE (store_id, event_id),
              UNIQUE (store_id, origin_id, origin_seq)
            )
            """
        )
        db.execute(
            """
            INSERT INTO k3_evidence_events (
              store_id, event_id, event_fingerprint, origin_id, origin_seq,
              learner_id, activity_id, assessment_attempt_id, item_version_id,
              content_release_id, definition_id, accepted_at, event_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "sqlite-k3:legacy",
                event["event_id"],
                fingerprint,
                event["origin_id"],
                event["origin_seq"],
                event["learner_id"],
                event["activity_id"],
                None,
                event["item_version_id"],
                event["content_release_id"],
                event["definition_id"],
                "2026-09-29T00:00:01Z",
                body,
            ),
        )

    init_db(db_url)

    with sqlite3.connect(path) as db:
        db.row_factory = sqlite3.Row
        row = db.execute(
            """
            SELECT event_json, event_fingerprint, item_interaction_id, locale,
                   mode, occurred_at, track_id
            FROM k3_evidence_events
            WHERE event_id = ?
            """,
            (event["event_id"],),
        ).fetchone()

    assert row is not None
    assert row["event_json"] == body
    assert row["event_fingerprint"] == fingerprint
    assert row["item_interaction_id"] == event["item_interaction_id"]
    assert row["locale"] == event["locale"]
    assert row["mode"] == event["mode"]
    assert row["occurred_at"] == event["occurred_at"]
    assert row["track_id"] == event["track_id"]
