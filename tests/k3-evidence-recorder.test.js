import test from 'node:test';
import assert from 'node:assert/strict';

async function loadRecorderApi() {
  try {
    return await import('../src/evidence/recorder.js');
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND' && String(error?.message).includes('/src/evidence/recorder.js')) return {};
    throw error;
  }
}

const definitions = [
  'learner.activity.started',
  'learner.item.presented',
  'learner.response.recorded',
  'learner.confidence.recorded',
  'learner.hint.requested',
  'learner.explanation.opened',
  'learner.assessment.submitted',
  'learner.response.evaluated'
].map(event_name => ({event_name,event_version:1}));

function runtimeContext() {
  return {
    track:{id:'sdaia-ai-engineer',locales:['ar','en']},
    evidence:{content_release_id:'sdaia-ai-engineer.bootstrap.v1'},
    eventDefinitions:definitions
  };
}

function deterministicCrypto(values=[
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
]) {
  let index=0;
  return {randomUUID(){return values[index++] ?? '44444444-4444-4444-8444-444444444444';}};
}

function recordingStore(failure=null) {
  const calls=[];
  return {
    calls,
    async captureLocal(args) {
      if (failure) throw failure;
      calls.push(structuredClone(args));
      return {
        event:structuredClone(args.eventInput),
        receipt:{disposition:'ACCEPTED'}
      };
    }
  };
}

function assessmentSnapshot() {
  return {
    schema_version:1,
    form_id:'form:exam-1',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    exam_profile_id:'sdaia-ai-engineer.project-reference.v1',
    exam_profile_version:'1',
    scoring_policy_version:'sdaia-ai-engineer.scoring.v1',
    item_version_ids:['item-1.v1'],
    option_orders:{'item-1.v1':[2,0,1,3]},
    locale:'en',
    started_at:'2026-10-06T16:40:00.000Z'
  };
}

test('recorder emits ordered learner evidence with UUIDv4 runtime identities and frozen assessment context', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');

  const context=runtimeContext();
  const snapshot=assessmentSnapshot();
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:context,
    clock:()=>new Date('2026-10-06T16:41:00.000Z'),
    crypto:deterministicCrypto()
  });

  const started=await recorder.startActivity({
    learner_id:'learner:p1',
    mode:'mock',
    locale:'en',
    assessment_snapshot:snapshot,
    source:'browser'
  });
  const activityId=started.event.activity_id;
  const attemptId=started.event.assessment_attempt_id;
  assert.equal(activityId,'11111111-1111-4111-8111-111111111111');
  assert.equal(attemptId,'22222222-2222-4222-8222-222222222222');
  assert.equal(started.event.form_id,'form:exam-1');
  assert.equal(started.event.content_release_id,'sdaia-ai-engineer.bootstrap.v1');

  const presented=await recorder.presentItem({
    activity_id:activityId,
    question_family_id:'family-1',
    item_version_id:'item-1.v1',
    objective_id:'objective-1',
    domain_id:'domain-1'
  });
  const interactionId=presented.event.item_interaction_id;
  assert.equal(interactionId,'33333333-3333-4333-8333-333333333333');

  const response=await recorder.recordResponse({
    activity_id:activityId,
    item_interaction_id:interactionId,
    response:{
      response_version:1,
      response_kind:'OPTION',
      response:{option_index:2}
    },
    base_attempt_revision:0,
    proposed_attempt_revision:1
  });
  assert.deepEqual(response.event.payload,{
    response_version:1,
    response_kind:'OPTION',
    response:{option_index:2}
  });
  assert.equal('text' in response.event.payload.response,false);

  await recorder.recordConfidence({activity_id:activityId,item_interaction_id:interactionId,confidence:'high'});
  await recorder.requestHint({activity_id:activityId,item_interaction_id:interactionId,hint_ref:'hint:item-1'});
  await recorder.openExplanation({activity_id:activityId,item_interaction_id:interactionId,explanation_ref:'explanation:item-1'});

  snapshot.form_id='tampered-form';
  snapshot.exam_profile_id='tampered-profile';
  snapshot.scoring_policy_version='tampered-policy';
  context.evidence.content_release_id='tampered-release';

  const submitted=await recorder.submitAssessment({activity_id:activityId});
  assert.equal(submitted.event.form_id,'form:exam-1');
  assert.equal(submitted.event.content_release_id,'sdaia-ai-engineer.bootstrap.v1');
  assert.equal(submitted.event.assessment_attempt_id,attemptId);
  assert.deepEqual(submitted.event.payload,{
    exam_profile_ref:'sdaia-ai-engineer.project-reference.v1@1',
    scoring_policy_ref:'sdaia-ai-engineer.scoring.v1'
  });

  assert.deepEqual(store.calls.map(call=>call.eventInput.definition_id),[
    'learner.activity.started@1',
    'learner.item.presented@1',
    'learner.response.recorded@1',
    'learner.confidence.recorded@1',
    'learner.hint.requested@1',
    'learner.explanation.opened@1',
    'learner.assessment.submitted@1'
  ]);
  for (const call of store.calls) {
    assert.equal(call.outbox,null);
    assert.equal(call.eventInput.learner_id,'learner:p1');
    assert.equal(call.eventInput.track_id,'sdaia-ai-engineer');
    assert.equal(call.eventInput.locale,'en');
    assert.equal(call.eventInput.occurred_at,'2026-10-06T16:41:00.000Z');
  }
});

