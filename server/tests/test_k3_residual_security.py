import pytest
from fastapi.testclient import TestClient
from app.main import create_app, init_db
from app.evidence_auth import StaticLearnerAuthorization
from app.evidence_store import get_evidence, accept_evidence


def uid(n): return f'20000000-0000-4000-8000-{n:012d}'
def event(n=1,**kw):
    return dict(dict(schema_version=2,event_id=uid(n),definition_id='learner.activity.started@1',learner_id='learner:a',origin_id=uid(100),origin_seq=n,activity_id=uid(101),track_id='sdaia-ai-engineer',content_release_id='release:test',mode='practice',locale='en',occurred_at='2026-10-03T18:00:00Z',payload={}),**kw)
def sensitive(n=2):
    return event(n,definition_id='learner.evidence.correction.recorded@1',authority_ref='authority:admin',payload=dict(action='VOID',target_event_id=uid(99),reason_code='TEST'))
@pytest.fixture
def url(tmp_path):
    value=f'sqlite:///{tmp_path / "secure.db"}';init_db(value);return value
@pytest.mark.parametrize('bad',[sensitive(),sensitive(3)])
def test_mixed_batch_rejects_producer_forgery_before_any_write(url,bad):
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a'))) as client:
        response=client.post('/v1/learner-evidence/batch',json={'events':[event(),bad],'producer_grants':['*'],'authority_refs':['authority:admin']})
    assert response.status_code==403
    assert get_evidence(url,uid(1)) is None and get_evidence(url,bad['event_id']) is None
@pytest.mark.parametrize('response',[{'option_index':0,'access_token':'SYNTHETIC'},{'option_index':True},{'option_index':-1},{'text':'unneeded text'},{}])
def test_direct_sqlite_rejects_noncanonical_response_before_write(url,response):
    value=event(definition_id='learner.response.recorded@1',item_version_id='item:a',item_interaction_id=uid(90),payload=dict(response_version=1,response_kind='OPTION',response=response))
    with pytest.raises(ValueError,match='response|privacy|payload|[Ii]nvalid'):
        accept_evidence(url,value)
    assert get_evidence(url,value['event_id']) is None
@pytest.mark.parametrize('field,value',[('definition_id',[]),('authority_ref',[])])
def test_malformed_authority_fields_never_raise_server_error(url,field,value):
    bad=sensitive();bad[field]=value
    with TestClient(create_app(url,learner_auth=StaticLearnerAuthorization('learner:a')),raise_server_exceptions=False) as client:
        response=client.post('/v1/learner-evidence/batch',json={'events':[bad]})
    assert response.status_code!=500
    assert get_evidence(url,bad['event_id']) is None

def test_trusted_exact_producer_grant_allows_only_its_authority(url):
    grant=('learner.evidence.correction.recorded@1','authority:admin')
    auth=StaticLearnerAuthorization('learner:a',producer_grants=[grant])
    with TestClient(create_app(url,learner_auth=auth)) as client:
        good=client.post('/v1/learner-evidence/batch',json={'events':[sensitive()]})
        bad=sensitive(3);bad['authority_ref']='authority:other'
        denied=client.post('/v1/learner-evidence/batch',json={'events':[bad]})
    assert good.status_code==200 and good.json()['receipts'][0]['disposition']=='ACCEPTED'
    assert denied.status_code==403 and get_evidence(url,bad['event_id']) is None
