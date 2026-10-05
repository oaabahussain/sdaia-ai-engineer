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


CREATE TABLE IF NOT EXISTS learner_events (
  event_id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  item_version_id TEXT NOT NULL,
  shown_at TEXT NOT NULL,
  event_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learner_events_track_time ON learner_events(track_id, shown_at);
CREATE INDEX IF NOT EXISTS idx_learner_events_item_time ON learner_events(item_version_id, shown_at);


CREATE TABLE IF NOT EXISTS k2_governance_records (
  kind TEXT NOT NULL CHECK (kind IN ('expansion','tranche','activation','improvement')),
  artifact_id TEXT NOT NULL,
  body_json TEXT NOT NULL,
  PRIMARY KEY (kind, artifact_id)
);

CREATE INDEX IF NOT EXISTS idx_k2_governance_kind ON k2_governance_records(kind, artifact_id);

CREATE TABLE IF NOT EXISTS k3_evidence_store_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  store_id TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS k3_evidence_events (
  store_seq INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_fingerprint TEXT NOT NULL,
  origin_id TEXT NOT NULL,
  origin_seq INTEGER NOT NULL CHECK (origin_seq >= 1),
  learner_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  assessment_attempt_id TEXT,
  item_version_id TEXT,
  content_release_id TEXT NOT NULL,
  definition_id TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  domain_id TEXT,
  form_id TEXT,
  item_interaction_id TEXT,
  locale TEXT,
  mode TEXT,
  objective_id TEXT,
  occurred_at TEXT,
  question_family_id TEXT,
  track_id TEXT,
  event_json TEXT NOT NULL,
  UNIQUE (store_id, event_id),
  UNIQUE (store_id, origin_id, origin_seq)
);

CREATE INDEX IF NOT EXISTS idx_k3_evidence_learner_seq
  ON k3_evidence_events(store_id, learner_id, store_seq);
CREATE INDEX IF NOT EXISTS idx_k3_evidence_activity_seq
  ON k3_evidence_events(store_id, activity_id, store_seq);
CREATE INDEX IF NOT EXISTS idx_k3_evidence_attempt_seq
  ON k3_evidence_events(store_id, assessment_attempt_id, store_seq);
CREATE INDEX IF NOT EXISTS idx_k3_evidence_item_seq
  ON k3_evidence_events(store_id, item_version_id, store_seq);
CREATE INDEX IF NOT EXISTS idx_k3_evidence_release_seq
  ON k3_evidence_events(store_id, content_release_id, store_seq);
CREATE INDEX IF NOT EXISTS idx_k3_evidence_definition_seq
  ON k3_evidence_events(store_id, definition_id, store_seq);


CREATE TABLE IF NOT EXISTS k3_identity_link_records (
  record_seq INTEGER PRIMARY KEY AUTOINCREMENT,
  identity_link_record_id TEXT NOT NULL UNIQUE,
  link_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('LINK','UNLINK')),
  source_learner_id TEXT NOT NULL,
  target_learner_id TEXT NOT NULL,
  effective_at TEXT NOT NULL,
  authority_ref TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  predecessor_record_id TEXT,
  created_at TEXT NOT NULL,
  record_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_k3_identity_link_source_seq
  ON k3_identity_link_records(source_learner_id, record_seq);
CREATE INDEX IF NOT EXISTS idx_k3_identity_link_target_seq
  ON k3_identity_link_records(target_learner_id, record_seq);
CREATE INDEX IF NOT EXISTS idx_k3_identity_link_link_seq
  ON k3_identity_link_records(link_id, record_seq);

-- The logical export records remain append-only outside privileged privacy work.
-- learner_id is an internal erasure index, not an exported schema field.
CREATE TABLE IF NOT EXISTS k3_evidence_export_records (
  record_seq INTEGER PRIMARY KEY AUTOINCREMENT,
  export_record_id TEXT NOT NULL UNIQUE,
  event_id TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  record_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_k3_export_learner
  ON k3_evidence_export_records(learner_id, record_seq);

CREATE TABLE IF NOT EXISTS k3_projection_caches (
  projection_id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  projection_json TEXT NOT NULL
);

-- Contains no learner IDs, event hashes, or copies of erased evidence.
CREATE TABLE IF NOT EXISTS k3_privacy_replay_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  replay_complete INTEGER NOT NULL CHECK (replay_complete = 0),
  policy_json TEXT NOT NULL
);
