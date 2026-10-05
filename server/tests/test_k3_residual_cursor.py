from fastapi.testclient import TestClient
from app.main import create_app,init_db
from app.evidence_auth import StaticLearnerAuthorization
from app.evidence_store import accept_evidence
from test_k3_residual_security import event


def test_http_cursor_binds_stable_store_and_rejects_foreign_or_missing_source(tmp_path):
    url=f'sqlite:///{tmp_path / "cursor.db"}';init_db(url);receipt=accept_evidence(url,event())
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))) as client:
        initial=client.get('/v1/learner-evidence').json()
        assert initial.get('store_id')==receipt['store_id']
        query={'after_store_seq':1,'source_store_id':initial['store_id']}
        assert client.get('/v1/learner-evidence',params=query).status_code==200
        query['source_store_id']='wrong-store'
        assert client.get('/v1/learner-evidence',params=query).status_code==409
        assert client.get('/v1/learner-evidence?after_store_seq=1').status_code==400
