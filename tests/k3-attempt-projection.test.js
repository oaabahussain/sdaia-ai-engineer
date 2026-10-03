import test from 'node:test';
import assert from 'node:assert/strict';

async function loadProjection(){try{return await import('../src/evidence/projections/attemptProjection.js')}catch{return {}}}
const ATTEMPT='a0000000-0000-4000-8000-000000000001';
function ev(id,definition,seq,overrides={}){return {schema_version:2,event_id:id,definition_id:definition,learner_id:'learner:p1',origin_id:'b0000000-0000-4000-8000-000000000001',origin_seq:seq,activity_id:'c0000000-0000-4000-8000-000000000001',assessment_attempt_id:ATTEMPT,track_id:'sdaia-ai-engineer',content_release_id:'release-1',mode:'assessment',locale:'en',occurred_at:`2026-10-03T10:00:0${Math.min(seq,9)}Z`,accepted_at:`2026-10-03T10:01:0${Math.min(seq,9)}Z`,store_id:'store-1',store_seq:seq,payload:{},...overrides}}
function response(id,seq,item,answer,base){return ev(id,'learner.response.recorded@1',seq,{item_interaction_id:`ix-${item}`,item_version_id:item,base_attempt_revision:base,payload:{response_version:1,response_kind:'OPTION',response:{option_index:answer},base_attempt_revision:base}})}
function resolved(id,seq,candidate,before,decision,after){return ev(id,'learner.assessment.mutation.resolved@1',seq,{authority_ref:'authority:test',payload:{candidate_event_id:candidate,assessment_attempt_id:ATTEMPT,base_attempt_revision:before,authoritative_revision_before:before,decision,reason_code:decision==='APPLIED'?'BASE_REVISION_MATCH':'BASE_REVISION_STALE',...(decision==='APPLIED'?{authoritative_revision_after:after}:{})}})}

test('AttemptProjectionV1 selects latest APPLIED response and preserves history/stale/evaluation refs',async()=>{
 const {projectAttempt}=await loadProjection();assert.equal(typeof projectAttempt,'function','projectAttempt behavior is missing');
 const a=response('10000000-0000-4000-8000-000000000001',1,'i1',0,0);
 const b=response('10000000-0000-4000-8000-000000000002',3,'i1',1,1);
 const c=response('10000000-0000-4000-8000-000000000003',5,'i1',2,1);
 const events=[a,resolved('20000000-0000-4000-8000-000000000001',2,a.event_id,0,'APPLIED',1),b,resolved('20000000-0000-4000-8000-000000000002',4,b.event_id,1,'APPLIED',2),c,resolved('20000000-0000-4000-8000-000000000003',6,c.event_id,1,'STALE'),ev('30000000-0000-4000-8000-000000000001','learner.response.evaluated@1',7,{item_version_id:'i1',authority_ref:'authority:test',payload:{response_event_id:b.event_id,scoring_policy_ref:'score-v1',evaluation_status:'GRADED',correct:true,score:1}}),ev('30000000-0000-4000-8000-000000000002','learner.response.evaluated@1',8,{item_version_id:'i1',authority_ref:'authority:test',payload:{response_event_id:b.event_id,scoring_policy_ref:'score-v2',evaluation_status:'GRADED',correct:true,score:1}}),ev('40000000-0000-4000-8000-000000000001','learner.assessment.submitted@1',9,{form_id:'f1',payload:{exam_profile_ref:'exam-v1',scoring_policy_ref:'score-v2'}})];
 const formSnapshot={form_id:'f1',content_release_id:'release-1',item_version_ids:['i1','i2']};
 const p=projectAttempt(events,{formSnapshot,throughStoreSeq:9,policyVersion:'attempt-v1'});
 assert.equal(p.authoritative_revision,2);
 assert.equal(p.current_responses.i1.response_event_id,b.event_id);
 assert.deepEqual(p.current_responses.i1.evaluation_event_ids,['30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002']);
 assert.deepEqual(p.response_history.map(x=>x.response_event_id),[a.event_id,b.event_id,c.event_id]);
 assert.equal(p.response_history.at(-1).decision,'STALE');
 assert.deepEqual(p.unanswered_item_version_ids,['i2']);
 assert.equal(p.submitted_event_id,'40000000-0000-4000-8000-000000000001');
});

test('VOID removes an applied response from current view without deleting history',async()=>{
 const {projectAttempt}=await loadProjection();assert.equal(typeof projectAttempt,'function','projectAttempt behavior is missing');
 const a=response('10000000-0000-4000-8000-000000000001',1,'i1',0,0);
 const corr=ev('50000000-0000-4000-8000-000000000001','learner.evidence.correction.recorded@1',3,{authority_ref:'authority:test',payload:{target_event_id:a.event_id,action:'VOID',reason_code:'ADMIN_CORRECTION'}});
 const p=projectAttempt([a,resolved('20000000-0000-4000-8000-000000000001',2,a.event_id,0,'APPLIED',1),corr],{formSnapshot:{form_id:'f1',content_release_id:'release-1',item_version_ids:['i1']},throughStoreSeq:3,policyVersion:'attempt-v1'});
 assert.deepEqual(p.current_responses,{});
 assert.equal(p.response_history.length,1);
 assert.equal(p.response_history[0].response_event_id,a.event_id);
});

test('SUPERSEDE replaces the applied response in current view while retaining original history reference',async()=>{
 const {projectAttempt}=await loadProjection();assert.equal(typeof projectAttempt,'function','projectAttempt behavior is missing');
 const a=response('10000000-0000-4000-8000-000000000001',1,'i1',0,0);
 const replacement=response('10000000-0000-4000-8000-000000000002',3,'i1',3,0);
 const corr=ev('50000000-0000-4000-8000-000000000001','learner.evidence.correction.recorded@1',4,{authority_ref:'authority:test',payload:{target_event_id:a.event_id,action:'SUPERSEDE',reason_code:'ADMIN_CORRECTION',superseding_event_id:replacement.event_id}});
 const p=projectAttempt([a,resolved('20000000-0000-4000-8000-000000000001',2,a.event_id,0,'APPLIED',1),replacement,corr],{formSnapshot:{form_id:'f1',content_release_id:'release-1',item_version_ids:['i1']},throughStoreSeq:4,policyVersion:'attempt-v1'});
 assert.equal(p.current_responses.i1.response_event_id,replacement.event_id);
 assert.equal(p.current_responses.i1.authoritative_revision,1);
 assert.deepEqual(p.response_history.map(x=>x.response_event_id),[a.event_id,replacement.event_id]);
});
