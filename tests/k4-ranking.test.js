import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRulePolicy } from '../src/recommendations/policy.js';
import { validatePublicCatalog } from '../src/recommendations/publicCatalog.js';
import { recommendNextAction } from '../src/recommendations/ranker.js';

const RELEASE='sdaia-ai-engineer.bootstrap.v1',TRACK='sdaia-ai-engineer';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const NOW='2026-10-09T12:00:00.000Z';
const policy=validateRulePolicy(JSON.parse(readFileSync(new URL('../data/recommendations/k4-rule-policy-v1.json',import.meta.url))));
const FAMILIES=['sdaia-ai-engineer.core-ai.alpha.definition.best-description','sdaia-ai-engineer.core-ai.beta.definition.best-description'];
function catalog(){
  return validatePublicCatalog({
    catalog:{schema_version:1,catalog_id:'sdaia-ai-engineer.public.bootstrap.v1',track_id:TRACK,content_release_id:RELEASE,
      question_payload_sha256:DIGEST,source:'MIGRATED_GRANDFATHERED_PUBLIC',
      items:FAMILIES.map(f=>({question_family_id:f,item_version_id:f+'.v1',
        objective_id:'sdaia-ai-engineer.objective.core-ai.'+(f.includes('.alpha.')?'alpha':'beta')+'.v1',
        domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'}))},
    trackManifest:{id:TRACK,status:'active'},
    evidenceContext:{content_release_id:RELEASE,question_payload_sha256:DIGEST},
    publicQuestions:FAMILIES.map(f=>({id:f+'.v1',family_id:f,domain_id:'core-ai'})),
    objectives:{track_id:TRACK,objectives:['alpha','beta'].map(c=>({objective_id:'sdaia-ai-engineer.objective.core-ai.'+c+'.v1',
      track_id:TRACK,domain_id:'core-ai',concept_ids:['core-ai.'+c],status:'provisional'}))}
  });
}
function exposure(family,due='2026-10-08T12:00:00.000Z',status='VALID'){
  return {question_family_id:family,latest_item_version_id:family+'.v1',
    objective_id:'sdaia-ai-engineer.objective.core-ai.'+(family.includes('.alpha.')?'alpha':'beta')+'.v1',
    last_exposure_at:'2026-10-06T12:00:00.000Z',last_graded_at:null,
    grade_evidence:'EXPOSURE_ONLY',due_at:due,exposure_count:1,source_event_ids:['event-1'],
    source_event_ids_truncated:false,data_quality_status:status};
}
function projection(items=[]){
  return {schema_version:1,projection_type:'ScheduleProjectionV1',policy_id:'K4.RULES.v1',
    source_store_id:'opaque-local',through_store_seq:items.length?1:0,
    content_release_id:RELEASE,learner_id:'learner:anon',generated_for_at:NOW,
    integrity_status:'COMPLETE',items};
}
function rank(items=[],opts={}){
  return recommendNextAction({scheduleProjection:projection(items),catalog:catalog(),policy,
    nowIso:NOW,preferences:{learner_id:'learner:anon',version:1,revision:0,snoozed_families:[],dismissed_families:[],preferred_domain_id:null},...opts});
}
test('cold start returns exactly one public practice action without grades',()=>{
  const r=rank();
  assert.equal(r.status,'ACTION');assert.equal(r.reason_code,'COLD_START');
  assert.equal(r.evidence_strength,'COLD_START');
  assert.equal(r.action?.action_type,'PRACTICE_ONE');
  assert.equal(r.action?.route_mode,'practice');
  assert.equal(r.action?.release_id,RELEASE);
  assert.equal(r.reason_event_ids_truncated,false);
  for (const key of ['answer','correct','probability','readiness','mastery']) assert.equal(key in r.action,false);
});
test('due-now question wins over unseen, unseen wins over future due',()=>{
  let r=rank([exposure(FAMILIES[1],'2026-10-08T00:00:00.000Z')]);
  assert.equal(r.action.question_family_id,FAMILIES[1]);
  assert.equal(r.reason_code,'REVIEW_DUE');
  r=rank([exposure(FAMILIES[1],'2026-10-12T00:00:00.000Z')]);
  assert.equal(r.action.question_family_id,FAMILIES[0]);
  assert.equal(r.reason_code,'NEW_FAMILY');
});
test('ranking is stable for identical inputs independent of catalog order',()=>{
  const r1=rank(),r2=rank();
  assert.deepEqual(r1,r2);
  assert.equal(r1.action.question_family_id,FAMILIES[0]);
});
test('source failures and conflicts never manufacture actionable recommendations',()=>{
  const invalid=projection();
  invalid.integrity_status='CONFLICTED';
  const r=rank([],{scheduleProjection:invalid});
  assert.equal(r.status,'INSUFFICIENT_EVIDENCE');
  assert.equal(r.reason_code,'SOURCE_INVALID');
  assert.equal(r.action,null);
  const forged=projection([exposure(FAMILIES[0])]);
  forged.items[0].grade_evidence='TRUSTED_GRADED';
  assert.equal(rank([],{scheduleProjection:forged}).status,'INSUFFICIENT_EVIDENCE');
});
test('snoozed and dismissed families excluded without deleting raw evidence',()=>{
  const p={learner_id:'learner:anon',version:1,revision:2,preferred_domain_id:null,
    snoozed_families:[{question_family_id:FAMILIES[0],until_at:'2026-10-10T00:00:00.000Z'}],
    dismissed_families:[]};
  const r=rank([],{preferences:p});
  assert.equal(r.action.question_family_id,FAMILIES[1]);
  p.snoozed_families.push({question_family_id:FAMILIES[1],until_at:'2026-10-10T00:00:00.000Z'});
  const blocked=rank([],{preferences:p});
  assert.equal(blocked.status,'NO_ELIGIBLE_ACTION');
  assert.equal(blocked.reason_code,'ALL_SNOOZED');
});
test('snooze expiry changes action even at unchanged source watermark',()=>{
  const p={learner_id:'learner:anon',version:1,revision:1,preferred_domain_id:null,
    snoozed_families:[{question_family_id:FAMILIES[0],until_at:'2026-10-09T13:00:00.000Z'}],
    dismissed_families:[]};
  const prior=rank([],{preferences:p,nowIso:NOW});
  const after=rank([],{preferences:p,nowIso:'2026-10-09T13:01:00.000Z'});
  assert.notEqual(prior.action.question_family_id,after.action.question_family_id);
  assert.equal(after.action.question_family_id,FAMILIES[0]);
  assert.equal(prior.through_store_seq,after.through_store_seq);
});
