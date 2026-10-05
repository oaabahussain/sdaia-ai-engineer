import hashlib
import json
import sqlite3
from contextlib import closing
import pytest
import rfc8785
from app.main import init_db
from app.evidence_store import accept_evidence, read_evidence
from test_k3_repair_validation import event

COLUMNS = ('domain_id','form_id','item_interaction_id','locale','mode','objective_id','occurred_at','question_family_id','track_id')
OLD_DDL = '''CREATE TABLE k3_evidence_store_meta(id INTEGER PRIMARY KEY,store_id TEXT NOT NULL);
INSERT INTO k3_evidence_store_meta VALUES(1,'sqlite:test');
CREATE TABLE k3_evidence_events (
store_seq INTEGER PRIMARY KEY AUTOINCREMENT,store_id TEXT NOT NULL,event_id TEXT NOT NULL,
event_fingerprint TEXT NOT NULL,origin_id TEXT NOT NULL,origin_seq INTEGER NOT NULL,
learner_id TEXT NOT NULL,activity_id TEXT NOT NULL,assessment_attempt_id TEXT,item_version_id TEXT,
content_release_id TEXT NOT NULL,definition_id TEXT NOT NULL,accepted_at TEXT NOT NULL,event_json TEXT NOT NULL,
UNIQUE(store_id,event_id),UNIQUE(store_id,origin_id,origin_seq));'''

def old_db(tmp_path, corrupt=None):
    path=tmp_path/'old.db'; url=f'sqlite:///{path}'
    e=event(); e.update(domain_id='core-ai',objective_id='objective:test',form_id='form:test',question_family_id='family:test')
    raw=json.dumps(e,indent=2); fingerprint=hashlib.sha256(rfc8785.dumps(e)).hexdigest()
    with closing(sqlite3.connect(path)) as db, db:
        db.executescript(OLD_DDL)
        db.execute('INSERT INTO k3_evidence_events(store_seq,store_id,event_id,event_fingerprint,origin_id,origin_seq,learner_id,activity_id,content_release_id,definition_id,accepted_at,event_json) VALUES(7,?,?,?,?,?,?,?,?,?,?,?)',
                   ('sqlite:test',e['event_id'],fingerprint,e['origin_id'],e['origin_seq'],e['learner_id'],e['activity_id'],e['content_release_id'],e['definition_id'],'2026-10-03T18:00:00Z',raw if corrupt is None else corrupt))
    return path,url,e,raw,fingerprint

def columns(path):
    with closing(sqlite3.connect(path)) as db:
        return {r[1] for r in db.execute('PRAGMA table_info(k3_evidence_events)')}

def row(path):
    with closing(sqlite3.connect(path)) as db:
        db.row_factory=sqlite3.Row
        return dict(db.execute('SELECT * FROM k3_evidence_events').fetchone())

def test_F08_new_schema_has_all_approved_columns(tmp_path):
    path=tmp_path/'new.db';init_db(f'sqlite:///{path}')
    assert set(COLUMNS)<=columns(path)

def test_F08_migration_preserves_bytes_receipt_and_real_metadata(tmp_path):
    path,url,e,raw,fingerprint=old_db(tmp_path);before=row(path)
    init_db(url)
    assert set(COLUMNS)<=columns(path)
    after=row(path)
    for key,value in before.items(): assert after[key]==value, key
    for key in COLUMNS: assert after[key]==e.get(key),key
    assert read_evidence(url,e['learner_id'])==[e]
    assert accept_evidence(url,e)['store_seq']==7
    assert accept_evidence(url,e)['event_fingerprint']==fingerprint
    init_db(url)
    assert row(path)==after

@pytest.mark.parametrize('corrupt', ['{broken', json.dumps({**event(),'learner_id':'learner:other'})])
def test_F08_corrupt_migration_is_rejected_and_columns_roll_back(tmp_path,corrupt):
    path,url,_,_,_=old_db(tmp_path,corrupt);before=row(path)
    try: init_db(url); result='accepted'
    except (ValueError,RuntimeError): result='rejected'
    assert result=='rejected'
    assert not set(COLUMNS)&columns(path)
    assert row(path)==before

def test_F08_new_accept_populates_columns_and_preserves_nulls(tmp_path):
    path=tmp_path/'new.db';url=f'sqlite:///{path}';init_db(url);e=event()
    accept_evidence(url,e); stored=row(path)
    assert set(COLUMNS)<=stored.keys()
    for key in COLUMNS: assert stored[key]==e.get(key),key
    with closing(sqlite3.connect(path)) as db:
        indexes={r[1] for r in db.execute('PRAGMA index_list(k3_evidence_events)')}
    assert {'idx_k3_evidence_learner_seq','idx_k3_evidence_activity_seq','idx_k3_evidence_attempt_seq','idx_k3_evidence_item_seq','idx_k3_evidence_release_seq','idx_k3_evidence_definition_seq'}<=indexes
