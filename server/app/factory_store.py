import json
import sqlite3
from datetime import datetime, timezone

def _path(db_url):
    if not db_url.startswith('sqlite:///'):
        raise RuntimeError('Factory store supports sqlite:/// DB_URL values only')
    return db_url[len('sqlite:///'):] or './dev.db'

def _connect(db_url):
    db=sqlite3.connect(_path(db_url))
    db.row_factory=sqlite3.Row
    db.execute('PRAGMA foreign_keys = ON')
    return db

def _row(row):
    if row is None:
        return None
    return {
        'run_id':row['run_id'],'target_id':row['target_id'],'stage':row['stage'],'status':row['status'],
        'attempt':row['attempt'],'input_hash':row['input_hash'],'output_ref':row['output_ref'],
        'request':json.loads(row['request_json']),'started_at':row['started_at'],'completed_at':row['completed_at'],
        'retry':json.loads(row['retry_json']),
    }

def create_run(db_url, record):
    with _connect(db_url) as db:
        db.execute('INSERT INTO factory_runs (run_id,target_id,stage,status,attempt,input_hash,output_ref,request_json,started_at,completed_at,retry_json) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            (record['run_id'],record['target_id'],record['stage'],record['status'],record['attempt'],record['input_hash'],record.get('output_ref'),json.dumps(record.get('request',{}),ensure_ascii=False),record['started_at'],record.get('completed_at'),json.dumps(record.get('retry',{}),ensure_ascii=False)))
    return record

def get_run(db_url, run_id):
    with _connect(db_url) as db:
        return _row(db.execute('SELECT * FROM factory_runs WHERE run_id=?',(run_id,)).fetchone())

def update_run(db_url, run_id, status, attempt=None, retry=None, stage=None, completed_at=None, output_ref=None):
    current=get_run(db_url,run_id)
    if current is None:
        raise KeyError('Factory run not found')
    current['status']=status
    if attempt is not None: current['attempt']=attempt
    if retry is not None: current['retry']=retry
    if stage is not None: current['stage']=stage
    if completed_at is not None: current['completed_at']=completed_at
    if output_ref is not None: current['output_ref']=output_ref
    with _connect(db_url) as db:
        db.execute('UPDATE factory_runs SET stage=?,status=?,attempt=?,output_ref=?,completed_at=?,retry_json=? WHERE run_id=?',
            (current['stage'],current['status'],current['attempt'],current['output_ref'],current['completed_at'],json.dumps(current['retry'],ensure_ascii=False),run_id))
    return current

def record_stage_output(db_url, run_id, stage, output, output_hash, completed_at):
    with _connect(db_url) as db:
        db.execute('INSERT INTO factory_stage_outputs (run_id,stage,output_json,output_hash,completed_at) VALUES (?,?,?,?,?)',
            (run_id,stage,json.dumps(output,ensure_ascii=False),output_hash,completed_at))
        db.execute('UPDATE factory_runs SET stage=? WHERE run_id=?',(stage,run_id))
    return output

def append_audit(db_url, record):
    with _connect(db_url) as db:
        db.execute('INSERT INTO factory_audit (run_id,target_id,record_json,created_at) VALUES (?,?,?,?)',
            (record['run_id'],record['target_id'],json.dumps(record,ensure_ascii=False),record['created_at']))
    return record

def list_audit(db_url, run_id):
    with _connect(db_url) as db:
        rows=db.execute('SELECT record_json FROM factory_audit WHERE run_id=? ORDER BY id',(run_id,)).fetchall()
    return [json.loads(row['record_json']) for row in rows]



_LEARNER_ALLOWED={'schema_version','event_id','learner_id','track_id','content_release_id','form_id','question_family_id','item_version_id','objective_id','domain_id','mode','locale','shown_at','answered_at','answer','correct','confidence','latency_ms','hint_used','explanation_opened','attempt_number','device'}
_LEARNER_REQUIRED={'event_id','learner_id','track_id','content_release_id','form_id','question_family_id','item_version_id','objective_id','domain_id','mode','locale','shown_at','answered_at','answer','correct','latency_ms','hint_used','explanation_opened','attempt_number'}
def _utc_iso(value):
    if not isinstance(value,str):
        raise ValueError('Invalid learner event timestamp')
    try:
        dt=datetime.fromisoformat(value.replace('Z','+00:00'))
    except ValueError as exc:
        raise ValueError('Invalid learner event timestamp') from exc
    if dt.tzinfo is None:
        raise ValueError('Learner event timestamp must include timezone')
    return dt.astimezone(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')

def _validate_learner_event(event):
    if not isinstance(event,dict):
        raise ValueError('Learner event must be an object')
    unknown=set(event)-_LEARNER_ALLOWED
    if unknown:
        raise ValueError('Unknown or derived learner event field: '+','.join(sorted(unknown)))
    normalized=dict(event)
    normalized.setdefault('schema_version',1)
    if normalized['schema_version'] != 1:
        raise ValueError('LearnerEvent schema_version must be 1')
    missing=[k for k in _LEARNER_REQUIRED if k not in normalized or normalized[k] is None or normalized[k]=='']
    if missing:
        raise ValueError('Learner event missing required fields: '+','.join(sorted(missing)))
    if normalized['mode'] not in {'learn','practice','check','section','mock'}:
        raise ValueError('Invalid learner event mode')
    if normalized['locale'] not in {'ar','en'}:
        raise ValueError('Invalid learner event locale')
    normalized['shown_at']=_utc_iso(normalized['shown_at'])
    normalized['answered_at']=_utc_iso(normalized['answered_at'])
    if normalized['answered_at'] < normalized['shown_at']:
        raise ValueError('Learner event timestamp order is invalid')
    if not isinstance(normalized['latency_ms'],(int,float)) or normalized['latency_ms'] < 0:
        raise ValueError('Invalid learner event latency')
    if not isinstance(normalized['attempt_number'],int) or normalized['attempt_number'] < 1:
        raise ValueError('Invalid learner event attempt')
    return normalized

def append_learner_event(db_url, event):
    event=_validate_learner_event(event)
    with _connect(db_url) as db:
        db.execute(
            'INSERT INTO learner_events (event_id,learner_id,track_id,item_version_id,shown_at,event_json) VALUES (?,?,?,?,?,?)',
            (event['event_id'], event['learner_id'], event['track_id'], event['item_version_id'], event['shown_at'], json.dumps(event, ensure_ascii=False))
        )
    return event

def list_learner_events(db_url, track_id=None, item_version_id=None, since=None, until=None):
    clauses=[]
    args=[]
    if track_id is not None:
        clauses.append('track_id=?'); args.append(track_id)
    if item_version_id is not None:
        clauses.append('item_version_id=?'); args.append(item_version_id)
    if since is not None:
        clauses.append('shown_at>=?'); args.append(since)
    if until is not None:
        clauses.append('shown_at<=?'); args.append(until)
    sql='SELECT event_json FROM learner_events'
    if clauses:
        sql += ' WHERE ' + ' AND '.join(clauses)
    sql += ' ORDER BY shown_at,event_id'
    with _connect(db_url) as db:
        rows=db.execute(sql,tuple(args)).fetchall()
    return [json.loads(row['event_json']) for row in rows]


_K2_GOVERNANCE_KINDS={'expansion','tranche','activation','improvement'}

def _k2_kind(kind):
    if kind not in _K2_GOVERNANCE_KINDS:
        raise ValueError('Unsupported K2 governance artifact kind')
    return kind

def _canonical_json(value):
    return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'))

def put_k2_governance_record(db_url, kind, artifact_id, record):
    _k2_kind(kind)
    if not isinstance(artifact_id,str) or not artifact_id:
        raise ValueError('K2 governance artifact id is required')
    body=_canonical_json(record)
    with _connect(db_url) as db:
        row=db.execute(
            'SELECT body_json FROM k2_governance_records WHERE kind=? AND artifact_id=?',
            (kind,artifact_id)
        ).fetchone()
        if row is not None:
            if row['body_json'] != body:
                raise ValueError('Immutable K2 governance artifact ID has different body')
            return artifact_id
        db.execute(
            'INSERT INTO k2_governance_records (kind,artifact_id,body_json) VALUES (?,?,?)',
            (kind,artifact_id,body)
        )
    return artifact_id

def get_k2_governance_record(db_url, kind, artifact_id):
    _k2_kind(kind)
    with _connect(db_url) as db:
        row=db.execute(
            'SELECT body_json FROM k2_governance_records WHERE kind=? AND artifact_id=?',
            (kind,artifact_id)
        ).fetchone()
    return json.loads(row['body_json']) if row is not None else None

def list_k2_governance_records(db_url, kind):
    _k2_kind(kind)
    with _connect(db_url) as db:
        rows=db.execute(
            'SELECT artifact_id FROM k2_governance_records WHERE kind=? ORDER BY artifact_id',
            (kind,)
        ).fetchall()
    return [row['artifact_id'] for row in rows]
