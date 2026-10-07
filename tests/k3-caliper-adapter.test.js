import test from 'node:test';
import assert from 'node:assert/strict';

async function loadApi(){
  try{return await import('../src/platform-kernel/interoperability/caliper.js');}
  catch(error){
    if(error?.code==='ERR_MODULE_NOT_FOUND'&&String(error?.message).includes('/src/platform-kernel/interoperability/caliper.js'))return {};
    throw error;
  }
}

const ids={
  event:'11111111-1111-4111-8111-111111111111',
  activity:'22222222-2222-4222-8222-222222222222',
  attempt:'33333333-3333-4333-8333-333333333333',
  interaction:'44444444-4444-4444-8444-444444444444',
  importerOrigin:'77777777-7777-4777-8777-777777777777',
  importedEvent:'88888888-8888-4888-8888-888888888888'
};

function base(definition_id,overrides={}){
  return {
    schema_version:2,
    event_id:ids.event,
    definition_id,
    learner_id:'learner:pseudonym-42',
    origin_id:'99999999-9999-4999-8999-999999999999',
    origin_seq:4,
    activity_id:ids.activity,
    track_id:'sdaia-ai-engineer',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    mode:'mock',
    locale:'en',
    occurred_at:'2026-10-07T10:20:00.000Z',
    assessment_attempt_id:ids.attempt,
    form_id:'form:fixture',
    payload:{},
    ...overrides
  };
}

function item(definition_id,overrides={}){
  return base(definition_id,{
    item_interaction_id:ids.interaction,
    question_family_id:'family-1',
    item_version_id:'item.v1',
    objective_id:'objective-1',
    domain_id:'core-ai',
    ...overrides
  });
}

test('Task 33 exposes a Caliper 1.2 adapter over LearningEventExchangePort',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter();
  assert.equal(typeof adapter.exportEvents,'function');
  assert.equal(typeof adapter.importEvents,'function');
});

test('Task 33 preserves assessment Started and Submitted with an Attempt entity',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter();
  const started=base('learner.activity.started@1');
  const submitted=base('learner.assessment.submitted@1',{
    event_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    payload:{exam_profile_ref:'profile@1',scoring_policy_ref:'policy.v1'}
  });
  const out=adapter.exportEvents([started,submitted]);
  assert.equal(out.mapping_version,'caliper-k3.v1');
  assert.equal(out.events.length,2);
  assert.equal(out.events[0].type,'AssessmentEvent');
  assert.equal(out.events[0].action,'Started');
  assert.equal(out.events[0].generated.type,'Attempt');
  assert.equal(out.events[1].type,'AssessmentEvent');
  assert.equal(out.events[1].action,'Submitted');
  assert.equal(out.events[1].generated.type,'Attempt');
  assert.equal(out.events[0].eventTime,started.occurred_at);
  assert.equal(out.provenance.source_standard,'Caliper');
  assert.equal(out.provenance.source_version,'1.2');
});

test('Task 33 maps item Started without confusing it with a completed response',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter();
  const presented=item('learner.item.presented@1');
  const out=adapter.exportEvents([presented]);
  assert.equal(out.events.length,1);
  const event=out.events[0];
  assert.equal(event.type,'AssessmentItemEvent');
  assert.equal(event.action,'Started');
  assert.equal(event.object.type,'AssessmentItem');
  assert.equal(event.generated.type,'Attempt');
});

test('Task 33 never converts a skipped item into an Attempt',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter();
  const skipped=item('learner.item.skipped@1',{payload:{reason_code:'learner-skip'}});
  const out=adapter.exportEvents([skipped]);
  assert.equal(out.events.length,1);
  const event=out.events[0];
  assert.equal(event.type,'AssessmentItemEvent');
  assert.equal(event.action,'Skipped');
  assert.equal('generated' in event,false,'Skipped must not silently create an Attempt/Response');
});

