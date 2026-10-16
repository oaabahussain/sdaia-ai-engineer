// K5 estimator remains deliberately dormant. Exposure and system grading are not mastery evidence.
// Do not activate numeric projections without a separately approved, validated assessment contract.
export function requestK5Estimator({policyId} = {}) {
  if (policyId !== 'K5.EVIDENCE.v1') throw new Error('unsupported K5 policy');
  return Object.freeze({
    status:'DISABLED_UNVALIDATED',
    mastery_estimate:null,
    readiness_estimate:null,
    readiness_probability:null,
    confidence_interval:null,
    model_validation_ref:null
  });
}
