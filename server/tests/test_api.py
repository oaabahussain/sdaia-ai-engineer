import json
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import RATE, create_app

ANON = '123e4567-e89b-42d3-a456-426614174000'
OTHER = '123e4567-e89b-42d3-a456-426614174001'

def state():
    now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    return {
        'version': 1, 'anon_id': ANON, 'created_at': now, 'updated_at': now,
        'answers': [], 'review': [], 'bookmarks': [], 'notes': {},
        'settings': {'session_minutes': 20, 'exam_date': None, 'dark': False, 'focus': False},
        'onboarded': False, 'profile': {}, 'answer_map': {}, 'attempts': {}, 'confidence': {},
        'mastered': {}, 'review_map': {}, 'errors': {}, 'bookmark_map': {}, 'sessions': {},
        'activity': {}, 'diagnostic': {}, 'theme': 'auto', 'focus': False,
    }

@pytest.fixture
def client(tmp_path):
    RATE.clear()
    return TestClient(create_app(f"sqlite:///{tmp_path / 'test.db'}"))

def headers(anon=ANON): return {'X-Anon-Id': anon}

def test_health(client): assert client.get('/v1/health').json() == {'status': 'ok'}
def test_bank(client): assert len(client.get('/v1/bank', headers=headers()).json()['questions']) == 121
def test_bank_bad_uuid(client): assert client.get('/v1/bank', headers=headers('bad')).status_code == 400
def test_progress_missing(client): assert client.get(f'/v1/progress/{ANON}', headers=headers()).status_code == 404
def test_progress_header_mismatch(client): assert client.get(f'/v1/progress/{ANON}', headers=headers(OTHER)).status_code == 400
def test_progress_create(client): assert client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '0'}, json=state()).status_code == 200
def test_progress_roundtrip(client):
    client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '0'}, json=state())
    response = client.get(f'/v1/progress/{ANON}', headers=headers())
    assert response.status_code == 200 and response.headers['etag'] == '1'
def test_progress_conflict(client):
    client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '0'}, json=state())
    assert client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '0'}, json=state()).status_code == 409
def test_progress_update(client):
    client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '0'}, json=state())
    assert client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '1'}, json=state()).headers['etag'] == '2'
def test_progress_invalid_body(client): assert client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '0'}, json={'anon_id': ANON}).status_code == 400
def test_progress_state_id_mismatch(client):
    payload = state(); payload['anon_id'] = OTHER
    assert client.put(f'/v1/progress/{ANON}', headers={**headers(), 'If-Match': '0'}, json=payload).status_code == 400
def test_feedback(client): assert client.post('/v1/feedback', headers=headers(), json={'question_id':'q1','issue_type':'other','details':'test'}).json()['ok'] is True
def test_feedback_invalid(client): assert client.post('/v1/feedback', headers=headers(), json={'question_id':'bad','issue_type':'other','details':'test'}).status_code == 400
def test_events(client): assert client.post('/v1/events', headers=headers(), json=[{'type':'open','payload':{},'created_at':'2026-09-07T00:00:00Z'}]).json() == {'ok': True}
def test_events_invalid(client): assert client.post('/v1/events', headers=headers(), json=[{'payload':{}}]).status_code == 400
def test_missing_header(client): assert client.get('/v1/bank').status_code == 422
