"""Synthetic integration probes. No real accounts, mailboxes, or external writes."""
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
import pytest
from fastapi.testclient import TestClient
from app.main import create_app, init_db
from app.evidence_auth import StaticLearnerAuthorization
import app.evidence_store as store


def uid(n):
    return f'20000000-0000-4000-8000-{n:012d}'


def event(n=1, learner='learner:a'):
    return dict(schema_version=2,event_id=uid(n),definition_id='learner.activity.started@1',
                learner_id=learner,origin_id=uid(100),origin_seq=n,activity_id=uid(101),
                track_id='sdaia-ai-engineer',content_release_id='release:test',mode='practice',
                locale='en',occurred_at='2026-10-03T18:00:00Z',payload={})


def link():
    return dict(schema_version=1,identity_link_record_id=uid(200),link_id='link:a',action='LINK',
                source_learner_id='learner:a',target_learner_id='learner:b',
                effective_at='2026-10-03T18:00:00Z',created_at='2026-10-03T18:00:00Z',
                authority_ref='authority:test',reason_code='ACCOUNT_LINK')


@pytest.fixture
def db(tmp_path):
    path=tmp_path/'residual.db'
    url=f'sqlite:///{path}'
    init_db(url)
    return url,path


def test_C03_default_deny_and_current_cursor_range_remain_enforced(db):
    url,_=db
    with TestClient(create_app(url),raise_server_exceptions=False) as client:
        assert client.get('/v1/learner-evidence').status_code==403
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))) as client:
        assert client.get('/v1/learner-evidence?after_store_seq=9007199254740992').status_code==400


def test_R01b_pull_watermark_identifies_its_authoritative_store(db):
    url,_=db
    receipt=store.accept_evidence(url,event())
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))) as client:
        response=client.get('/v1/learner-evidence')
    assert response.status_code==200
    body=response.json()
    assert body.get('store_id')==receipt['store_id'], f'cursor lacks stable source identity: {body}'


def test_C04_serial_identity_link_retry_is_idempotent(db):
    url,_=db
    assert store.append_identity_link_record(url,link())['disposition']=='ACCEPTED'
    assert store.append_identity_link_record(url,link())['disposition']=='DUPLICATE'


def test_R07_concurrent_identical_identity_link_retry_is_idempotent(db,monkeypatch):
    url,_=db
    connect=store._connect
    barrier=Barrier(2)
    class CursorGate:
        def __init__(self,cursor): self.cursor=cursor
        def fetchone(self):
            real=self.cursor.fetchone()
            if real is None: barrier.wait(timeout=5)
            return real
        def __getattr__(self,key): return getattr(self.cursor,key)
    class ConnectionGate:
        def __init__(self,conn): self.conn=conn
        def __enter__(self): self.conn.__enter__();return self
        def __exit__(self,*args): return self.conn.__exit__(*args)
        def execute(self,sql,*args):
            cursor=self.conn.execute(sql,*args)
            if 'SELECT record_json FROM k3_identity_link_records WHERE identity_link_record_id' in sql:
                return CursorGate(cursor)
            return cursor
        def __getattr__(self,key): return getattr(self.conn,key)
    monkeypatch.setattr(store,'_connect',lambda u:ConnectionGate(connect(u)))
    def call(_):
        try: return store.append_identity_link_record(url,link())['disposition']
        except Exception as exc: return f'{type(exc).__name__}: {exc}'
    with ThreadPoolExecutor(max_workers=2) as pool:
        actual=list(pool.map(call,range(2)))
    assert sorted(actual)==['ACCEPTED','DUPLICATE'],actual

@pytest.mark.parametrize('kind',['correction','evaluation','resolution'])
def test_R08_ordinary_learner_cannot_submit_authority_sensitive_events(db,kind):
    url,_=db
    value=event(2)
    value['authority_ref']='unverified:test-authority'
    if kind=='correction':
        value.update(definition_id='learner.evidence.correction.recorded@1',
                     payload={'action':'VOID','target_event_id':uid(1),'reason_code':'TEST_ONLY'})
    elif kind=='evaluation':
        value.update(definition_id='learner.response.evaluated@1',item_version_id='item:test',
                     payload={'response_event_id':uid(1),'scoring_policy_ref':'policy:test',
                              'evaluation_status':'GRADED','correct':True,'score':1})
    else:
        value.update(definition_id='learner.assessment.mutation.resolved@1',assessment_attempt_id=uid(70),
                     payload={'candidate_event_id':uid(1),'assessment_attempt_id':uid(70),
                              'base_attempt_revision':0,'authoritative_revision_before':0,
                              'authoritative_revision_after':1,'decision':'APPLIED','reason_code':'TEST_ONLY'})
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))) as client:
        response=client.post('/v1/learner-evidence/batch',json={'events':[value]})
    dispositions=[r.get('disposition') for r in response.json().get('receipts',[])]
    assert response.status_code in (400,403,422) or dispositions==['REJECTED'], \
        f'ordinary learner principal was granted {kind} producer authority: {response.status_code} {dispositions}'
    assert store.get_evidence(url,value['event_id']) is None


def test_C05_ordinary_event_accepted_but_foreign_learner_remains_denied(db):
    url,_=db
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))) as client:
        good=client.post('/v1/learner-evidence/batch',json={'events':[event()]})
        foreign=client.post('/v1/learner-evidence/batch',json={'events':[event(2,'learner:b')]})
    assert good.status_code==200 and good.json()['receipts'][0]['disposition']=='ACCEPTED'
    assert foreign.status_code==403


def test_R10_option_response_rejects_undeclared_sensitive_fields(db):
    url,_=db
    value=event(1)
    value.update(definition_id='learner.response.recorded@1',item_interaction_id=uid(80),item_version_id='item:test',
                 payload={'response_version':1,'response_kind':'OPTION',
                          'response':{'option_index':0,'access_token':'SYNTHETIC-NOT-A-REAL-CREDENTIAL'}})
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))) as client:
        response=client.post('/v1/learner-evidence/batch',json={'events':[value]})
    dispositions=[r.get('disposition') for r in response.json().get('receipts',[])]
    assert response.status_code in (400,403,422) or dispositions==['REJECTED'], \
        f'undeclared sensitive OPTION response key persisted: {response.status_code} {dispositions}'
    assert store.get_evidence(url,value['event_id']) is None
