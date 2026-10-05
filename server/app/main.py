import hashlib
import json
import os
import sqlite3
import time
import uuid

import rfc8785
from contextlib import closing
from collections import defaultdict, deque
from pathlib import Path

from fastapi import FastAPI, Header, Request, Response
from fastapi.responses import JSONResponse
from jsonschema import Draft7Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT7

from app.evidence_auth import DenyLearnerAuthorization, LearnerAuthorizationDenied
from app.evidence_store import accept_evidence, accept_evidence_batch, prepare_evidence_batch, migrate_evidence_query_columns, _store_id as resolve_evidence_store_id
from app.evidence_validation import validate_evidence

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIR = ROOT / 'data' / 'schema'
DATA_DIR = ROOT / 'data'
RATE = defaultdict(deque)



def load_schema(name):
    return json.loads((SCHEMA_DIR / name).read_text(encoding='utf-8'))


def make_registry():
    registry = Registry()
    base_uri = SCHEMA_DIR.resolve().as_uri() + '/'
    for path in SCHEMA_DIR.glob('*.json'):
        schema = json.loads(path.read_text(encoding='utf-8'))
        resource = Resource.from_contents(schema, default_specification=DRAFT7)
        registry = registry.with_resource(base_uri + path.name, resource)
        registry = registry.with_resource(path.name, resource)
    return registry


SCHEMA_REGISTRY = make_registry()


def make_validator(name):
    return Draft7Validator(
        load_schema(name),
        registry=SCHEMA_REGISTRY,
        format_checker=FormatChecker(),
    )


VALIDATORS = {
    'state': make_validator('state-v2.schema.json'),
    'feedback': make_validator('feedback.schema.json'),
    'events': make_validator('events.schema.json'),
    'learner_evidence': make_validator('learner-evidence-event-v2.schema.json'),
}


def load_event_definitions():
    definitions = json.loads((DATA_DIR / 'evidence' / 'event-definitions-v1.json').read_text(encoding='utf-8'))
    return {f"{item['event_name']}@{item['event_version']}": item for item in definitions}


EVENT_DEFINITIONS = load_event_definitions()


def validate_learner_evidence_event(event):
    return validate_evidence(event)


def ensure_evidence_store_id(db_url):
    with closing(connect(db_url)) as db, db:
        return resolve_evidence_store_id(db)


def load_track_registry():
    return json.loads((ROOT / 'tracks' / 'registry.json').read_text(encoding='utf-8'))


def default_track_id():
    registry = load_track_registry()
    return registry['default_track_id']


def load_runtime_bundle(track_id=None):
    track_id = track_id or default_track_id()
    manifest = json.loads((ROOT / 'tracks' / track_id / 'manifest.json').read_text(encoding='utf-8'))
    profiles = [json.loads((ROOT / ref).read_text(encoding='utf-8')) for ref in manifest['exam_profiles']]
    exam_profile = next((p for p in profiles if p['id'] == manifest['default_exam_profile']), None)
    if exam_profile is None:
        raise RuntimeError(f"Missing default exam profile {manifest['default_exam_profile']}")
    concept_docs = [json.loads((ROOT / ref).read_text(encoding='utf-8')) for ref in manifest['content']['concept_files']]
    content_v2 = 'content-model-v2' in manifest.get('capabilities', [])
    evidence_v2 = 'learner-evidence-v2' in manifest.get('capabilities', [])
    domains = json.loads((ROOT / 'tracks' / track_id / 'domains.json').read_text(encoding='utf-8')) if content_v2 else None
    evidence = json.loads((ROOT / manifest['evidence']).read_text(encoding='utf-8')) if evidence_v2 else None
    return {
        'contract_version': 4 if evidence_v2 else (3 if content_v2 else 2),
        'track': manifest,
        **({'domains': domains} if content_v2 else {}),
        **({'evidence': evidence} if evidence_v2 else {}),
        'exam_profile': exam_profile,
        'concepts': {(doc['domain_id'] if content_v2 else doc['domain']): doc['concepts'] for doc in concept_docs},
        'learn': json.loads((ROOT / manifest['content']['learn']).read_text(encoding='utf-8')),
        'cases': json.loads((ROOT / manifest['content']['cases']).read_text(encoding='utf-8')),
    }

def error(code, message, status):
    return JSONResponse({'error': {'code': code, 'message': message}}, status_code=status)


def valid_uuid4(value):
    try:
        parsed = uuid.UUID(str(value))
        return parsed.version == 4 and str(parsed) == str(value).lower()
    except (ValueError, AttributeError, TypeError):
        return False


def sqlite_path(db_url=None):
    value = db_url or os.getenv('DB_URL', 'sqlite:///./dev.db')
    if not value.startswith('sqlite:///'):
        raise RuntimeError('This skeleton supports sqlite:/// DB_URL values only')
    path = value[len('sqlite:///'):]
    return path or './dev.db'


