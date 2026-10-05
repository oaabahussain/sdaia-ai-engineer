import json
import threading
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
import pytest
import app.main as main
from app.evidence_auth import StaticLearnerAuthorization
from app.evidence_store import accept_evidence_batch, read_evidence
from test_k3_repair_validation import event


def event_n(n,**extra):
    return {**event(),'event_id':f'20000000-0000-4000-8000-{n:012d}','origin_seq':n,**extra}

def test_review_F06_sqlite_batch_preserves_per_event_rejection(tmp_path):
    url=f'sqlite:///{tmp_path}/batch.db';main.init_db(url)
    events=[event_n(1),event_n(2,schema_version=999,mastery=1),event_n(3)]
    try: result=accept_evidence_batch(url,events)
    except Exception as exc: result={'error':str(exc)}
    assert [r['disposition'] for r in result.get('receipts',[])]==['ACCEPTED','REJECTED','ACCEPTED']
    assert [r['event_id'] for r in result['receipts']]==[e['event_id'] for e in events]
    assert [e['origin_seq'] for e in read_evidence(url,'learner:a')]==[1,3]

@pytest.mark.parametrize('bad',[event_n(2,event_id='bad'),event_n(2,origin_seq=2**63)])
def test_review_F06_http_rejects_unrepresentable_batch_before_writes(tmp_path,bad):
    url=f'sqlite:///{tmp_path}/http.db';app=main.create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))
    with TestClient(app,raise_server_exceptions=False) as client:
        response=client.post('/v1/learner-evidence/batch',json={'events':[event_n(1),bad]})
    assert response.status_code==400,response.text
    assert read_evidence(url,'learner:a')==[]

def test_review_F05_http_store_initialization_uses_conflict_safe_identity(tmp_path,monkeypatch):
    url=f'sqlite:///{tmp_path}/meta.db';main.init_db(url);original=main.connect;barrier=threading.Barrier(4)
    class Cursor:
        def __init__(self,cursor): self.cursor=cursor
        def fetchone(self):
            row=self.cursor.fetchone()
            if row is None: barrier.wait(timeout=3)
            return row
        def __getattr__(self,key):return getattr(self.cursor,key)
    class Connection:
        def __init__(self):self.db=original(url)
        def __enter__(self):self.db.__enter__();return self
        def __exit__(self,*args):return self.db.__exit__(*args)
        def execute(self,sql,*args):
            cursor=self.db.execute(sql,*args)
            return Cursor(cursor) if sql.strip().startswith('SELECT store_id FROM k3_evidence_store_meta') else cursor
        def __getattr__(self,key):return getattr(self.db,key)
    monkeypatch.setattr(main,'connect',lambda *args:Connection())
    def run(_):
        try:return main.ensure_evidence_store_id(url)
        except Exception as exc:return type(exc).__name__
    with ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(run,range(4)))
    assert all(r.startswith('sqlite-k3:') for r in results),results
    assert len(set(results))==1
