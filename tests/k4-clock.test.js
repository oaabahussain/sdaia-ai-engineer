import test from 'node:test';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import { assertInstant, computeDueAt } from '../src/recommendations/clock.js';
import { validateRulePolicy } from '../src/recommendations/policy.js';
import { validatePublicCatalog } from '../src/recommendations/publicCatalog.js';
import { computeScheduleProjection } from '../src/recommendations/projection.js';

const policy=validateRulePolicy({
  schema_version:1,policy_id:'K4.RULES.v1',algorithm:'DETERMINISTIC_RULES',
  first_review_delay_hours:48,trusted_incorrect_delay_hours:24,trusted_correct_delay_hours:96,
  max_review_delay_hours:720,max_action_items:1,
  include_modes:['learn','practice'],exclude_modes:['check','mock','section','full'],
  allow_provisional_objectives_for_labels:true,
  allow_provisional_objectives_for_prerequisites:false,
  fsrs_enabled:false,protected_candidates_allowed:false,untrusted_correctness_allowed:false,
  unavailable_content_behavior:'SAFE_FALLBACK'
});
const NOW='2026-10-08T12:00:00.000Z';
const first='2026-10-08T00:00:00.000Z';
const base={lastExposureAt:first,lastTrustedGradeAt:null,gradeEvidence:'EXPOSURE_ONLY',correct:null,nowIso:NOW,policy};
test('exact first-exposure due time is +48 UTC hours',()=>{
  assert.equal(computeDueAt(base),'2026-10-10T00:00:00.000Z');
  assert.equal(assertInstant(first),Date.UTC(2026,9,8));
});
test('verified-grade fixture due is +24 hours wrong or +96 hours correct',()=>{
  const graded={...base,lastTrustedGradeAt:first,gradeEvidence:'TRUSTED_GRADED'};
  assert.equal(computeDueAt({...graded,correct:false}),'2026-10-09T00:00:00.000Z');
  assert.equal(computeDueAt({...graded,correct:true}),'2026-10-12T00:00:00.000Z');
  assert.equal(computeDueAt({...graded,correct:null}),null);
  assert.equal(computeDueAt({...graded,lastTrustedGradeAt:null,correct:true}),null);
});
test('no assessment or untrusted input cannot fabricate due or grading',()=>{
  assert.equal(computeDueAt({...base,gradeEvidence:'NONE'}),null);
  assert.equal(computeDueAt({...base,lastExposureAt:null}),null);
  assert.equal(computeDueAt({...base,lastExposureAt:'2026-10-09T00:00:00.000Z'}),null);
  assert.throws(()=>computeDueAt({...base,nowIso:'bad'}));
});
test('strict instant rejects calendar-only, invalid dates and timezone-free values',()=>{
  for(const bad of ['2026-10-08','2026-10-08T00:00:00','2026-02-30T00:00:00Z',
    '2026-10-08T25:00:00Z','garbage',null])
    assert.throws(()=>assertInstant(bad),String(bad));
});
test('offset and display timezone do not drift the absolute due instant',()=>{
  const iso=computeDueAt({...base,lastExposureAt:'2026-10-08T03:00:00+03:00'});
  assert.equal(iso,'2026-10-10T00:00:00.000Z');
  assert.equal(iso,computeDueAt(base));
});

test('exposure schedule projection is wired to UTC due calculation',()=>{
  const family='sdaia-ai-engineer.core-ai.reasoning.definition.best-description';
  const version=family+'.v1',objective='sdaia-ai-engineer.objective.core-ai.reasoning.v1';
  const catalog=validatePublicCatalog({
    catalog:{schema_version:1,catalog_id:'sdaia-ai-engineer.public.bootstrap.v1',
      track_id:'sdaia-ai-engineer',content_release_id:'sdaia-ai-engineer.bootstrap.v1',
      question_payload_sha256:'5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9',
      source:'MIGRATED_GRANDFATHERED_PUBLIC',
      items:[{question_family_id:family,item_version_id:version,objective_id:objective,
        domain_id:'core-ai',visibility:'PUBLIC',lifecycle:'ACTIVE'}]},
    trackManifest:{id:'sdaia-ai-engineer',status:'active'},
    evidenceContext:{content_release_id:'sdaia-ai-engineer.bootstrap.v1',
      question_payload_sha256:'5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9'},
    publicQuestions:[{id:version,family_id:family,domain_id:'core-ai'}],
    objectives:{track_id:'sdaia-ai-engineer',objectives:[{objective_id:objective,
      track_id:'sdaia-ai-engineer',domain_id:'core-ai',
      concept_ids:['core-ai.reasoning'],status:'provisional'}]}
  });
  const events=[{event_id:'one',store_seq:1,store_id:'local',
    learner_id:'learner:opaque',track_id:'sdaia-ai-engineer',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    definition_id:'learner.item.presented@1',mode:'practice',
    item_interaction_id:'interaction1',question_family_id:family,
    item_version_id:version,objective_id:objective,domain_id:'core-ai',
    accepted_at:first,occurred_at:first}];
  const props={learnerId:'learner:opaque',sourceStoreId:'local',throughStoreSeq:1,
    events,activeReleaseId:'sdaia-ai-engineer.bootstrap.v1',policy,nowIso:NOW,
    acceptedContentCatalog:catalog};
  const result=computeScheduleProjection(props);
  assert.equal(result.items[0].due_at,'2026-10-10T00:00:00.000Z');
  assert.equal(result.items[0].grade_evidence,'EXPOSURE_ONLY');
  const changed=computeScheduleProjection({...props,nowIso:'2026-10-07T00:00:00.000Z'});
  assert.equal(changed.items[0].due_at,null);
  assert.equal(changed.items[0].data_quality_status,'INCOMPLETE');
});


test('AC-11 real Node timezone settings do not drift absolute DST due instant',()=>{
  const lastExposureAt='2026-03-08T01:30:00-05:00';
  const nowIso='2026-03-08T08:00:00Z';
  const expected='2026-03-10T06:30:00.000Z';
  const childSource=`
    import {computeDueAt} from './src/recommendations/clock.js';
    const value=computeDueAt({
      gradeEvidence:'EXPOSURE_ONLY',
      lastExposureAt:${JSON.stringify(lastExposureAt)},
      nowIso:${JSON.stringify(nowIso)},
      policy:${JSON.stringify(policy)}
    });
    process.stdout.write(String(value));
  `;
  for(const tz of ['UTC','Asia/Riyadh','America/New_York','Pacific/Honolulu']){
    const proc=spawnSync(process.execPath,['--input-type=module','-e',childSource],{
      cwd:process.cwd(),env:{...process.env,TZ:tz},encoding:'utf8',timeout:10000
    });
    assert.equal(proc.status,0,`${tz}: ${proc.stderr}`);
    assert.equal(proc.stdout,expected,`K4 due time drifted with TZ=${tz}`);
  }
});
