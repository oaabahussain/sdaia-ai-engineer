import {requestK5Estimator} from './estimator.js';
import {validateK5Projection} from './schema.js';

// Raw caller-provided exposure counts have no provenance and MUST NOT become
// public evidence. The first K5 release only derives a snapshot from a fully
// validated K3/K2 evidence-sufficiency projection.
export function buildK5Snapshot({projection}={}) {
  if(!projection)throw new Error('validated projection required');
  validateK5Projection(projection);
  const safe=['NO_OBSERVATIONS','OBSERVATIONS_PRESENT'].includes(projection.observation_status);
  return Object.freeze({
    schema:'k5.snapshot.v1',
    exposure:Object.freeze({
      families:safe?projection.observed_distinct_family_count:null,
      interactions:safe?projection.observed_distinct_interaction_count:null
    }),
    estimator:requestK5Estimator({policyId:projection.policy_id})
  });
}
