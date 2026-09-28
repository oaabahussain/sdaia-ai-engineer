const SUPPORTED_FINDING_TYPES = new Set([
  'PROVIDER_FAILURE',
  'CONTENT_QUALITY_FAILURE',
  'PRODUCTION_FAILURE'
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function clone(value) {
  return structuredClone(value);
}

export function createEvalCaseFromFinding(finding) {
  if (!finding || typeof finding !== 'object') {
    throw new Error('Finding is required');
  }
  if (!SUPPORTED_FINDING_TYPES.has(finding.type)) {
    throw new Error('Unsupported finding type for eval ingestion');
  }
  if (typeof finding.finding_id !== 'string' || !finding.finding_id) {
    throw new Error('finding_id is required');
  }
  if ('gold_status' in finding || 'review_status' in finding) {
    throw new Error('Gold/review authority cannot be supplied by a finding');
  }
  if (!finding.input || typeof finding.input !== 'object') {
    throw new Error('Finding input is required');
  }
  if (!finding.expected || typeof finding.expected !== 'object') {
    throw new Error('Finding expected result is required');
  }
  if (
    !Array.isArray(finding.evidence_refs) ||
    finding.evidence_refs.length === 0
  ) {
    throw new Error('Finding evidence_refs are required');
  }

  const evalCase = {
    schema_version: 1,
    eval_case_id: `eval:${finding.finding_id}`,
    source_finding_id: finding.finding_id,
    source_type: finding.type,
    review_status: 'PENDING_REVIEW',
    gold_status: 'CANDIDATE',
    input: clone(finding.input),
    expected: clone(finding.expected),
    evidence_refs: clone(finding.evidence_refs),
    created_at: finding.created_at ?? '1970-01-01T00:00:00Z'
  };

  return deepFreeze(evalCase);
}
