import pytest
from fastapi.testclient import TestClient

from app.evidence_auth import StaticLearnerAuthorization
from app.main import create_app


LEARNER = "learner:authorized"


def event(event_id="123e4567-e89b-42d3-a456-426614174000", origin_seq=1, **overrides):
    value = {
        "schema_version": 2,
        "event_id": event_id,
        "definition_id": "learner.response.recorded@1",
        "learner_id": LEARNER,
        "origin_id": "223e4567-e89b-42d3-a456-426614174001",
        "origin_seq": origin_seq,
        "activity_id": "323e4567-e89b-42d3-a456-426614174002",
        "track_id": "sdaia-ai-engineer",
        "content_release_id": "sdaia-ai-engineer.bootstrap.v1",
        "mode": "practice",
        "locale": "en",
        "occurred_at": "2026-10-02T20:00:00Z",
        "item_interaction_id": "423e4567-e89b-42d3-a456-426614174003",
        "item_version_id": "item-v1",
        "payload": {
            "response_version": 1,
            "response_kind": "OPTION",
            "response": {"option_index": 0},
        },
    }
    value.update(overrides)
    return value


@pytest.fixture
def client(tmp_path):
    app = create_app(
        f"sqlite:///{tmp_path / 'evidence-api.db'}",
        learner_auth=StaticLearnerAuthorization(LEARNER),
    )
    return TestClient(app)


def post_batch(client, events):
    return client.post("/v1/learner-evidence/batch", json={"events": events})


def test_authorized_batch_accepts_and_exact_retry_duplicates(client):
    first = post_batch(client, [event()])
    assert first.status_code == 200
    first_receipt = first.json()["receipts"][0]
    assert first_receipt["disposition"] == "ACCEPTED"
    assert first_receipt["store_seq"] == 1

    retry = post_batch(client, [event()])
    assert retry.status_code == 200
    duplicate = retry.json()["receipts"][0]
    assert duplicate["disposition"] == "DUPLICATE"
    assert duplicate["store_seq"] == first_receipt["store_seq"]
    assert duplicate["accepted_at"] == first_receipt["accepted_at"]


def test_batch_reports_conflict_without_rewriting_accepted_event(client):
    assert post_batch(client, [event()]).status_code == 200
    changed = event(payload={
        "response_version": 1,
        "response_kind": "OPTION",
        "response": {"option_index": 1},
    })
    response = post_batch(client, [changed])
    assert response.status_code == 200
    receipt = response.json()["receipts"][0]
    assert receipt["disposition"] == "CONFLICT"
    assert receipt["reason_code"] == "EVENT_ID_CONFLICT"


def test_invalid_event_is_rejected_per_event_and_safe_sibling_is_accepted(client):
    invalid = event(
        event_id="523e4567-e89b-42d3-a456-426614174004",
        origin_seq=2,
        definition_id="learner.unknown.event@1",
    )
    valid = event(
        event_id="623e4567-e89b-42d3-a456-426614174005",
        origin_seq=3,
        item_interaction_id="723e4567-e89b-42d3-a456-426614174006",
        item_version_id="item-v2",
    )
    response = post_batch(client, [invalid, valid])
    assert response.status_code == 200
    receipts = response.json()["receipts"]
    assert [r["disposition"] for r in receipts] == ["REJECTED", "ACCEPTED"]
    assert receipts[0]["reason_code"] == "INVALID_EVIDENCE"
    assert receipts[1]["store_seq"] == 1


def test_cross_user_event_is_rejected_before_any_write(client):
    other = event(learner_id="learner:other")
    response = post_batch(client, [other])
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "learner_not_authorized"

    valid = post_batch(client, [event()])
    assert valid.status_code == 200
    assert valid.json()["receipts"][0]["store_seq"] == 1


def test_default_fail_closed_authorization_denies_batch(tmp_path):
    client = TestClient(create_app(f"sqlite:///{tmp_path / 'deny.db'}"))
    response = client.post("/v1/learner-evidence/batch", json={"events": [event()]})
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "learner_not_authorized"


