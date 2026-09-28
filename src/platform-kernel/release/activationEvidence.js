import fs from 'node:fs';
import Ajv from 'ajv';

const activationSchema = JSON.parse(
  fs.readFileSync(
    new URL('../../../data/schema/activation-evidence-v1.schema.json', import.meta.url),
    'utf8'
  )
);
const validateActivationEvidenceV1 = new Ajv({
  strict: false,
  allErrors: true,
  formats: { 'date-time': true }
}).compile(activationSchema);

const evaluatedDecisions = new WeakSet();

function result(decision, reason, missingEvidenceClasses = [], blockers = []) {
  const value = Object.freeze({ decision, reason, missingEvidenceClasses, blockers });
  evaluatedDecisions.add(value);
  return value;
}

function criticalDecision(policy) {
  const action = policy?.blocker_policy?.critical_alert;
  return ['HOLD', 'QUARANTINE', 'ROLLBACK'].includes(action) ? action : 'HOLD';
}

export function isEvaluatedActivationDecision(value) {
  return !!value && evaluatedDecisions.has(value);
}

export function evaluateActivationEvidence(evidence, canaryPolicy) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    throw new Error('Structured activation evidence is required');
  }
  if (!validateActivationEvidenceV1(evidence)) {
    throw new Error(
      'Invalid ActivationEvidenceV1: ' +
      JSON.stringify(validateActivationEvidenceV1.errors)
    );
  }
  if (!canaryPolicy || !Array.isArray(canaryPolicy.required_evidence_classes)) {
    throw new Error('Canary policy is required');
  }

  const blockers = [...evidence.blockers];
  if (blockers.length) {
    return result(criticalDecision(canaryPolicy), 'critical_blocker', [], blockers);
  }

  const observed = new Set(evidence.canary_observation.evidence_classes);
  const missingEvidenceClasses = canaryPolicy.required_evidence_classes
    .filter(item => !observed.has(item));

  if (missingEvidenceClasses.length) {
    return result('HOLD', 'missing_required_evidence', missingEvidenceClasses, []);
  }

  if (evidence.evidence_sufficiency !== 'SUFFICIENT') {
    return result('HOLD', 'insufficient_evidence', [], []);
  }

  if (Number.isFinite(canaryPolicy.minimum_observation_count)) {
    const observedCount = evidence.canary_observation.observation_count;
    if (
      !Number.isFinite(observedCount) ||
      observedCount < canaryPolicy.minimum_observation_count
    ) {
      return result('HOLD', 'insufficient_observation_volume', [], []);
    }
  }

  if (
    evidence.runtime_verification.status === 'FAIL' ||
    evidence.correctness_summary.status === 'FAIL' ||
    evidence.duplicate_findings.status === 'FAIL'
  ) {
    return result(criticalDecision(canaryPolicy), 'critical_quality_failure', [], []);
  }

  if (
    evidence.review_summary.unresolved_count > 0 ||
    evidence.review_summary.status === 'REVIEW_REQUIRED' ||
    evidence.review_summary.status === 'ABSTAIN'
  ) {
    return result('HOLD', 'review_incomplete', [], []);
  }

  const nonCritical = [
    evidence.bilingual_summary.status,
    evidence.accessibility_summary.status
  ];
  if (nonCritical.some(status => ['FAIL', 'REVIEW_REQUIRED', 'ABSTAIN'].includes(status))) {
    return result('HOLD', 'quality_evidence_incomplete', [], []);
  }

  return result('PROMOTE', 'activation_evidence_passed', [], []);
}
