import test from 'node:test';
import assert from 'node:assert/strict';
import {validateK5Projection} from '../src/mastery/schema.js';
const hex=x=>x.repeat(64);
const empty=()=>({
 schema_version:1,projection_type:'EvidenceSufficiencyProjectionV1',policy_id:'K5.EVIDENCE.v1',
 source_store_id:'store',through_store_seq:0,learner_id:'learner',identity_scope:'LOCAL_UNAUTHENTICATED',
 track_id:'sdaia-ai-engineer',content_release_id:'release',question_payload_sha256:hex('a'),
 catalog_version:'catalog-1',catalog_canonical_sha256:hex('b'),objective_map_canonical_sha256:hex('c'),
 lineage_map_version:null,lineage_map_canonical_sha256:null,objective_map_version:'objectives-1',
 identity_resolution_version:null,integrity_status:'COMPLETE',observation_status:'NO_OBSERVATIONS',
 estimation_status:'DISABLED_UNVALIDATED',reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION'],
 observed_distinct_family_count:0,observed_distinct_interaction_count:0,observed_domain_count:0,
 objectives:[],mastery_estimate:null,readiness_estimate:null,readiness_probability:null,confidence_interval:null,model_validation_ref:null
});
test('full normative empty fixture is valid',()=>assert.equal(validateK5Projection(empty()),true));
test('omitted source IDs or catalog mapping hashes and forged digest are rejected',()=>{
 for(const key of ['source_store_id','question_payload_sha256','catalog_canonical_sha256','objective_map_canonical_sha256','track_id','identity_scope']){
  const v=empty();delete v[key];assert.throws(()=>validateK5Projection(v),/missing/i,key);
 }
 for(const key of ['catalog_canonical_sha256','objective_map_canonical_sha256'])
  assert.throws(()=>validateK5Projection({...empty(),[key]:'not-a-sha'}),/hash|sha|digest/i);
});
test('reject impossible status tuples and unsupported enum aliases',()=>{
 assert.throws(()=>validateK5Projection({...empty(),integrity_status:'COMPLETE',observation_status:'QUARANTINED'}),/status/i);
 assert.throws(()=>validateK5Projection({...empty(),integrity_status:'INVALID'}),/status/i);
 assert.throws(()=>validateK5Projection({...empty(),observation_status:'OBSERVED'}),/status/i);
});
test('all five output estimator fields must remain exactly JSON null',()=>{
 for(const field of ['mastery_estimate','readiness_estimate','readiness_probability','confidence_interval','model_validation_ref'])
  assert.throws(()=>validateK5Projection({...empty(),[field]:0}),/null/i,field);
});
test('source corruption prohibits nonzero counts and requires source integrity reason',()=>{
 const r=['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_TRUSTED_EVALUATION','SOURCE_INTEGRITY_INVALID'];
 assert.throws(()=>validateK5Projection({...empty(),integrity_status:'SOURCE_INVALID',observation_status:'QUARANTINED',observed_distinct_family_count:2,reason_codes:r}),/count|source/i);
 assert.throws(()=>validateK5Projection({...empty(),integrity_status:'SOURCE_INVALID',observation_status:'QUARANTINED',reason_codes:r.slice(0,3)}),/reason/i);
});
test('global no-scoring and unauthenticated identity reasons are mandatory',()=>{
 for(const reason of ['IDENTITY_UNVERIFIED','CALIBRATION_NOT_APPROVED','NO_TRUSTED_EVALUATION'])
  assert.throws(()=>validateK5Projection({...empty(),reason_codes:empty().reason_codes.filter(x=>x!==reason)}),/reason/i);
});
test('lineage version and SHA-256 digest must be both present or both absent',()=>{
 assert.throws(()=>validateK5Projection({...empty(),lineage_map_version:'lineage-v1'}),/lineage/i);
});
test('reject private event fields and unordered reasons',()=>{
 assert.throws(()=>validateK5Projection({...empty(),response_text:'private answer'}),/unknown/i);
 assert.throws(()=>validateK5Projection({...empty(),reason_codes:['NO_EVIDENCE','CALIBRATION_NOT_APPROVED']}),/sort/i);
});