test('Task 33 represents a recorded response as Response, not as an Attempt',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter();
  const response=item('learner.response.recorded@1',{
    base_attempt_revision:0,
    proposed_attempt_revision:1,
    payload:{response_version:1,response_kind:'OPTION',response:{option_index:3}}
  });
  const out=adapter.exportEvents([response]);
  assert.equal(out.events.length,1);
  const event=out.events[0];
  assert.equal(event.type,'AssessmentItemEvent');
  assert.equal(event.action,'Completed');
  assert.equal(event.generated.type,'Response');
  assert.equal(event.generated.value,'3');
  assert.equal(event.target.type,'Attempt');
  assert.equal(event.eventTime,response.occurred_at);
});

test('Task 33 reports unsupported semantics instead of collapsing them into generic Caliper actions',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter();
  const confidence=item('learner.confidence.recorded@1',{payload:{confidence:'high'}});
  const out=adapter.exportEvents([confidence]);
  assert.equal(out.events.length,0);
  assert.equal(out.omissions.length,1);
  assert.ok(out.omissions[0].source_id);
  assert.ok(out.omissions[0].reason_code);
});

test('Task 33 uses pseudonymous actor identity and rejects direct PII-like learner IDs',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter();
  const ok=adapter.exportEvents([base('learner.activity.started@1')]);
  assert.equal(ok.events[0].actor.type,'Person');
  assert.match(ok.events[0].actor.id,/learner%3Apseudonym-42|learner:pseudonym-42/);
  assert.equal('email' in ok.events[0].actor,false);
  const bad=adapter.exportEvents([base('learner.activity.started@1',{learner_id:'alice@example.com'})]);
  assert.equal(bad.events.length,0);
  assert.equal(bad.rejections.length,1);
  assert.match(bad.rejections[0].reason_code,/PII|PSEUDONYM/i);
  const ip=adapter.exportEvents([base('learner.activity.started@1',{learner_id:'192.168.1.20'})]);
  assert.equal(ip.events.length,0);
  assert.equal(ip.rejections.length,1);
});

test('Task 33 import stages when exact K3 context is absent and maps only with explicit context',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter({crypto:{randomUUID:()=>ids.importedEvent}});
  const external={
    '@context':'http://purl.imsglobal.org/ctx/caliper/v1p2',
    id:'urn:uuid:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    type:'AssessmentItemEvent',
    actor:{id:'https://automizelab.net/k3/learners/learner%3Apseudonym-42',type:'Person'},
    action:'Completed',
    object:{id:'https://automizelab.net/k3/items/item.v1',type:'AssessmentItem'},
    target:{id:'https://automizelab.net/k3/attempts/'+ids.attempt,type:'Attempt'},
    generated:{id:'urn:uuid:bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',type:'Response',value:'3'},
    eventTime:'2026-10-07T10:25:00.000Z'
  };
  const staged=adapter.importEvents([external]);
  assert.equal(staged.events.length,0);
  assert.equal(staged.staged.length,1);

  const context={
    learner_id:'learner:pseudonym-42',
    activity_id:ids.activity,
    track_id:'sdaia-ai-engineer',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    mode:'mock',
    locale:'en',
    assessment_attempt_id:ids.attempt,
    form_id:'form:fixture',
    item_interaction_id:ids.interaction,
    question_family_id:'family-1',
    item_version_id:'item.v1',
    objective_id:'objective-1',
    domain_id:'core-ai',
    base_attempt_revision:0,
    proposed_attempt_revision:1
  };
  const mapped=adapter.importEvents([external],{
    contextByExternalId:{[external.id]:context},
    importerOriginId:ids.importerOrigin,
    nextOriginSeq:()=>11
  });
  assert.equal(mapped.events.length,1);
  assert.equal(mapped.events[0].definition_id,'learner.response.recorded@1');
  assert.equal(mapped.events[0].occurred_at,external.eventTime);
  assert.equal(mapped.events[0].origin_seq,11);
  assert.equal(mapped.events[0].payload.response.option_index,3);
  assert.equal(mapped.mapped_ids[0].source_id,external.id);
  assert.equal(mapped.mapped_ids[0].source_occurred_at,external.eventTime);
  assert.equal(mapped.mapped_ids[0].importer_order_only,true);
});


