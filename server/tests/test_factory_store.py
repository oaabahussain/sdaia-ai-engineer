import json
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
