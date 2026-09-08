import json
import os
import sqlite3
import time
import uuid
from collections import defaultdict, deque
from pathlib import Path

from fastapi import FastAPI, Header, Request, Response
from fastapi.responses import JSONResponse
from jsonschema import Draft7Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT7

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
    'state': make_validator('state.schema.json'),
    'feedback': make_validator('feedback.schema.json'),
    'events': make_validator('events.schema.json'),
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
    with connect(db_url) as db:
        db.executescript((ROOT / 'db' / 'schema.sql').read_text(encoding='utf-8'))


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


def create_app(db_url=None):
    app = FastAPI(title='SDAIA AI Engineer Study Space API')
    app.state.db_url = db_url or os.getenv('DB_URL', 'sqlite:///./dev.db')
    init_db(app.state.db_url)

    @app.get('/v1/health')
    def health():
        return {'status': 'ok'}

    @app.get('/v1/bank')
    def bank(x_anon_id: str = Header(..., alias='X-Anon-Id')):
        invalid = require_anon(x_anon_id)
        if invalid: return invalid
        return {
            'questions': json.loads((DATA_DIR / 'questions.json').read_text(encoding='utf-8')),
            'sessions': json.loads((DATA_DIR / 'sessions.json').read_text(encoding='utf-8')),
            'learn': json.loads((DATA_DIR / 'learn.json').read_text(encoding='utf-8')),
            'cases': json.loads((DATA_DIR / 'cases.json').read_text(encoding='utf-8')),
            'weights': json.loads((DATA_DIR / 'weights.json').read_text(encoding='utf-8')),
        }

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
