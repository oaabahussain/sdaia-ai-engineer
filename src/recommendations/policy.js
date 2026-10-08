// Browser-safe validation. K4.RULES.v1 is a pinned, uncalibrated baseline.
// A behavior change requires a new policy ID and reviewed tests.
const POLICY_V1 = Object.freeze({
  schema_version:1, policy_id:'K4.RULES.v1', algorithm:'DETERMINISTIC_RULES',
  first_review_delay_hours:48, trusted_incorrect_delay_hours:24,
  trusted_correct_delay_hours:96, max_review_delay_hours:720, max_action_items:1,
  include_modes:Object.freeze(['learn','practice']),
  exclude_modes:Object.freeze(['check','mock','section','full']),
  allow_provisional_objectives_for_labels:true,
  allow_provisional_objectives_for_prerequisites:false,
  fsrs_enabled:false, protected_candidates_allowed:false,
  untrusted_correctness_allowed:false, unavailable_content_behavior:'SAFE_FALLBACK'
});
const KEYS=Object.freeze(Object.keys(POLICY_V1).sort());

export function validateRulePolicy(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.getPrototypeOf(input) !== Object.prototype)
    throw new TypeError('K4 policy must be a plain object');
  const received=Object.keys(input).sort();
  if (received.length !== KEYS.length || received.some((key,i)=>key!==KEYS[i]))
    throw new TypeError('K4 policy contains missing or unknown fields');
  for (const key of KEYS) {
    const expected=POLICY_V1[key],actual=input[key];
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual) || actual.length!==expected.length ||
          actual.some((x,i)=>x!==expected[i]))
        throw new TypeError('Invalid K4 policy field: '+key);
    } else if (actual!==expected) {
      throw new TypeError('Invalid K4 policy field: '+key);
    }
  }
  const safe=structuredClone(input);
  Object.freeze(safe.include_modes);
  Object.freeze(safe.exclude_modes);
  return Object.freeze(safe);
}
