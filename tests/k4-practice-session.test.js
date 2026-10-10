import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeSession, presentPracticeItem, recordPracticeResponse } from '../src/recommendations/practiceSession.js';
const CANDIDATE={action_type:'PRACTICE_ONE',route_mode:'practice',track_id:'sdaia-ai-engineer',
  release_id:'sdaia-ai-engineer.bootstrap.v1',question_family_id:'sdaia-ai-engineer.core-ai.reasoning.definition.best-description',
  item_version_id:'sdaia-ai-engineer.core-ai.reasoning.definition.best-description.v1',
  objective_id:'sdaia-ai-engineer.objective.core-ai.reasoning.v1',domain_id:'core-ai'};
const objectiveCatalog={track_id:'sdaia-ai-engineer',objectives:[{objective_id:CANDIDATE.objective_id,
  domain_id:'core-ai',track_id:'sdaia-ai-engineer',concept_ids:['core-ai.reasoning']}]};
function input(recorder){return {recorder,learnerId:'learner:opaque',trackId:CANDIDATE.track_id,
  releaseId:CANDIDATE.release_id,locale:'ar',candidate:CANDIDATE,objectives:objectiveCatalog}}
function fakeRecorder({failOn}={}){
  const calls=[];let index=0;
  const invoke=(method,payload)=>{
    calls.push([method,structuredClone(payload)]);
    if(failOn===method)throw new Error('durable receipt unavailable');
    index+=1;
    const identity=method==='startActivity'?{activity_id:'123e4567-e89b-42d3-a456-426614174000'}:
      method==='presentItem'?{item_interaction_id:'223e4567-e89b-42d3-a456-426614174001'}:{event_id:'response-'+index};
    return {event:{...identity},receipt:{disposition:'ACCEPTED',store_seq:index}};
  };
  return {
    calls,
    startActivity:async p=>invoke('startActivity',p),
    presentItem:async p=>invoke('presentItem',p),
    recordResponse:async p=>invoke('recordResponse',p),
    submitAssessment:async()=>{throw Error('strict submission forbidden')},
    recordEvaluation:async()=>{throw Error('trusted evaluation forbidden')}
  };
}
test('practice session starts and presents one K3 non-strict public item once',async()=>{
  const recorder=fakeRecorder(), session=createPracticeSession(input(recorder));
  const one=await presentPracticeItem({recorder,session});
  const repeat=await presentPracticeItem({recorder,session});
  assert.equal(one.receipt.disposition,'ACCEPTED');
  assert.equal(repeat.receipt.disposition,'ACCEPTED');
  assert.deepEqual(recorder.calls.map(c=>c[0]),['startActivity','presentItem']);
  assert.equal(recorder.calls[0][1].mode,'practice');
  assert.equal(recorder.calls[0][1].learner_id,'learner:opaque');
  assert.equal(recorder.calls[1][1].item_version_id,CANDIDATE.item_version_id);
  assert.equal(recorder.calls[1][1].objective_id,CANDIDATE.objective_id);
  assert.equal(session.mode,'practice');
  assert.equal(session.assessment_snapshot,undefined);
});
test('one ordinary K3 response persists once, never a grade or strict assessment',async()=>{
  const recorder=fakeRecorder(),session=createPracticeSession(input(recorder));
  await presentPracticeItem({recorder,session});
  const answer=await recordPracticeResponse({recorder,session,optionIndex:2});
  const repeated=await recordPracticeResponse({recorder,session,optionIndex:2});
  assert.deepEqual(answer,repeated);
  assert.deepEqual(recorder.calls.map(c=>c[0]),['startActivity','presentItem','recordResponse']);
  assert.deepEqual(recorder.calls[2][1].response,{response_version:1,response_kind:'OPTION',response:{option_index:2}});
  for(const key of ['base_attempt_revision','proposed_attempt_revision','scoring_policy_ref','correct','score'])
    assert.equal(key in recorder.calls[2][1],false);
});
test('write error does not mark activity or presented item recorded',async()=>{
  const recorder=fakeRecorder({failOn:'presentItem'}),session=createPracticeSession(input(recorder));
  await assert.rejects(()=>presentPracticeItem({recorder,session}),/durable/);
  assert.equal(session.presentation_receipt,null);
  await assert.rejects(()=>recordPracticeResponse({recorder,session,optionIndex:1}),/presented/i);
});
test('invalid, protected-looking or mislinked candidates fail before capture',()=>{
  const recorder=fakeRecorder();
  assert.throws(()=>createPracticeSession({...input(recorder),candidate:{...CANDIDATE,route_mode:'mock'}}));
  assert.throws(()=>createPracticeSession({...input(recorder),candidate:{...CANDIDATE,item_version_id:'private'}}));
  assert.throws(()=>createPracticeSession({...input(recorder),candidate:{...CANDIDATE,objective_id:'different'}}));
  assert.equal(recorder.calls.length,0);
});
test('invalid canonical response and response-before-present cannot generate events',async()=>{
  const recorder=fakeRecorder(),session=createPracticeSession(input(recorder));
  await assert.rejects(()=>recordPracticeResponse({recorder,session,optionIndex:1}),/presented/i);
  await presentPracticeItem({recorder,session});
  await assert.rejects(()=>recordPracticeResponse({recorder,session,optionIndex:-1}));
  await assert.rejects(()=>recordPracticeResponse({recorder,session,optionIndex:1.5}));
  assert.equal(recorder.calls.length,2);
});
