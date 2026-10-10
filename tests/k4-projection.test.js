import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePublicCatalog } from '../src/recommendations/publicCatalog.js';
import { validateRulePolicy } from '../src/recommendations/policy.js';
import { computeScheduleProjection } from '../src/recommendations/projection.js';

const RELEASE='sdaia-ai-engineer.bootstrap.v1';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const FAMILY='sdaia-ai-engineer.core-ai.reasoning.definition.best-description';
const VERSION=FAMILY+'.v1';
const OBJECTIVE='sdaia-ai-engineer.objective.core-ai.reasoning.v1';
const LEARNER='learner:opaque',STORE='source-local-1',NOW='2026-10-08T22:00:00.000Z';
const policy=validateRulePolicy({
  schema_version:1,policy_id:'K4.RULES.v1',algorithm:'DETERMINISTIC_RULES',
  first_review_delay_hours:48,trusted_incorrect_delay_hours:24,
  trusted_correct_delay_hours:96,max_review_delay_hours:720,max_action_items:1,
  include_modes:['learn','practice'],exclude_modes:['check','mock','section','full'],
  allow_provisional_objectives_for_labels:true,
  allow_provisional_objectives_for_prerequisites:false,fsrs_enabled:false,
  protected_candidates_allowed:false,untrusted_correctness_allowed:false,
  unavailable_content_behavior:'SAFE_FALLBACK'
});
function catalog(){
  return validatePublicCatalog({
    catalog:{schema_version:1,catalog_id:'sdaia-ai-engineer.public.bootstrap.v1',
      track_id:'sdaia-ai-engineer',content_release_id:RELEASE,question_payload_sha256:DIGEST,
      source:'MIGRATED_GRANDFATHERED_PUBLIC',items:[{
        question_family_id:FAMILY,item_version_id:VERSION,objective_id:OBJECTIVE,
        domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'
      }]},
    trackManifest:{id:'sdaia-ai-engineer',status:'active'},
    evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
    publicQuestions:[{id:VERSION,family_id:FAMILY,domain_id:'core-ai',answer:0}],
    objectives:{track_id:'sdaia-ai-engineer',objectives:[{
      objective_id:OBJECTIVE,track_id:'sdaia-ai-engineer',domain_id:'core-ai',
      concept_ids:['core-ai.reasoning'],status:'provisional'
    }]}
  });
}
function event(seq,definition_id='learner.item.presented@1',overrides={}){
  return {schema_version:2,event_id:'event-'+seq,definition_id,
    store_id:STORE,store_seq:seq,learner_id:LEARNER,
    track_id:'sdaia-ai-engineer',content_release_id:RELEASE,
    activity_id:'activity-1',mode:'practice',locale:'en',
    item_interaction_id:'interaction-'+seq,question_family_id:FAMILY,
    item_version_id:VERSION,objective_id:OBJECTIVE,domain_id:'core-ai',
    accepted_at:'2026-10-08T10:00:00.000Z',
    occurred_at:'2026-10-08T10:00:00.000Z',payload:{},...overrides};
}
function calc(events,opts={}) {
  return computeScheduleProjection({
    learnerId:LEARNER,sourceStoreId:STORE,throughStoreSeq:events.length?Math.max(...events.map(x=>x.store_seq)):0,
    events,activeReleaseId:RELEASE,policy,nowIso:NOW,acceptedContentCatalog:catalog(),...opts
  });
}

test('empty K4 evidence is valid deterministic source-bound projection',()=>{
  const a=calc([]);
  assert.equal(a.integrity_status,'COMPLETE');
  assert.equal(a.through_store_seq,0);
  assert.equal(a.generated_for_at,NOW);
  assert.deepEqual(a.items,[]);
  assert.deepEqual(a,calc([]));
});

test('accepted presentations are deduplicated by family and interaction',()=>{
  const presented=event(1);
  const repeated=event(2,'learner.item.presented@1',{item_interaction_id:presented.item_interaction_id});
  const answer=event(3,'learner.response.recorded@1',{
    item_interaction_id:presented.item_interaction_id,
    payload:{response_version:1,response_kind:'OPTION',response:{option_index:0}}
  });
  const evaluated=event(4,'learner.response.evaluated@1',{
    item_interaction_id:presented.item_interaction_id,authority_ref:'authority:untrusted-browser',
    payload:{response_event_id:answer.event_id,evaluation_status:'GRADED',correct:true,score:1}
  });
  const result=calc([presented,repeated,answer,evaluated]);
  assert.equal(result.items.length,1);
  assert.equal(result.items[0].exposure_count,1);
  assert.equal(result.items[0].grade_evidence,'EXPOSURE_ONLY');
  assert.equal(result.items[0].last_graded_at,null);
  assert.equal(result.items[0].last_exposure_at,presented.accepted_at);
  assert.equal('mastery' in result,false);
  assert.equal('readiness' in result,false);
});

