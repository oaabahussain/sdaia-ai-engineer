import test from 'node:test';
import assert from 'node:assert/strict';
import {renderK5Summary} from '../src/mastery/view.js';
const empty=()=>({
 schema_version:1,projection_type:'EvidenceSufficiencyProjectionV1',policy_id:'K5.EVIDENCE.v1',
 source_store_id:'store',through_store_seq:0,learner_id:'learner',identity_scope:'LOCAL_UNAUTHENTICATED',
 track_id:'sdaia-ai-engineer',content_release_id:'release',
 question_payload_sha256:'a'.repeat(64),catalog_version:'catalog-1',
 catalog_canonical_sha256:'b'.repeat(64),objective_map_canonical_sha256:'c'.repeat(64),
 lineage_map_version:null,lineage_map_canonical_sha256:null,objective_map_version:'obj-v1',
 identity_resolution_version:null,integrity_status:'COMPLETE',observation_status:'NO_OBSERVATIONS',
 estimation_status:'DISABLED_UNVALIDATED',
 reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION'],
 observed_distinct_family_count:0,observed_distinct_interaction_count:0,observed_domain_count:0,
 objectives:[],mastery_estimate:null,readiness_estimate:null,readiness_probability:null,
 confidence_interval:null,model_validation_ref:null
});
test('Arabic recorded activity does not claim readiness',()=>{
 const r=renderK5Summary({projection:empty(),locale:'ar'});
 assert.equal(r.heading,'النشاط المسجل');assert.equal(r.count,0);
 assert.ok(r.explanation.includes('الجاهزية'));
 assert.equal(r.direction,'rtl');assert.doesNotMatch(r.explanation,/%/);
});
test('English accessible description omits accuracy, ranking and passing chance',()=>{
 const r=renderK5Summary({projection:empty(),locale:'en'});
 assert.equal(r.heading,'Recorded activity');assert.equal(r.direction,'ltr');
 assert.match(r.explanation,/readiness.*not available/i);
 assert.doesNotMatch(JSON.stringify(r),/score:|passed|accuracy|100%/i);
});
test('source invalid must hide optimistic recorded counts',()=>{
 const r=renderK5Summary({projection:{...empty(),integrity_status:'SOURCE_INVALID',
  observation_status:'QUARANTINED',
  reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_TRUSTED_EVALUATION','SOURCE_INTEGRITY_INVALID']
 },locale:'en'});
 assert.equal(r.count,null);assert.match(r.body,/unavailable|verify|cannot/i);
});
test('untrusted response text must never appear as rendered HTML',()=>{
 assert.throws(()=>renderK5Summary({projection:{...empty(),raw_response:'<img src=x onerror=alert(1)>'},locale:'ar'}),/unknown/i);
});
