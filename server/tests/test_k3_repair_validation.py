import copy
import pytest
from app.main import init_db, validate_learner_evidence_event
from app import evidence_store as store

def event():
    return dict(schema_version=2,event_id='20000000-0000-4000-8000-000000000001',definition_id='learner.activity.started@1',learner_id='learner:a',origin_id='20000000-0000-4000-8000-000000000100',origin_seq=1,activity_id='20000000-0000-4000-8000-000000000101',track_id='sdaia-ai-engineer',content_release_id='release:test',mode='practice',locale='en',occurred_at='2026-10-03T17:00:00Z',payload={})

@pytest.mark.parametrize('change',[
    {'schema_version':999,'mastery':1}, {'definition_id':'learner.unknown@1'},
    {'payload':{'mastery':1}}, {'origin_id':'bad'}, {'learner_id':'person@example.invalid'},
    {'origin_seq':2**53}, {'definition_id':'learner.response.recorded@1','payload':{'response_version':1,'response_kind':'OPTION','response':{'option_index':0}}}
])
def test_F06_direct_sqlite_validates_before_write(tmp_path,change):
    url=f'sqlite:///{tmp_path}/validation.db';init_db(url);bad={**event(),**change}
    try: result=store.accept_evidence(url,bad)
    except (ValueError,TypeError): result={'disposition':'REJECTED'}
    assert result['disposition']=='REJECTED', result
    assert store.get_evidence(url,bad['event_id']) is None

def test_F06_http_and_direct_validation_share_privacy_rules():
    assert validate_learner_evidence_event({**event(),'learner_id':'person@example.invalid'}) is not None