def test_pull_is_ordered_cursor_based_and_repeatable(client):
    events = [
        event(),
        event(
            event_id="723e4567-e89b-42d3-a456-426614174006",
            origin_seq=2,
            item_interaction_id="823e4567-e89b-42d3-a456-426614174007",
            item_version_id="item-v2",
        ),
        event(
            event_id="923e4567-e89b-42d3-a456-426614174008",
            origin_seq=3,
            item_interaction_id="a23e4567-e89b-42d3-a456-426614174009",
            item_version_id="item-v3",
        ),
    ]
    assert post_batch(client, events).status_code == 200

    first = client.get("/v1/learner-evidence?after_store_seq=0&limit=2")
    assert first.status_code == 200
    assert [item["event_id"] for item in first.json()["events"]] == [events[0]["event_id"], events[1]["event_id"]]
    assert first.json()["next_store_seq"] == 2

    replay = client.get("/v1/learner-evidence?after_store_seq=0&limit=2")
    assert replay.json() == first.json()

    second = client.get("/v1/learner-evidence?after_store_seq=2&limit=2")
    assert second.status_code == 200
    assert [item["event_id"] for item in second.json()["events"]] == [events[2]["event_id"]]
    assert second.json()["next_store_seq"] == 3


def test_pull_limit_is_bounded_by_configured_policy(tmp_path, monkeypatch):
    monkeypatch.setenv("K3_EVIDENCE_PULL_MAX_LIMIT", "2")
    client = TestClient(create_app(
        f"sqlite:///{tmp_path / 'bounded.db'}",
        learner_auth=StaticLearnerAuthorization(LEARNER),
    ))
    events = [
        event(),
        event(
            event_id="b23e4567-e89b-42d3-a456-426614174010",
            origin_seq=2,
            item_interaction_id="c23e4567-e89b-42d3-a456-426614174011",
            item_version_id="item-v2",
        ),
        event(
            event_id="d23e4567-e89b-42d3-a456-426614174012",
            origin_seq=3,
            item_interaction_id="e23e4567-e89b-42d3-a456-426614174013",
            item_version_id="item-v3",
        ),
    ]
    assert post_batch(client, events).status_code == 200
    response = client.get("/v1/learner-evidence?after_store_seq=0&limit=99")
    assert response.status_code == 200
    assert len(response.json()["events"]) == 2
    assert response.json()["next_store_seq"] == 2


def test_pull_scope_is_selected_by_authorization_not_query_claim(tmp_path):
    db_url = f"sqlite:///{tmp_path / 'scoped.db'}"
    first = TestClient(create_app(db_url, learner_auth=StaticLearnerAuthorization(LEARNER)))
    other_id = "learner:other"
    second = TestClient(create_app(db_url, learner_auth=StaticLearnerAuthorization(other_id)))

    assert post_batch(first, [event()]).status_code == 200
    other_event = event(
        event_id="f23e4567-e89b-42d3-a456-426614174014",
        learner_id=other_id,
        origin_id="123e4567-e89b-42d3-a456-426614174099",
    )
    assert post_batch(second, [other_event]).status_code == 200

    response = first.get("/v1/learner-evidence?after_store_seq=0&limit=10&learner_id=learner:other")
    assert response.status_code == 200
    assert [item["learner_id"] for item in response.json()["events"]] == [LEARNER]


def test_pull_rejects_invalid_cursor_and_default_auth(tmp_path):
    authorized = TestClient(create_app(
        f"sqlite:///{tmp_path / 'invalid-cursor.db'}",
        learner_auth=StaticLearnerAuthorization(LEARNER),
    ))
    assert authorized.get("/v1/learner-evidence?after_store_seq=-1&limit=10").status_code == 400
    assert authorized.get("/v1/learner-evidence?after_store_seq=0&limit=0").status_code == 400

    denied = TestClient(create_app(f"sqlite:///{tmp_path / 'pull-denied.db'}"))
    response = denied.get("/v1/learner-evidence?after_store_seq=0&limit=10")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "learner_not_authorized"