test('recorder captures learner evidence locally without network or sync transport', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T16:42:00Z',
    crypto:deterministicCrypto()
  });
  const result=await recorder.startActivity({learner_id:'learner:local',mode:'practice',locale:'ar'});
  assert.equal(result.receipt.disposition,'ACCEPTED');
  assert.equal(store.calls.length,1);
  assert.equal(store.calls[0].outbox,undefined);
});

test('local persistence failure surfaces and is never reported as successful evidence', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');
  const store=recordingStore(new Error('durable storage unavailable'));
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T16:43:00Z',
    crypto:deterministicCrypto()
  });
  await assert.rejects(
    ()=>recorder.startActivity({learner_id:'learner:p1',mode:'practice',locale:'en'}),
    /durable storage unavailable/
  );
  assert.equal(store.calls.length,0);
});

test('SYSTEM evaluation stays fail-closed even when browser input claims an authority_ref', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T16:44:00Z',
    crypto:deterministicCrypto()
  });
  await assert.rejects(
    ()=>recorder.recordEvaluation({
      learner_id:'learner:p1',
      activity_id:'11111111-1111-4111-8111-111111111111',
      item_version_id:'item-1.v1',
      authority_ref:'browser-claims-authority',
      response_event_id:'55555555-5555-4555-8555-555555555555',
      scoring_policy_ref:'sdaia-ai-engineer.scoring.v1',
      evaluation_status:'GRADED',
      correct:true,
      score:1
    }),
    /trusted SYSTEM producer|producer authority/i
  );
  assert.equal(store.calls.length,0,'untrusted SYSTEM evidence must never enter ordinary local capture');
});

test('recorder rejects non-UUIDv4 runtime identity generation before local capture', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T16:45:00Z',
    crypto:{randomUUID:()=> 'not-a-uuid'}
  });
  await assert.rejects(
    ()=>recorder.startActivity({learner_id:'learner:p1',mode:'practice',locale:'en'}),
    /UUIDv4/i
  );
  assert.equal(store.calls.length,0);
});


test('strict assessment response enforces optimistic revision preconditions before local capture', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T16:46:00Z',
    crypto:deterministicCrypto()
  });
  const started=await recorder.startActivity({
    learner_id:'learner:p1',
    mode:'mock',
    locale:'en',
    assessment_snapshot:assessmentSnapshot()
  });
  const presented=await recorder.presentItem({
    activity_id:started.event.activity_id,
    question_family_id:'family-1',
    item_version_id:'item-1.v1',
    objective_id:'objective-1',
    domain_id:'domain-1'
  });

  await assert.rejects(
    ()=>recorder.recordResponse({
      activity_id:started.event.activity_id,
      item_interaction_id:presented.event.item_interaction_id,
      response:{response_version:1,response_kind:'OPTION',response:{option_index:2}}
    }),
    /base_attempt_revision|proposed_attempt_revision|revision/i
  );

  await assert.rejects(
    ()=>recorder.recordResponse({
      activity_id:started.event.activity_id,
      item_interaction_id:presented.event.item_interaction_id,
      response:{response_version:1,response_kind:'OPTION',response:{option_index:2}},
      base_attempt_revision:3,
      proposed_attempt_revision:7
    }),
    /base_attempt_revision|proposed_attempt_revision|revision/i
  );

  assert.equal(store.calls.length,2,'only activity.started and item.presented may persist before a valid strict response');
});


test('resupplied identical assessment snapshot matches the frozen versioned profile context', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T16:47:00Z',
    crypto:deterministicCrypto()
  });
  const started=await recorder.startActivity({
    learner_id:'learner:p1',
    mode:'mock',
    locale:'en',
    assessment_snapshot:assessmentSnapshot()
  });
  const submitted=await recorder.submitAssessment({
    activity_id:started.event.activity_id,
    assessment_snapshot:assessmentSnapshot()
  });
  assert.equal(submitted.event.payload.exam_profile_ref,'sdaia-ai-engineer.project-reference.v1@1');

  const changed=assessmentSnapshot();
  changed.exam_profile_version='2';
  await assert.rejects(
    ()=>recorder.submitAssessment({
      activity_id:started.event.activity_id,
      assessment_snapshot:changed
    }),
    /exam_profile_ref|profile.*context/i
  );
});

