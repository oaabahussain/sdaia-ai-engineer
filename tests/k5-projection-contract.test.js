import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePublicCatalog} from '../src/recommendations/publicCatalog.js';
import {deriveK5EvidenceSufficiency} from '../src/mastery/projection.js';
const ID='sdaia-ai-engineer',RELEASE=ID+'.bootstrap.v1';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const F1=ID+'.core-ai.reasoning.definition.best-description',F2=ID+'.core-ai.reasoning.definition.other-example';
const O1=ID+'.objective.core-ai.reasoning.v1',O2=ID+'.objective.core-ai.reasoning.v2';
const item=(f,o)=>({question_family_id:f,item_version_id:f+'.v1',objective_id:o,domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'});
function catalog(){return validatePublicCatalog({
 catalog:{schema_version:1,catalog_id:ID+'.public.bootstrap.v1',track_id:ID,
  content_release_id:RELEASE,question_payload_sha256:DIGEST,source:'MIGRATED_GRANDFATHERED_PUBLIC',
  items:[item(F1,O1),item(F2,O2)]},
 trackManifest:{id:ID,status:'active'},evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
 publicQuestions:[{id:F1+'.v1',family_id:F1,domain_id:'core-ai',answer:0},
  {id:F2+'.v1',family_id:F2,domain_id:'core-ai',answer:0}],
 objectives:{track_id:ID,objectives:[O1,O2].map(objective_id=>({
  objective_id,track_id:ID,domain_id:'core-ai',concept_ids:['core-ai.reasoning'],status:'provisional'}))}
});}
const objectives={version:'objective-v1',items:[{objective_id:O1,domain_id:'core-ai',mapping_status:'PROVISIONAL'},{objective_id:O2,domain_id:'core-ai',mapping_status:'PROVISIONAL'}]};
function event(seq,more={}){return {event_id:'event-'+seq,store_id:'store',store_seq:seq,learner_id:'L',track_id:ID,
 content_release_id:RELEASE,definition_id:'learner.item.presented@1',mode:'practice',
 item_interaction_id:'interaction-'+seq,question_family_id:F1,item_version_id:F1+'.v1',
 objective_id:O1,domain_id:'core-ai',event_fingerprint:'a'.repeat(64),...more};}
const correction=(seq,target)=>event(seq,{definition_id:'learner.evidence.correction.recorded@1',
 authority_ref:'forged',payload:{action:'VOID',target_event_id:target}});
async function project(events=[]){return deriveK5EvidenceSufficiency({
 source:{source_store_id:'store',through_store_seq:events.length?Math.max(...events.map(e=>e.store_seq)):0,
  learner_id:'L',track_id:ID,release_id:RELEASE},
 events,acceptedPublicCatalog:catalog(),acceptedObjectiveMap:objectives,
 policy:{policy_id:'K5.EVIDENCE.v1'},identityResolutionVersion:null
});}
const isNull=r=>['mastery_estimate','readiness_estimate','readiness_probability','confidence_interval','model_validation_ref'].forEach(key=>assert.strictEqual(r[key],null,key));
test('empty K5 source yields normative deterministic NO_OBSERVATIONS',async()=>{
 const r=await project();assert.equal(r.integrity_status,'COMPLETE');
 assert.equal(r.observation_status,'NO_OBSERVATIONS');assert.equal(r.through_store_seq,0);
 assert.deepEqual(r.reason_codes,['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION']);
 assert.match(r.catalog_canonical_sha256,/^[a-f0-9]{64}$/);isNull(r);assert.deepEqual(r,await project());
});
test('public presentation dedup does not infer grade even when SYSTEM event claims score',async()=>{
 const r=await project([event(1),event(2,{item_interaction_id:'interaction-1'}),
  event(3,{definition_id:'learner.response.evaluated@1',authority_ref:'SYSTEM',payload:{score:100}})]);
 assert.equal(r.integrity_status,'COMPLETE');assert.equal(r.observation_status,'OBSERVATIONS_PRESENT');
 assert.equal(r.observed_distinct_family_count,1);assert.equal(r.observed_distinct_interaction_count,1);
 assert.ok(r.reason_codes.includes('EXPOSURE_ONLY'));isNull(r);
});
test('forged correction quarantines target, retains independent public family',async()=>{
 const r=await project([event(1),event(2,{question_family_id:F2,item_version_id:F2+'.v1',objective_id:O2}),correction(3,'event-1')]);
 assert.equal(r.integrity_status,'CONFLICTED');assert.equal(r.observation_status,'QUARANTINED');
 assert.equal(r.observed_distinct_family_count,1);assert.ok(r.reason_codes.includes('CORRECTION_AUTHORITY_UNVERIFIED'));isNull(r);
});
test('unbounded missing correction target is SOURCE_INVALID with zero counts',async()=>{
 const r=await project([event(1),correction(2,'absent')]);
 assert.equal(r.integrity_status,'SOURCE_INVALID');assert.equal(r.observation_status,'QUARANTINED');
 assert.equal(r.observed_distinct_family_count,0);assert.deepEqual(r.objectives,[]);
 assert.ok(r.reason_codes.includes('SOURCE_INTEGRITY_INVALID'));
});
test('mapping-only mismatch maps exactly to INCOMPLETE/INSUFFICIENT_EVIDENCE',async()=>{
 const r=await project([event(1,{item_version_id:'unmapped'})]);
 assert.equal(r.integrity_status,'INCOMPLETE');assert.equal(r.observation_status,'INSUFFICIENT_EVIDENCE');
 assert.ok(r.reason_codes.includes('UNKNOWN_FAMILY_MAPPING'));isNull(r);
});
test('competing unauthenticated corrections give ordered union of reasons',async()=>{
 const r=await project([event(1),correction(2,'event-1'),correction(3,'event-1')]);
 assert.equal(r.integrity_status,'CONFLICTED');
 for(const code of ['CORRECTION_AUTHORITY_UNVERIFIED','CORRECTION_CONFLICT'])assert.ok(r.reason_codes.includes(code));
 assert.deepEqual(r.reason_codes,[...r.reason_codes].sort());
});
test('input ordering permutation does not affect same pinned projection',async()=>{
 const events=[event(1),event(2,{question_family_id:F2,item_version_id:F2+'.v1',objective_id:O2})];
 const a=await project(events),b=await project([...events].reverse());assert.deepEqual(a,b);
});
