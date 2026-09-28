const REQUIRED_POLICY_KEYS = Object.freeze([
  'source_policy_version',
  'quality_policy_version',
  'review_policy_version',
  'tranche_calibration_policy_version'
]);

function validatePolicyRefs(policyRefs) {
  for (const key of REQUIRED_POLICY_KEYS) {
    if (typeof policyRefs?.[key] !== 'string' || !policyRefs[key]) {
      throw new Error(`Missing policy reference: ${key}`);
    }
  }
}

function validateExpansionPlan(expansionPlan) {
  if (!expansionPlan || typeof expansionPlan !== 'object') {
    throw new Error('Expansion plan is required');
  }
  if (!Array.isArray(expansionPlan.coverage_gap_ids) || expansionPlan.coverage_gap_ids.length === 0) {
    throw new Error('Expansion plan requires coverage gaps');
  }
  if (!Array.isArray(expansionPlan.priorities) || expansionPlan.priorities.length === 0) {
    throw new Error('Expansion plan priorities are required');
  }

  const approved = new Set(expansionPlan.coverage_gap_ids);
  for (const priority of expansionPlan.priorities) {
    if (
      typeof priority?.gap_id !== 'string' ||
      !approved.has(priority.gap_id) ||
      !Number.isInteger(priority.requested_count) ||
      priority.requested_count < 1
    ) {
      throw new Error('Expansion plan priority violates coverage gap lineage');
    }
  }
}

function validateDecision(trancheDecision) {
  if (!trancheDecision || typeof trancheDecision !== 'object') {
    throw new Error('Tranche decision is required');
  }
  if (trancheDecision.decision === 'HOLD') {
    throw new Error('HOLD decisions are not runnable');
  }
  if (
    !['EXPAND', 'CONTRACT', 'CONTINUE'].includes(trancheDecision.decision) ||
    !Number.isInteger(trancheDecision.requestedCount) ||
    trancheDecision.requestedCount < 1
  ) {
    throw new Error('Runnable tranche decision with positive requestedCount is required');
  }
  if (typeof trancheDecision.createdAt !== 'string' || !trancheDecision.createdAt) {
    throw new Error('trancheDecision.createdAt is required');
  }
  if (!trancheDecision.riskDistribution || !trancheDecision.capacityInputs) {
    throw new Error('Tranche decision evidence envelope is required');
  }
}

function allocateRequests(priorities, requestedCount) {
  let remaining = requestedCount;
  const requests = [];

  for (const priority of [...priorities].sort((a, b) => a.rank - b.rank)) {
    if (remaining <= 0) break;
    const requestedFamilies = Math.min(priority.requested_count, remaining);
    if (requestedFamilies > 0) {
      requests.push({
        coverage_gap_id: priority.gap_id,
        requested_families: requestedFamilies
      });
      remaining -= requestedFamilies;
    }
  }

  if (requests.length === 0) {
    throw new Error('No runnable coverage gap demand remains');
  }

  return requests;
}

export function buildTranchePlan(expansionPlan, trancheDecision, policyRefs) {
  validateExpansionPlan(expansionPlan);
  validateDecision(trancheDecision);
  validatePolicyRefs(policyRefs);

  const requests = allocateRequests(
    expansionPlan.priorities,
    trancheDecision.requestedCount
  );

  return {
    schema_version: 1,
    tranche_id: `tranche:${expansionPlan.plan_id}:${trancheDecision.createdAt}`,
    expansion_plan_id: expansionPlan.plan_id,
    track_id: expansionPlan.track_id,
    requests,
    policy_refs: { ...policyRefs },
    risk_distribution: { ...trancheDecision.riskDistribution },
    capacity_inputs: { ...trancheDecision.capacityInputs },
    status: 'PLANNED',
    created_at: trancheDecision.createdAt
  };
}
