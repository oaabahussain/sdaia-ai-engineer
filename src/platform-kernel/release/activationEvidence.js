function result(decision, reason, missingEvidenceClasses = [], blockers = []) {
  return { decision, reason, missingEvidenceClasses, blockers };
}

function criticalDecision(policy) {
  const action = policy?.blocker_policy?.critical_alert;
  return ['HOLD', 'QUARANTINE', 'ROLLBACK'].includes(action) ? action : 'HOLD';
}

export function evaluateActivationEvidence(evidence, canaryPolicy) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    throw new Error('Structured activation evidence is required');
  }
  if (!canaryPolicy || !Array.isArray(canaryPolicy.required_evidence_classes)) {
    throw new Error('Canary policy is required');
  }

  const blockers = Array.isArray(evidence.blockers) ? [...evidence.blockers] : [];
  if (blockers.length) {
    return result(
      criticalDecision(canaryPolicy),
      'critical_blocker',
      [],
      blockers
    );
  }

  const observed = new Set(
    Array.isArray(evidence.canary_observation?.evidence_classes)
      ? evidence.canary_observation.evidence_classes
      : []
  );
  const missingEvidenceClasses = canaryPolicy.required_evidence_classes
    .filter(item => !observed.has(item));

  if (missingEvidenceClasses.length) {
    return result(
      canaryPolicy?.blocker_policy?.missing_required_metric === 'HOLD'
        ? 'HOLD'
        : 'HOLD',
      'missing_required_evidence',
      missingEvidenceClasses,
      []
    );
  }

  if (evidence.evidence_sufficiency !== 'SUFFICIENT') {
    return result('HOLD', 'insufficient_evidence', [], []);
  }

  if (
    evidence.runtime_verification?.status === 'FAIL' ||
    evidence.correctness_summary?.status === 'FAIL' ||
    evidence.duplicate_findings?.status === 'FAIL'
  ) {
    return result(
      criticalDecision(canaryPolicy),
      'critical_quality_failure',
      [],
      []
    );
  }

  if (
    evidence.review_summary?.unresolved_count > 0 ||
    evidence.review_summary?.status === 'REVIEW_REQUIRED' ||
    evidence.review_summary?.status === 'ABSTAIN'
  ) {
    return result('HOLD', 'review_incomplete', [], []);
  }

  const nonCritical = [
    evidence.bilingual_summary?.status,
    evidence.accessibility_summary?.status
  ];
  if (nonCritical.some(status => ['FAIL', 'REVIEW_REQUIRED', 'ABSTAIN'].includes(status))) {
    return result('HOLD', 'quality_evidence_incomplete', [], []);
  }

  return result('PROMOTE', 'activation_evidence_passed', [], []);
}
