import json
import sqlite3
from contextlib import closing
import pytest
from app.main import init_db
from app.evidence_store import read_export_records, append_export_record, accept_evidence
from test_k3_repair_validation import event


def uid(n): return f'20000000-0000-4000-8000-{n:012d}'
def record(n,action='EXPORTED',parent=None,**extra):
    return dict(schema_version=1,export_record_id=uid(n),event_id=uid(1),adapter_id='adapter:test',adapter_version='1',destination_class='TEST',mapping_version='1',action=action,occurred_at='2026-10-03T18:00:00Z',privacy_disposition='ALLOW',**({'predecessor_record_id':uid(parent)} if parent else {}),**extra)

@pytest.mark.parametrize('rows',[
    [record(12,'DELETED',999)],
    [record(10,'EXPORTED',999)],
    [record(10),record(12,'DELETED',10)],
    [record(10),record(11,'DELETE_REQUESTED',10),{**record(12,'DELETED',11),'event_id':uid(2)}],
    [record(10),record(11,'DELETE_REQUESTED',10),record(13,'DELETE_REQUESTED',10)],
    [record(11,'DELETE_REQUESTED',12),record(12,'DELETION_FAILED',11)],
])
def test_F09_sqlite_rejects_inconsistent_persisted_history(tmp_path,rows):
    path=tmp_path/'exports.db';url=f'sqlite:///{path}';init_db(url);accept_evidence(url,event())
    with closing(sqlite3.connect(path)) as db, db:
        for r in rows:
            db.execute('INSERT INTO k3_evidence_export_records(export_record_id,event_id,learner_id,record_json) VALUES(?,?,?,?)',(r['export_record_id'],r['event_id'],'learner:a',json.dumps(r)))
    with pytest.raises(ValueError,match='export|predecessor'): read_export_records(url)
    with pytest.raises(ValueError,match='export|predecessor'): append_export_record(url,record(90),destination_policy={'deletion_support':'SUPPORTED'})
    with closing(sqlite3.connect(path)) as db:
        assert db.execute('SELECT count(*) FROM k3_evidence_export_records').fetchone()[0]==len(rows)