test('K3 VOID and SUPERSEDE corrections recompute exposure without changing raw input',()=>{
  const a=event(1),b=event(2,'learner.item.presented@1',{item_interaction_id:'new-interaction'});
  const correction=event(3,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'SUPERSEDE',target_event_id:a.event_id,
      superseding_event_id:b.event_id,reason_code:'ADMIN_CORRECTION'}});
  const frozen=structuredClone([a,b,correction]);
  const projected=calc([a,b,correction]);
  assert.equal(projected.items[0].exposure_count,1);
  assert.equal(projected.items[0].source_event_ids.includes(a.event_id),false);
  assert.equal(projected.items[0].source_event_ids.includes(b.event_id),true);
  assert.deepEqual([a,b,correction],frozen);
  const voided=calc([a,event(2,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:a.event_id,reason_code:'ADMIN_CORRECTION'}
  })]);
  assert.equal(voided.items.length,0);
});

test('competing correction quarantines affected public question family',()=>{
  const target=event(1);
  const c1=event(2,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:target.event_id,reason_code:'ADMIN_CORRECTION'}
  });
  const c2=event(3,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:target.event_id,reason_code:'ADMIN_CORRECTION'}
  });
  const result=calc([target,c1,c2]);
  assert.equal(result.integrity_status,'COMPLETE','known public family conflict is scoped');
  assert.equal(result.items[0].data_quality_status,'CONFLICTED');
  assert.equal(result.items[0].due_at,null);
});

test('excluded strict assessment evidence cannot influence K4 schedule',()=>{
  const excluded=event(1,'learner.item.presented@1',{mode:'mock'});
  const result=calc([excluded]);
  assert.deepEqual(result.items,[]);
});

test('duplicate ID/sequence or mismatched principal/source/release fails closed',()=>{
  const a=event(1);
  for (const broken of [
    [a,event(1)],
    [a,event(2,'learner.item.presented@1',{event_id:a.event_id})],
    [event(1,'learner.item.presented@1',{learner_id:'other'})],
    [event(1,'learner.item.presented@1',{store_id:'foreign'})],
    [event(1,'learner.item.presented@1',{content_release_id:'other'})]
  ]) assert.throws(()=>calc(broken));
});

test('replay provenance is capped to five most recent distinct source event IDs',()=>{
  const records=Array.from({length:7},(_,i)=>event(i+1));
  const result=calc(records),entry=result.items[0];
  assert.equal(entry.exposure_count,7);
  assert.deepEqual(entry.source_event_ids,['event-3','event-4','event-5','event-6','event-7']);
  assert.equal(entry.source_event_ids_truncated,true);
});


test('scoped correction conflict quarantines only known family without poisoning source integrity',()=>{
  const target=event(1);
  const first=event(2,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:target.event_id,reason_code:'ADMIN_CORRECTION'}
  });
  const competing=event(3,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:target.event_id,reason_code:'ADMIN_CORRECTION'}
  });
  const result=calc([target,first,competing]);
  assert.equal(result.integrity_status,'COMPLETE','the source boundary remains valid when the known family is quarantined');
  assert.equal(result.items[0].data_quality_status,'CONFLICTED');
  assert.equal(result.items[0].due_at,null);
});


test('missing correction target leaves source invalid rather than allowing new actions',()=>{
  const correction=event(1,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:'unknown-target',reason_code:'ADMIN_CORRECTION'}
  });
  const result=calc([correction]);
  assert.equal(result.integrity_status,'INCOMPLETE');
  assert.deepEqual(result.items,[]);
});


test('excluded mock correction conflicts do not enter K4 public projection',()=>{
  const a=event(1,'learner.item.presented@1',{mode:'mock'});
  const b=event(2,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:a.event_id,reason_code:'ADMIN_CORRECTION'}});
  const c=event(3,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:a.event_id,reason_code:'ADMIN_CORRECTION'}});
  const result=calc([a,b,c]);
  assert.equal(result.integrity_status,'COMPLETE');
  assert.deepEqual(result.items,[]);
});
test('correction conflict targeting a forged item version remains globally unsafe',()=>{
  const a=event(1,'learner.item.presented@1',{item_version_id:'unpublished.v1'});
  const b=event(2,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:a.event_id,reason_code:'ADMIN_CORRECTION'}});
  const c=event(3,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',payload:{action:'VOID',target_event_id:a.event_id,reason_code:'ADMIN_CORRECTION'}});
  assert.notEqual(calc([a,b,c]).integrity_status,'COMPLETE');
});


test('excluded mock SUPERSEDE target suppresses missing replacement for K4 only',()=>{
  const target=event(1,'learner.item.presented@1',{mode:'mock'});
  const correction=event(2,'learner.evidence.correction.recorded@1',{
    authority_ref:'authority:test',
    payload:{action:'SUPERSEDE',target_event_id:target.event_id,
      superseding_event_id:'not-present',reason_code:'ADMIN_CORRECTION'}
  });
  const result=calc([target,correction]);
  assert.equal(result.integrity_status,'COMPLETE');
  assert.deepEqual(result.items,[]);
});
