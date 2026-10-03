const ALLOWED = new Set([
  'schema_version','event_id','learner_id','track_id','content_release_id','form_id',
  'question_family_id','item_version_id','objective_id','domain_id','mode','locale',
  'shown_at','answered_at','answer','correct','confidence','latency_ms','hint_used',
  'explanation_opened','attempt_number','device'
]);

const REQUIRED_BASE = [
  'event_id','learner_id','track_id','content_release_id','form_id','question_family_id',
  'item_version_id','objective_id','domain_id','mode','locale','shown_at','answered_at',
  'correct','latency_ms','hint_used','explanation_opened','attempt_number'
];

const STRING_FIELDS = [
  'event_id','learner_id','track_id','content_release_id','form_id','question_family_id',
  'item_version_id','objective_id','domain_id','mode','locale','shown_at','answered_at'
];

const MODES = new Set(['learn','practice','check','section','mock']);
const LOCALES = new Set(['ar','en']);
const CONFIDENCE = new Set(['low','medium','high',null]);
const SLUG = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function baseShapeIsValid(record) {
  if (!isObject(record) || record.schema_version !== 1) return false;
  for (const key of Object.keys(record)) if (!ALLOWED.has(key)) return false;
  for (const field of REQUIRED_BASE) {
    if (!Object.hasOwn(record, field) || record[field] === null || record[field] === '') return false;
  }
  for (const field of STRING_FIELDS) if (typeof record[field] !== 'string' || record[field].length === 0) return false;
  if (!SLUG.test(record.track_id) || !SLUG.test(record.domain_id)) return false;
  if (!MODES.has(record.mode) || !LOCALES.has(record.locale)) return false;
  if (Number.isNaN(Date.parse(record.shown_at)) || Number.isNaN(Date.parse(record.answered_at))) return false;
  if (Date.parse(record.answered_at) < Date.parse(record.shown_at)) return false;
  if (typeof record.correct !== 'boolean') return false;
  if (!Number.isFinite(record.latency_ms) || record.latency_ms < 0) return false;
  if (typeof record.hint_used !== 'boolean' || typeof record.explanation_opened !== 'boolean') return false;
  if (!Number.isInteger(record.attempt_number) || record.attempt_number < 1) return false;

  if (Object.hasOwn(record, 'answer')) {
    const value = record.answer;
    if (!(value === null || typeof value === 'string' || Number.isInteger(value))) return false;
  }
  if (Object.hasOwn(record, 'confidence') && !CONFIDENCE.has(record.confidence)) return false;
  if (Object.hasOwn(record, 'device') && !isObject(record.device)) return false;
  return true;
}

export function classifyLegacyLearnerEvent(record) {
  if (!baseShapeIsValid(record)) return 'INVALID_LEGACY_RECORD';
  if (Object.hasOwn(record, 'answer') && Object.hasOwn(record, 'confidence')) return 'VALID_V1';
  return 'KNOWN_V1_VARIANT';
}

export function readLegacyLearnerEvidence(record) {
  const classification = classifyLegacyLearnerEvent(record);
  return {
    classification,
    granularity: 'COARSE_AGGREGATE',
    evidence: classification === 'INVALID_LEGACY_RECORD' ? null : structuredClone(record)
  };
}
