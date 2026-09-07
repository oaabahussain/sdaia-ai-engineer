import sqlite3
from pathlib import Path

schema = Path('db/schema.sql').read_text(encoding='utf-8')
db = sqlite3.connect(':memory:')
db.executescript(schema)
anon = '123e4567-e89b-42d3-a456-426614174000'
db.execute('INSERT INTO users (anon_id, created_at) VALUES (?, ?)', (anon, '2026-09-07T00:00:00Z'))
db.execute('INSERT INTO progress (anon_id, state_json, version, updated_at) VALUES (?, ?, ?, ?)', (anon, '{}', 1, '2026-09-07T00:00:00Z'))
db.execute('INSERT INTO questions (id, version, body_json, status, created_at) VALUES (?, ?, ?, ?, ?)', ('q1', 1, '{}', 'active', '2026-09-07T00:00:00Z'))
assert db.execute('SELECT anon_id FROM users').fetchone()[0] == anon
assert db.execute('SELECT version FROM progress').fetchone()[0] == 1
assert db.execute('SELECT status FROM questions').fetchone()[0] == 'active'
print('SQLite schema apply: PASS')
print('insert/select smoke queries: PASS (3)')
