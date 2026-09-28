import json
import sqlite3
import pytest
from app.main import init_db
from app.factory_store import create_run, get_run, update_run, record_stage_output, append_audit, list_audit

def test_factory_store_roundtrip(tmp_path):
    db_url=f"sqlite:///{tmp_path / 'factory.db'}"
    init_db(db_url)
    create_run(db_url, {
        'run_id':'r1','target_id':'i1','stage':'generate','status':'running','attempt':1,
        'input_hash':'a'*64,'output_ref':None,'request':{'input':{'x':1}},
        'started_at':'2026-09-27T00:00:00Z','completed_at':None,'retry':{'eligible':True}
    })
    assert get_run(db_url,'r1')['status']=='running'
    record_stage_output(db_url,'r1','generate',{'x':2},'b'*64,'2026-09-27T00:00:01Z')
    update_run(db_url,'r1','failed',attempt=2,retry={'eligible':True})
    assert get_run(db_url,'r1')['attempt']==2
    append_audit(db_url,{'run_id':'r1','target_id':'i1','kind':'stage','created_at':'2026-09-27T00:00:01Z'})
    assert len(list_audit(db_url,'r1'))==1


def test_sqlite_factory_store_preserves_shared_fixture(tmp_path):
    from pathlib import Path
    fixture=json.loads((Path(__file__).resolve().parents[2] / 'tests' / 'fixtures' / 'factory' / 'store-parity.json').read_text())
    db_url=f"sqlite:///{tmp_path / 'parity.db'}"
    init_db(db_url)
    create_run(db_url, fixture)
    got=get_run(db_url, fixture['run_id'])
    for key,value in fixture.items():
        assert got[key] == value


def test_learner_events_are_append_only_validated_and_queryable(tmp_path):
    from app.factory_store import append_learner_event, list_learner_events
    db_url=f"sqlite:///{tmp_path / 'learner.db'}"
    init_db(db_url)
    base={'learner_id':'l1','content_release_id':'rel1','form_id':'f1','question_family_id':'fam1','objective_id':'o1','domain_id':'mlops-llmops','mode':'practice','locale':'ar','answer':1,'correct':True,'confidence':'high','latency_ms':5000,'hint_used':False,'explanation_opened':False,'attempt_number':1}
    a={**base,'event_id':'e1','track_id':'t1','item_version_id':'i1','shown_at':'2026-09-27T03:00:00+03:00','answered_at':'2026-09-27T03:00:05+03:00'}
    b={**base,'event_id':'e2','track_id':'t2','item_version_id':'i2','shown_at':'2026-09-27T00:01:00Z','answered_at':'2026-09-27T00:01:05Z'}
    append_learner_event(db_url,a)
    append_learner_event(db_url,b)
    t1=list_learner_events(db_url,track_id='t1')
    assert [x['event_id'] for x in t1] == ['e1']
    assert t1[0]['shown_at'] == '2026-09-27T00:00:00Z'
    assert [x['event_id'] for x in list_learner_events(db_url,item_version_id='i2')] == ['e2']
    assert [x['event_id'] for x in list_learner_events(db_url,since='2026-09-27T00:00:30Z')] == ['e2']
    with pytest.raises(sqlite3.IntegrityError):
        append_learner_event(db_url,a)
    with pytest.raises(ValueError):
        append_learner_event(db_url,{**base,'event_id':'bad','track_id':'t1','item_version_id':'i3','shown_at':'2026-09-27T00:00:00Z','answered_at':'2026-09-27T00:00:05Z','mastery':0.9})


def test_k2_governance_records_are_immutable_and_queryable(tmp_path):
    from app.factory_store import put_k2_governance_record, get_k2_governance_record, list_k2_governance_records
    db_url=f"sqlite:///{tmp_path / 'k2.db'}"
    init_db(db_url)
    record={'schema_version':1,'plan_id':'expansion:1','track_id':'sdaia-ai-engineer'}
    assert put_k2_governance_record(db_url,'expansion','expansion:1',record) == 'expansion:1'
    assert get_k2_governance_record(db_url,'expansion','expansion:1') == record
    assert put_k2_governance_record(db_url,'expansion','expansion:1',dict(record)) == 'expansion:1'
    assert list_k2_governance_records(db_url,'expansion') == ['expansion:1']
    with pytest.raises(ValueError, match='immutable|different'):
        put_k2_governance_record(db_url,'expansion','expansion:1',{**record,'track_id':'changed'})
    with pytest.raises(ValueError, match='kind'):
        put_k2_governance_record(db_url,'unknown','x',{})


def test_sqlite_k2_store_preserves_shared_parity_fixture(tmp_path):
    from pathlib import Path
    from app.factory_store import put_k2_governance_record, get_k2_governance_record
    fixture=json.loads((Path(__file__).resolve().parents[2] / 'tests' / 'fixtures' / 'k2' / 'store-parity.json').read_text())
    db_url=f"sqlite:///{tmp_path / 'k2-parity.db'}"
    init_db(db_url)
    put_k2_governance_record(db_url,fixture['kind'],fixture['artifact_id'],fixture['record'])
    assert get_k2_governance_record(db_url,fixture['kind'],fixture['artifact_id']) == fixture['record']
