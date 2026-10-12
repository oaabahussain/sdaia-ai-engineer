import test from 'node:test';
import assert from 'node:assert/strict';
import { validateK5Projection } from '../src/mastery/schema.js';
const FIELDS=['mastery_estimate','readiness_estimate','readiness_probability','confidence_interval','model_validation_ref'];
const BASE={schema_version:1,projection_type:'EvidenceSufficiencyProjectionV1',policy_id:'K5.EVIDENCE.v1',integrity_status:'COMPLETE',observation_status:'NO_OBSERVATIONS',estimation_status:'DISABLED_UNVALIDATED',reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION'],observed_distinct_family_count:0,observed_distinct_interaction_count:0,observed_domain_count:0,objectives:[],...Object.fromEntries(FIELDS.map(x=>[x,null]))};
test('strict K5 output accepts a dormant empty contract',()=>assert.equal(validateK5Projection(BASE),true));
for(const key of FIELDS){
 test('reject numeric or missing '+key,()=>{
  assert.throws(()=>validateK5Projection({...BASE,[key]:0}),/null/i);
  const copy={...BASE};delete copy[key];assert.throws(()=>validateK5Projection(copy),/missing/i);
 });
}
test('reject unordered/duplicate reason codes',()=>{
 assert.throws(()=>validateK5Projection({...BASE,reason_codes:['NO_EVIDENCE','CALIBRATION_NOT_APPROVED']}),/sorted/i);
 assert.throws(()=>validateK5Projection({...BASE,reason_codes:['NO_EVIDENCE','NO_EVIDENCE']}),/sorted/i);
});
test('reject incorrect status tuples and unknown reasons',()=>{
 assert.throws(()=>validateK5Projection({...BASE,integrity_status:'COMPLETE',observation_status:'QUARANTINED'}),/status/i);
 assert.throws(()=>validateK5Projection({...BASE,reason_codes:['CUSTOM_UNKNOWN']}),/reason/i);
});
test('reject metadata fields that can leak raw learner answers',()=>{
 assert.throws(()=>validateK5Projection({...BASE,raw_response:'secret'}),/unknown/i);
});
