import sqlite3
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
import pytest
from app.main import init_db
import app.evidence_store as store

def uid(n): return f'20000000-0000-4000-8000-{n:012d}'


def event(n=1,learner='learner:a'):
    return dict(schema_version=2,event_id=uid(n),definition_id='learner.activity.started@1',learner_id=learner,origin_id=uid(100),origin_seq=n,activity_id=uid(101),track_id='sdaia-ai-engineer',content_release_id='release:test',mode='practice',locale='en',occurred_at='2026-10-03T17:00:00Z',payload={})


@pytest.fixture
def db(tmp_path):
    path=tmp_path/'audit.db';url=f'sqlite:///{path}';init_db(url)
    return url,path


@pytest.mark.parametrize('repeat',[1,2,3])
def test_A08_sqlite_parallel_exact_retries_are_idempotent(db,repeat):
    url,_=db
    store.accept_evidence(url,event(99,'learner:b')) # initialize the store ID first
    barrier=Barrier(12)
    def accept(_):
        barrier.wait(timeout=5)
        try:
            return store.accept_evidence(url,event())['disposition']
        except Exception as e:
            return type(e).__name__+': '+str(e)
    with ThreadPoolExecutor(max_workers=12) as executor:
        results=list(executor.map(accept,range(12)))
    assert sorted(results)==['ACCEPTED']+['DUPLICATE']*11,results


def test_A19_sqlite_exact_retry_interleaving_is_deterministic(db,monkeypatch):
    """Pause after real SELECTs so both connections observe the absent origin.

    No database values or outcomes are mocked. This schedules a valid concurrent
    interleaving and makes the observed read-then-insert race reproducible.
    """
    url,_=db
    store.accept_evidence(url,event(99,'learner:b'))
    connect=store._connect
    barrier=Barrier(2)
    class CursorGate:
        def __init__(self,cursor): self.cursor=cursor
        def fetchone(self):
            actual=self.cursor.fetchone()
            if actual is None: barrier.wait(timeout=5)
            return actual
        def __getattr__(self,key): return getattr(self.cursor,key)
    class ConnectionGate:
        def __init__(self,conn): self.conn=conn
        def __enter__(self): self.conn.__enter__();return self
        def __exit__(self,*args): return self.conn.__exit__(*args)
        def execute(self,sql,*args):
            cursor=self.conn.execute(sql,*args)
            if 'WHERE store_id = ? AND origin_id = ? AND origin_seq = ?' in sql:
                return CursorGate(cursor)
            return cursor
        def __getattr__(self,key): return getattr(self.conn,key)
    monkeypatch.setattr(store,'_connect',lambda value:ConnectionGate(connect(value)))
    def call(_):
        try: return store.accept_evidence(url,event())['disposition']
        except Exception as exc: return type(exc).__name__+': '+str(exc)
    with ThreadPoolExecutor(max_workers=2) as pool:
        results=list(pool.map(call,range(2)))
    assert sorted(results)==['ACCEPTED','DUPLICATE'],results


def test_F05_concurrent_cold_store_creation(db):
    url, _ = db
    barrier = Barrier(8)
    def accept(_):
        barrier.wait(timeout=5)
        try:
            return store.accept_evidence(url, event())['disposition']
        except Exception as exc:
            return type(exc).__name__ + ': ' + str(exc)
    with ThreadPoolExecutor(max_workers=8) as pool:
        result = list(pool.map(accept, range(8)))
    assert sorted(result) == ['ACCEPTED'] + ['DUPLICATE'] * 7, result
    assert store.read_evidence(url, 'learner:a') == [event()]


def test_F05_concurrent_different_body_never_overwrites(db):
    url, _ = db
    store.accept_evidence(url, event(99, 'learner:b'))
    barrier = Barrier(2)
    def accept(n):
        value = event(); value['payload'] = {'source': str(n)}
        barrier.wait(timeout=5)
        try:
            return store.accept_evidence(url, value)['disposition']
        except Exception as exc:
            return type(exc).__name__ + ': ' + str(exc)
    with ThreadPoolExecutor(max_workers=2) as pool:
        result = list(pool.map(accept, range(2)))
    assert sorted(result) == ['ACCEPTED', 'CONFLICT'], result
    assert len(store.read_evidence(url, 'learner:a')) == 1