test('Task 33 strict Caliper import abstains when revision-chain context is unavailable',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createCaliperAdapter,'function','Task 33 Caliper adapter behavior is missing');
  const adapter=api.createCaliperAdapter({crypto:{randomUUID:()=>ids.importedEvent}});
  const external={
    '@context':'http://purl.imsglobal.org/ctx/caliper/v1p2',
    id:'urn:uuid:cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    type:'AssessmentItemEvent',
    actor:{id:'https://automizelab.net/k3/learners/learner%3Apseudonym-42',type:'Person'},
    action:'Completed',
    object:{id:'https://automizelab.net/k3/items/item.v1',type:'AssessmentItem'},
    target:{id:'https://automizelab.net/k3/attempts/'+ids.attempt,type:'Attempt'},
    generated:{id:'urn:uuid:dddddddd-dddd-4ddd-8ddd-dddddddddddd',type:'Response',value:'3'},
    eventTime:'2026-10-07T10:26:00.000Z'
  };
  const incomplete={
    learner_id:'learner:pseudonym-42',
    activity_id:ids.activity,
    track_id:'sdaia-ai-engineer',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',
    mode:'mock',
    locale:'en',
    assessment_attempt_id:ids.attempt,
    form_id:'form:fixture',
    item_interaction_id:ids.interaction,
    item_version_id:'item.v1'
  };
  const out=adapter.importEvents([external],{
    contextByExternalId:{[external.id]:incomplete},
    importerOriginId:ids.importerOrigin,
    nextOriginSeq:()=>12
  });
  assert.equal(out.events.length,0);
  assert.equal(out.staged.length,1);
  assert.match(out.staged[0].reason_code,/REVISION|CONTEXT/i);
});


test('Task 33 abstains from Caliper Assessment semantics for non-assessment K3 modes',async()=>{
  const api=await loadApi();
  const adapter=api.createCaliperAdapter();
  const learning=base('learner.activity.started@1',{
    mode:'learn',
    assessment_attempt_id:undefined,
    form_id:undefined
  });
  const practiceItem=item('learner.item.presented@1',{
    mode:'practice',
    assessment_attempt_id:undefined,
    form_id:undefined
  });
  const out=adapter.exportEvents([learning,practiceItem]);
  assert.equal(out.events.length,0);
  assert.equal(out.omissions.length,2);
  assert.ok(out.omissions.every(row=>/NOT_ASSESSMENT|UNSUPPORTED/.test(row.reason_code)));
});


test('Post-merge review: Caliper canonical import rejects item or Attempt identity that disagrees with explicit K3 context',async()=>{
  const api=await loadApi();
  const adapter=api.createCaliperAdapter({crypto:{randomUUID:()=>ids.importedEvent}});
  const context={
    learner_id:'learner:pseudonym-42',activity_id:ids.activity,track_id:'sdaia-ai-engineer',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',mode:'mock',locale:'en',
    assessment_attempt_id:ids.attempt,form_id:'form:fixture',
    item_interaction_id:ids.interaction,item_version_id:'item.v1',
    base_attempt_revision:0,proposed_attempt_revision:1
  };
  const baseExternal={
    '@context':'http://purl.imsglobal.org/ctx/caliper/v1p2',
    id:'urn:uuid:eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    type:'AssessmentItemEvent',
    actor:{id:'https://automizelab.net/k3/learners/learner%3Apseudonym-42',type:'Person'},
    action:'Completed',
    object:{id:'https://automizelab.net/k3/items/item.v1',type:'AssessmentItem'},
    target:{id:'https://automizelab.net/k3/attempts/'+ids.attempt,type:'Attempt'},
    generated:{id:'urn:uuid:ffffffff-ffff-4fff-8fff-ffffffffffff',type:'Response',value:'1'},
    eventTime:'2026-10-07T10:27:00.000Z'
  };
  for(const mutate of [
    e=>{e.object.id='https://automizelab.net/k3/items/other.v1';},
    e=>{e.target.id='https://automizelab.net/k3/attempts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';}
  ]){
    const external=structuredClone(baseExternal); mutate(external);
    const out=adapter.importEvents([external],{
      contextByExternalId:{[external.id]:context},
      importerOriginId:ids.importerOrigin,nextOriginSeq:()=>13
    });
    assert.equal(out.events.length,0,'mismatched external identity/context must not canonicalize');
    assert.ok(out.rejections.length+out.staged.length>=1);
  }
});
