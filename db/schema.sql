CREATE TABLE IF NOT EXISTS users (
  anon_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  anon_id TEXT PRIMARY KEY REFERENCES users(anon_id),
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT NOT NULL,
  version INTEGER NOT NULL,
  body_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','active','retired')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY,
  anon_id TEXT NOT NULL REFERENCES users(anon_id),
  question_id TEXT NOT NULL,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('wrong_answer','unclear','typo','too_easy','other')),
  details TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  anon_id TEXT NOT NULL REFERENCES users(anon_id),
  type TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS factory_runs (
  run_id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','running','partial','failed','completed','cancelled')),
  attempt INTEGER NOT NULL CHECK (attempt >= 1),
  input_hash TEXT NOT NULL,
  output_ref TEXT,
  request_json TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  retry_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS factory_stage_outputs (
  run_id TEXT NOT NULL REFERENCES factory_runs(run_id),
  stage TEXT NOT NULL,
  output_json TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (run_id, stage)
);

CREATE TABLE IF NOT EXISTS factory_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  record_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_factory_audit_run ON factory_audit(run_id, id);
