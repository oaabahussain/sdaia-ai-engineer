import test from 'node:test';
import assert from 'node:assert/strict';
import {buildK5Snapshot} from '../src/mastery/snapshot.js';
const base=()=>({schema_version:1,projection_type:'EvidenceSufficiencyProjectionV1',policy_id:'K5.EVIDENCE.v1',
 source_store_id:'store',through_store_seq:0,learner_id:'L',identity_scope:'LOCAL_UNAUTHENTICATED',
 track_id:'T',content_release_id:'R',question_payload_sha256:'a'.repeat(64),
 catalog_version:'v1',catalog_canonical_sha256:'b'.repeat(64),objective_map_canonical_sha256:'c'.repeat(64),
 lineage_map_version:null,lineage_map_canonical_sha256:null,objective_map_version:'o1',identity_resolution_version:null,
 integrity_status:'COMPLETE',observation_status:'NO_OBSERVATIONS',estimation_status:'DISABLED_UNVALIDATED',
 reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION'],
 observed_distinct_family_count:0,observed_distinct_interaction_count:0,observed_domain_count:0,objectives:[],
 mastery_estimate:null,readiness_estimate:null,readiness_probability:null,confidence_interval:null,model_validation_ref:null
});
test('browser cannot invent recorded family count without validated K5 projection',()=>{
 assert.throws(()=>buildK5Snapshot({policyId:'K5.EVIDENCE.v1',exposure:{families:1120,interactions:200}}),/validated projection|projection required/i);
});
test('snapshot accepts verified source projection and stays disabled',()=>{
 const snapshot=buildK5Snapshot({projection:base()});
 assert.equal(snapshot.exposure.families,0);assert.equal(snapshot.exposure.interactions,0);
 assert.equal(snapshot.estimator.readiness_estimate,null);
});
test('quarantined projected aggregates are hidden, never presented as exact',()=>{
 const p={...base(),integrity_status:'SOURCE_INVALID',observation_status:'QUARANTINED',
  reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_TRUSTED_EVALUATION','SOURCE_INTEGRITY_INVALID']};
 const s=buildK5Snapshot({projection:p});
 assert.equal(s.exposure.families,null);assert.equal(s.exposure.interactions,null);
});
