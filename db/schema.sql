CREATE TABLE users (
  anon_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE progress (
  anon_id TEXT PRIMARY KEY REFERENCES users(anon_id),
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE questions (
  id TEXT NOT NULL,
  version INTEGER NOT NULL,
  body_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','active','retired')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (id, version)
);

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  anon_id TEXT NOT NULL REFERENCES users(anon_id),
  question_id TEXT NOT NULL,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('wrong_answer','unclear','typo','too_easy','other')),
  details TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  anon_id TEXT NOT NULL REFERENCES users(anon_id),
  type TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL
);
