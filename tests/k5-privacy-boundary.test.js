import test from 'node:test';
import assert from 'node:assert/strict';
import {readK5Source} from '../src/mastery/source.js';
import {validateK5Projection} from '../src/mastery/schema.js';
const EMPTY={
 schema_version:1,projection_type:'EvidenceSufficiencyProjectionV1',policy_id:'K5.EVIDENCE.v1',
 source_store_id:'local-store',through_store_seq:0,learner_id:'opaque-learner',
 identity_scope:'LOCAL_UNAUTHENTICATED',track_id:'sdaia-ai-engineer',content_release_id:'release',
 question_payload_sha256:'a'.repeat(64),catalog_version:'catalog-v1',
 catalog_canonical_sha256:'b'.repeat(64),objective_map_canonical_sha256:'c'.repeat(64),
 lineage_map_version:null,lineage_map_canonical_sha256:null,objective_map_version:'objectives-v1',
 identity_resolution_version:null,integrity_status:'COMPLETE',observation_status:'NO_OBSERVATIONS',
 estimation_status:'DISABLED_UNVALIDATED',
 reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION'],
 observed_distinct_family_count:0,observed_distinct_interaction_count:0,observed_domain_count:0,
 objectives:[],mastery_estimate:null,readiness_estimate:null,readiness_probability:null,
 confidence_interval:null,model_validation_ref:null
};
const store={store_id:'store',getSourceHead:async()=>({store_id:'store',through_store_seq:0}),
 readRange:async()=>[]};
test('rejects direct PII learner IDs before reading K3 evidence',async()=>{
 for(const learnerId of ['example@example.com','+966555555555','192.168.0.1','2001:db8::1','::1','[2001:db8::5]','::ffff:192.0.2.42','fe80::1%eth0',' 2001:db8::1 ',' [2001:db8::1] ',' 192.168.0.1 ',' +966555555555 ',' example@example.com ']){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
 }
});
test('strict public K5 projection cannot export direct PII as learner scope',()=>{
 for(const learner_id of ['example@example.com','+966555555555','192.168.0.1','2001:db8::1','::1','[2001:db8::5]','::ffff:192.0.2.42','fe80::1%eth0',' 2001:db8::1 ',' [2001:db8::1] ',' 192.168.0.1 ',' +966555555555 ',' example@example.com '])
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id}),/PII|pseudonym/i,learner_id);
});
test('opaque pseudonyms remain valid in the privacy contract',()=>{
 assert.equal(validateK5Projection(EMPTY),true);
});