test('strict assessment presentation rejects items outside the frozen form snapshot', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  assert.equal(typeof createEvidenceRecorder,'function','createEvidenceRecorder behavior is missing');
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T16:48:00Z',
    crypto:deterministicCrypto()
  });
  const started=await recorder.startActivity({
    learner_id:'learner:p1',
    mode:'section',
    locale:'en',
    assessment_snapshot:assessmentSnapshot()
  });
  await assert.rejects(
    ()=>recorder.presentItem({
      activity_id:started.event.activity_id,
      question_family_id:'family-outside',
      item_version_id:'item-outside.v1',
      objective_id:'objective-outside',
      domain_id:'domain-outside'
    }),
    /frozen.*form|assessment.*snapshot|item_version_id/i
  );
  assert.equal(store.calls.length,1,'out-of-form presentation must not enter durable local capture');
});


test('strict same-origin responses preserve the locally committed attempt revision chain', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T17:01:00Z',
    crypto:deterministicCrypto()
  });
  const started=await recorder.startActivity({
    learner_id:'learner:p1',
    mode:'mock',
    locale:'en',
    assessment_snapshot:assessmentSnapshot()
  });
  const presented=await recorder.presentItem({
    activity_id:started.event.activity_id,
    question_family_id:'family-1',
    item_version_id:'item-1.v1',
    objective_id:'objective-1',
    domain_id:'domain-1'
  });
  const base={
    activity_id:started.event.activity_id,
    item_interaction_id:presented.event.item_interaction_id,
    response:{response_version:1,response_kind:'OPTION',response:{option_index:2}}
  };
  await recorder.recordResponse({...base,base_attempt_revision:0,proposed_attempt_revision:1});
  await assert.rejects(
    ()=>recorder.recordResponse({...base,base_attempt_revision:0,proposed_attempt_revision:1}),
    /revision.*chain|current.*revision|base_attempt_revision/i
  );
  await recorder.recordResponse({...base,base_attempt_revision:1,proposed_attempt_revision:2});
  assert.equal(store.calls.filter(call=>call.eventInput.definition_id==='learner.response.recorded@1').length,2);
});

test('failed strict response persistence does not advance the local provisional revision', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  const calls=[];
  let failNextResponse=true;
  const store={
    async captureLocal(args){
      if(args.eventInput.definition_id==='learner.response.recorded@1'&&failNextResponse){
        failNextResponse=false;
        throw new Error('simulated durable response failure');
      }
      calls.push(structuredClone(args));
      return {event:structuredClone(args.eventInput),receipt:{disposition:'ACCEPTED'}};
    }
  };
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T17:02:00Z',
    crypto:deterministicCrypto()
  });
  const started=await recorder.startActivity({
    learner_id:'learner:p1',
    mode:'section',
    locale:'en',
    assessment_snapshot:assessmentSnapshot()
  });
  const presented=await recorder.presentItem({
    activity_id:started.event.activity_id,
    question_family_id:'family-1',
    item_version_id:'item-1.v1',
    objective_id:'objective-1',
    domain_id:'domain-1'
  });
  const input={
    activity_id:started.event.activity_id,
    item_interaction_id:presented.event.item_interaction_id,
    response:{response_version:1,response_kind:'OPTION',response:{option_index:2}},
    base_attempt_revision:0,
    proposed_attempt_revision:1
  };
  await assert.rejects(()=>recorder.recordResponse(input),/simulated durable response failure/);
  await recorder.recordResponse(input);
  assert.equal(calls.filter(call=>call.eventInput.definition_id==='learner.response.recorded@1').length,1);
});

test('strict activity rejects explicit form_id that disagrees with its frozen snapshot', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T17:03:00Z',
    crypto:deterministicCrypto()
  });
  await assert.rejects(
    ()=>recorder.startActivity({
      learner_id:'learner:p1',
      mode:'mock',
      locale:'en',
      form_id:'form:other',
      assessment_snapshot:assessmentSnapshot()
    }),
    /form_id|frozen.*form|snapshot/i
  );
  assert.equal(store.calls.length,0);
});

test('resumed strict interaction cannot bypass frozen-form membership through item_context', async()=>{
  const {createEvidenceRecorder}=await loadRecorderApi();
  const store=recordingStore();
  const recorder=createEvidenceRecorder({
    store,
    outbox:null,
    runtimeContext:runtimeContext(),
    clock:()=> '2026-10-06T17:04:00Z',
    crypto:deterministicCrypto()
  });
  await assert.rejects(
    ()=>recorder.recordResponse({
      activity_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      activity_context:{
        learner_id:'learner:p1',
        mode:'mock',
        locale:'en',
        assessment_attempt_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        form_id:'form:exam-1',
        assessment_snapshot:assessmentSnapshot(),
        attempt_revision:0
      },
      item_interaction_id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      item_context:{
        question_family_id:'family-outside',
        item_version_id:'item-outside.v1',
        objective_id:'objective-outside',
        domain_id:'domain-outside'
      },
      response:{response_version:1,response_kind:'OPTION',response:{option_index:2}},
      base_attempt_revision:0,
      proposed_attempt_revision:1
    }),
    /frozen.*form|assessment.*snapshot|item_version_id/i
  );
  assert.equal(store.calls.length,0);
});
