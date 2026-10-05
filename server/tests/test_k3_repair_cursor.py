import pytest
from fastapi.testclient import TestClient
from app.main import create_app, init_db
from app.evidence_auth import StaticLearnerAuthorization
from app.evidence_store import read_evidence

MAX_CURSOR = 9007199254740991

@pytest.mark.parametrize('cursor', [-1, 2**53, 2**63, 10**100])
def test_F07_http_rejects_invalid_cursor_before_database(tmp_path, cursor):
    app = create_app(db_url=f'sqlite:///{tmp_path}/cursor.db', learner_auth=StaticLearnerAuthorization('learner:a'))
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get('/v1/learner-evidence', params={'after_store_seq': cursor})
    assert response.status_code == 400, response.text
    assert response.json()['error']['code'] == 'validation_failed'

@pytest.mark.parametrize('cursor', [0, MAX_CURSOR])
def test_F07_http_accepts_safe_cursor_endpoints(tmp_path, cursor):
    app = create_app(db_url=f'sqlite:///{tmp_path}/cursor.db', learner_auth=StaticLearnerAuthorization('learner:a'))
    with TestClient(app) as client:
        source = client.get('/v1/learner-evidence').json()['store_id']
        response = client.get('/v1/learner-evidence', params={'after_store_seq': cursor, 'source_store_id': source})
    assert response.status_code == 200
    assert response.json() == {'store_id': source, 'events': [], 'next_store_seq': cursor}

def test_F07_authorization_remains_default_deny(tmp_path):
    with TestClient(create_app(db_url=f'sqlite:///{tmp_path}/deny.db')) as client:
        response = client.get('/v1/learner-evidence', params={'after_store_seq': 10**100})
    assert response.status_code == 403

@pytest.mark.parametrize('cursor', [-1, True, 0.5, 2**53, 10**100])
def test_F07_direct_store_rejects_unrepresentable_cursor(tmp_path, cursor):
    url=f'sqlite:///{tmp_path}/direct.db'; init_db(url)
    try:
        read_evidence(url,'learner:a',after_store_seq=cursor)
        result='accepted'
    except ValueError:
        result='rejected'
    except Exception as exc:
        result=type(exc).__name__
    assert result == 'rejected', result
