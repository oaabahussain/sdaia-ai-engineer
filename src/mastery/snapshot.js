import {requestK5Estimator} from './estimator.js';
export function buildK5Snapshot({policyId,exposure={}}={}) {
  const estimator=requestK5Estimator({policyId});
  return Object.freeze({
    schema:'k5.snapshot.v1',
    exposure:Object.freeze({
      families:Number.isSafeInteger(exposure.families)&&exposure.families>=0?exposure.families:null,
      interactions:Number.isSafeInteger(exposure.interactions)&&exposure.interactions>=0?exposure.interactions:null
    }),
    estimator
  });
}
