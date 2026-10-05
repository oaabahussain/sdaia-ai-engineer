import json
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from app.main import init_db
import app.evidence_store as store

def record(target='learner:b'):
    return dict(schema_version=1,identity_link_record_id='record:1',link_id='link:1',action='LINK',source_learner_id='learner:a',target_learner_id=target,effective_at='2026-10-03T10:00:00Z',created_at='2026-10-03T10:00:00Z',authority_ref='authority:test',reason_code='TEST')

def synchronized_connect(monkeypatch):
    original=store._connect; barrier=Barrier(2)
    class Cursor:
        def __init__(self,cursor):self.cursor=cursor
        def fetchone(self):
            result=self.cursor.fetchone()
            if result is None:barrier.wait(timeout=5)
            return result
        def __getattr__(self,key):return getattr(self.cursor,key)
    class Connection:
        def __init__(self,conn):self.conn=conn
        def __enter__(self):self.conn.__enter__();return self
        def __exit__(self,*args):return self.conn.__exit__(*args)
        def execute(self,sql,*args):
            result=self.conn.execute(sql,*args)
            return Cursor(result) if 'SELECT record_json FROM k3_identity_link_records WHERE identity_link_record_id' in sql else result
        def __getattr__(self,key):return getattr(self.conn,key)
    monkeypatch.setattr(store,'_connect',lambda url:Connection(original(url)))

def test_simultaneous_exact_identity_retries_reselect_the_committed_record(tmp_path,monkeypatch):
    url=f'sqlite:///{tmp_path}/same.db';init_db(url);synchronized_connect(monkeypatch)
    def accept(_):
        try:return store.append_identity_link_record(url,record())['disposition']
        except Exception as exc:return type(exc).__name__
    with ThreadPoolExecutor(max_workers=2) as pool:outcomes=list(pool.map(accept,range(2)))
    assert sorted(outcomes)==['ACCEPTED','DUPLICATE'],outcomes
    assert store.read_identity_link_records(url)==[record()]

def test_simultaneous_conflicting_identity_retries_return_explicit_conflict(tmp_path,monkeypatch):
    url=f'sqlite:///{tmp_path}/conflict.db';init_db(url);synchronized_connect(monkeypatch)
    def accept(target):
        try:return store.append_identity_link_record(url,record(target))['disposition']
        except ValueError as exc:return 'CONFLICT' if 'conflict' in str(exc) else str(exc)
        except Exception as exc:return type(exc).__name__
    with ThreadPoolExecutor(max_workers=2) as pool:outcomes=list(pool.map(accept,['learner:b','learner:c']))
    assert sorted(outcomes)==['ACCEPTED','CONFLICT'],outcomes
    assert len(store.read_identity_link_records(url))==1

def test_natural_parallel_retries_are_all_idempotent(tmp_path):
    url=f'sqlite:///{tmp_path}/parallel.db';init_db(url)
    def accept(_):
        try:return store.append_identity_link_record(url,record())['disposition']
        except Exception as exc:return type(exc).__name__
    with ThreadPoolExecutor(max_workers=8) as pool:outcomes=list(pool.map(accept,range(16)))
    assert outcomes.count('ACCEPTED')==1
    assert outcomes.count('DUPLICATE')==15,outcomes