def connect(db_url=None):
    connection = sqlite3.connect(sqlite_path(db_url), check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys = ON')
    return connection


def init_db(db_url=None):
    with closing(connect(db_url)) as db, db:
        db.executescript((ROOT / 'db' / 'schema.sql').read_text(encoding='utf-8'))
        db.execute('BEGIN IMMEDIATE')
        migrate_evidence_query_columns(db)


def validate(name, payload):
    errors = sorted(VALIDATORS[name].iter_errors(payload), key=lambda item: list(item.path))
    if errors:
        return '; '.join(error.message for error in errors)
    return None


def check_rate(anon_id):
    now = time.monotonic()
    bucket = RATE[anon_id]
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= 60:
        return False
    bucket.append(now)
    return True


def require_anon(value):
    if not valid_uuid4(value):
        return error('invalid_anon_id', 'X-Anon-Id must be a UUID v4', 400)
    return None


def create_app(db_url=None, learner_auth=None, evidence_pull_max_limit=None):
    app = FastAPI(title='SDAIA AI Engineer Study Space API')
    app.state.db_url = db_url or os.getenv('DB_URL', 'sqlite:///./dev.db')
    app.state.learner_auth = learner_auth if learner_auth is not None else DenyLearnerAuthorization()
    configured_pull_limit = evidence_pull_max_limit
    if configured_pull_limit is None:
        configured_pull_limit = int(os.getenv('K3_EVIDENCE_PULL_MAX_LIMIT', '100'))
    if not isinstance(configured_pull_limit, int) or configured_pull_limit < 1:
        raise ValueError('K3 evidence pull max limit must be a positive integer')
    app.state.evidence_pull_max_limit = configured_pull_limit
    init_db(app.state.db_url)

    @app.get('/v1/health')
    def health():
        return {'status': 'ok'}

    @app.get('/v1/bank')
    def bank(track_id: str | None = None):
        selected = track_id or default_track_id()
        registered = {item['id'] for item in load_track_registry()['tracks']}
        if selected not in registered:
            return error('invalid_track', 'Track is not registered', 404)
        try:
            return load_runtime_bundle(selected)
        except (FileNotFoundError, RuntimeError, KeyError, json.JSONDecodeError):
            return error('invalid_track', 'Track package is invalid', 404)

    @app.get('/v1/progress/{anon_id}')
    def get_progress(anon_id: str, response: Response, x_anon_id: str = Header(..., alias='X-Anon-Id')):
        invalid = require_anon(x_anon_id)
        if invalid: return invalid
        if anon_id != x_anon_id: return error('invalid_anon_id', 'Path and header anonymous IDs must match', 400)
        with connect(app.state.db_url) as db:
            row = db.execute('SELECT state_json, version FROM progress WHERE anon_id = ?', (anon_id,)).fetchone()
        if not row: return error('not_found', 'Progress was not found', 404)
        response.headers['ETag'] = str(row['version'])
        return json.loads(row['state_json'])

    @app.put('/v1/progress/{anon_id}')
    async def put_progress(anon_id: str, request: Request, response: Response, x_anon_id: str = Header(..., alias='X-Anon-Id'), if_match: str = Header(..., alias='If-Match')):
        invalid = require_anon(x_anon_id)
        if invalid: return invalid
        if anon_id != x_anon_id: return error('invalid_anon_id', 'Path and header anonymous IDs must match', 400)
        try: payload = await request.json()
        except Exception: return error('validation_failed', 'Request body must be JSON', 400)
        validation = validate('state', payload)
        if validation: return error('validation_failed', validation, 400)
        if payload.get('anon_id') != anon_id: return error('invalid_anon_id', 'State anonymous ID must match path', 400)
        try: expected = int(if_match.strip('"'))
        except ValueError: return error('conflict', 'If-Match must contain the numeric progress version', 409)
        with connect(app.state.db_url) as db:
            row = db.execute('SELECT version FROM progress WHERE anon_id = ?', (anon_id,)).fetchone()
            current = row['version'] if row else 0
            if expected != current: return error('conflict', 'Progress version mismatch', 409)
            db.execute('INSERT OR IGNORE INTO users (anon_id, created_at) VALUES (?, ?)', (anon_id, payload['created_at']))
            version = current + 1
            if row:
                db.execute('UPDATE progress SET state_json=?, version=?, updated_at=? WHERE anon_id=?', (json.dumps(payload, ensure_ascii=False), version, payload['updated_at'], anon_id))
            else:
                db.execute('INSERT INTO progress (anon_id, state_json, version, updated_at) VALUES (?, ?, ?, ?)', (anon_id, json.dumps(payload, ensure_ascii=False), version, payload['updated_at']))
        response.headers['ETag'] = str(version)
        return payload

    @app.post('/v1/feedback')
    async def feedback(request: Request, x_anon_id: str = Header(..., alias='X-Anon-Id')):
        invalid = require_anon(x_anon_id)
        if invalid: return invalid
        if not check_rate(x_anon_id): return error('validation_failed', 'Rate limit exceeded', 400)
        try: payload = await request.json()
        except Exception: return error('validation_failed', 'Request body must be JSON', 400)
        validation = validate('feedback', payload)
        if validation: return error('validation_failed', validation, 400)
        with connect(app.state.db_url) as db:
            db.execute('INSERT OR IGNORE INTO users (anon_id, created_at) VALUES (?, ?)', (x_anon_id, time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())))
            next_id = db.execute('SELECT COALESCE(MAX(id), 0) + 1 FROM feedback').fetchone()[0]
            db.execute('INSERT INTO feedback (id, anon_id, question_id, issue_type, details, created_at) VALUES (?, ?, ?, ?, ?, ?)', (next_id, x_anon_id, payload['question_id'], payload['issue_type'], payload.get('details'), time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())))
        return {'ok': True, 'ref': f'feedback:{next_id}'}

    @app.get('/v1/learner-evidence')
    async def get_learner_evidence(request: Request, after_store_seq: int = 0, limit: int = 100, source_store_id: str | None = None):
        try:
            authorized = app.state.learner_auth.resolve(request)
        except LearnerAuthorizationDenied:
            return error('learner_not_authorized', 'Learner evidence access is not authorized', 403)
        if not 0 <= after_store_seq <= 9007199254740991:
            return error('validation_failed', 'after_store_seq must be a nonnegative safe integer', 400)
        if limit < 1:
            return error('validation_failed', 'limit must be a positive integer', 400)
        bounded_limit = min(limit, app.state.evidence_pull_max_limit)
        with connect(app.state.db_url) as db:
            store_id = ensure_evidence_store_id(app.state.db_url)
            if after_store_seq > 0 and source_store_id is None:
                return error('validation_failed', 'A nonzero cursor requires source_store_id', 400)
            if source_store_id is not None and source_store_id != store_id:
                return error('source_store_mismatch', 'Cursor belongs to another evidence store', 409)
            rows = db.execute(
                'SELECT store_seq, event_json FROM k3_evidence_events WHERE store_id = ? AND learner_id = ? AND store_seq > ? ORDER BY store_seq ASC LIMIT ?',
                (store_id, authorized.learner_id, after_store_seq, bounded_limit),
            ).fetchall()
        events = [json.loads(row['event_json']) for row in rows]
        next_store_seq = rows[-1]['store_seq'] if rows else after_store_seq
        return {'store_id':store_id, 'events': events, 'next_store_seq': next_store_seq}
    @app.post('/v1/learner-evidence/batch')
    async def post_learner_evidence_batch(request: Request):
        try:
            authorized = app.state.learner_auth.resolve(request)
        except LearnerAuthorizationDenied:
            return error('learner_not_authorized', 'Learner evidence access is not authorized', 403)
        try:
            payload = await request.json()
        except Exception:
            return error('validation_failed', 'Request body must be JSON', 400)
        events = payload.get('events') if isinstance(payload, dict) else None
        if not isinstance(events, list):
            return error('validation_failed', 'events must be an array', 400)
        if any(not isinstance(event, dict) or event.get('learner_id') != authorized.learner_id for event in events):
            return error('learner_not_authorized', 'Event learner scope does not match authorized principal', 403)

        for value in events:
            definition_id = value.get('definition_id')
            definition = EVENT_DEFINITIONS.get(definition_id) if isinstance(definition_id, str) else None
            if definition and definition.get('actor_kind') != 'LEARNER':
                grant = (value.get('definition_id'), value.get('authority_ref'))
                if not isinstance(grant[1], str) or grant not in getattr(authorized, 'producer_grants', frozenset()):
                    return error('producer_not_authorized', 'Event producer authority is not authorized', 403)

        try:
            prepare_evidence_batch(events)
        except (TypeError, ValueError, OverflowError):
            return error('validation_failed', 'Batch identities or numeric values cannot form canonical receipts', 400)
        return accept_evidence_batch(app.state.db_url, events)

    @app.post('/v1/events')
    async def events(request: Request, x_anon_id: str = Header(..., alias='X-Anon-Id')):
        invalid = require_anon(x_anon_id)
        if invalid: return invalid
        if not check_rate(x_anon_id): return error('validation_failed', 'Rate limit exceeded', 400)
        try: payload = await request.json()
        except Exception: return error('validation_failed', 'Request body must be JSON', 400)
        validation = validate('events', payload)
        if validation: return error('validation_failed', validation, 400)
        with connect(app.state.db_url) as db:
            db.execute('INSERT OR IGNORE INTO users (anon_id, created_at) VALUES (?, ?)', (x_anon_id, time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())))
            for item in payload:
                next_id = db.execute('SELECT COALESCE(MAX(id), 0) + 1 FROM events').fetchone()[0]
                db.execute('INSERT INTO events (id, anon_id, type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)', (next_id, x_anon_id, item['type'], json.dumps(item.get('payload', {})), item['created_at']))
        return {'ok': True}

    return app


app = create_app()
