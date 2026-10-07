import test from 'node:test';
import assert from 'node:assert/strict';

async function loadApi(){
  try{return await import('../src/platform-kernel/interoperability/xapi.js');}
  catch(error){
    if(error?.code==='ERR_MODULE_NOT_FOUND'&&String(error?.message).includes('/src/platform-kernel/interoperability/xapi.js'))return {};
    throw error;
  }
}

const ids={
  event:'11111111-1111-4111-8111-111111111111',
  activity:'22222222-2222-4222-8222-222222222222',
  attempt:'33333333-3333-4333-8333-333333333333',
  interaction:'44444444-4444-4444-8444-444444444444',
  response:'55555555-5555-4555-8555-555555555555',
  eval:'66666666-6666-4666-8666-666666666666',
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
    occurred_at:'2026-10-07T10:00:00.000Z',
    assessment_attempt_id:ids.attempt,
    form_id:'form:fixture',
    payload:{},
    ...overrides
  };
}

function responseEvent(overrides={}){
  return base('learner.response.recorded@1',{
    item_interaction_id:ids.interaction,
    question_family_id:'sdaia-ai-engineer.core-ai.activation-function.definition.best-description',
    item_version_id:'sdaia-ai-engineer.core-ai.activation-function.definition.best-description.v1',
    objective_id:'sdaia-ai-engineer.objective.core-ai.activation-function.v1',
    domain_id:'core-ai',
    base_attempt_revision:0,
    proposed_attempt_revision:1,
    payload:{response_version:1,response_kind:'OPTION',response:{option_index:2}},
    ...overrides
  });
}

test('Task 32 exposes an xAPI adapter over the existing learning-event exchange methods',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter();
  assert.equal(typeof adapter.exportEvents,'function');
  assert.equal(typeof adapter.importEvents,'function');
  assert.equal('send' in adapter,false,'K3 must not implement an LRS client/store as part of this adapter');
});

test('Task 32 maps a canonical response with pseudonymous actor, registration, response, and source timestamp',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter();
  const out=adapter.exportEvents([responseEvent()]);
  assert.equal(out.mapping_version,'xapi-k3.v1');
  assert.equal(out.statements.length,1);
  assert.equal(out.omissions.length,0);
  assert.equal(out.rejections.length,0);
  const statement=out.statements[0];
  assert.equal(statement.id,ids.event);
  assert.equal(statement.verb.id,'http://adlnet.gov/expapi/verbs/answered');
  assert.equal(statement.timestamp,'2026-10-07T10:00:00.000Z');
  assert.equal(statement.context.registration,ids.attempt);
  assert.equal(statement.result.response,'2');
  assert.equal(statement.actor.objectType,'Agent');
  assert.equal(statement.actor.account.name,'learner:pseudonym-42');
  assert.ok(statement.actor.account.homePage);
  assert.equal('mbox' in statement.actor,false);
  assert.equal('name' in statement.actor,false);
  assert.equal('stored' in statement,false,'LRS receipt/storage time is not source occurrence time');
  assert.equal(out.mapped_ids[0].source_id,ids.event);
  assert.equal(out.mapped_ids[0].target_id,ids.event);
  assert.equal(out.provenance.source_standard,'xAPI');
  assert.equal(out.provenance.source_version,'2.0');
});

test('Task 32 preserves evaluation semantics without merging evaluation into the learner response',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter();
  const evaluated=base('learner.response.evaluated@1',{
    event_id:ids.eval,
    item_version_id:'sdaia-ai-engineer.core-ai.activation-function.definition.best-description.v1',
    authority_ref:'scorer:fixture',
    payload:{response_event_id:ids.response,scoring_policy_ref:'sdaia-ai-engineer.scoring.v1',evaluation_status:'GRADED',correct:true,score:1}
  });
  const out=adapter.exportEvents([evaluated]);
  assert.equal(out.statements.length,1);
  assert.equal(out.statements[0].verb.id,'http://adlnet.gov/expapi/verbs/passed');
  assert.equal(out.statements[0].result.success,true);
  assert.equal(out.statements[0].result.score.raw,1);
  assert.equal(out.statements[0].timestamp,evaluated.occurred_at);
});

test('Task 32 declares unsupported/lossy K3 semantics instead of inventing xAPI meaning',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter();
  const confidence=base('learner.confidence.recorded@1',{
    item_interaction_id:ids.interaction,
    item_version_id:'item.v1',
    payload:{confidence:'high'}
  });
  const invalidEvaluation=base('learner.response.evaluated@1',{
    event_id:ids.eval,item_version_id:'item.v1',authority_ref:'scorer:fixture',
    payload:{response_event_id:ids.response,scoring_policy_ref:'policy.v1',evaluation_status:'UNGRADABLE'}
  });
  const out=adapter.exportEvents([confidence,invalidEvaluation]);
  assert.equal(out.statements.length,0);
  assert.equal(out.omissions.length,2);
  assert.ok(out.omissions.every(row=>row.source_id&&row.reason_code));
});

test('Task 32 rejects direct PII-like learner identifiers at the actor boundary',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter();
  const out=adapter.exportEvents([responseEvent({learner_id:'alice@example.com'})]);
  assert.equal(out.statements.length,0);
  assert.equal(out.rejections.length,1);
  assert.match(out.rejections[0].reason_code,/PII|PSEUDONYM/i);
  const ip=adapter.exportEvents([responseEvent({learner_id:'192.168.1.20'})]);
  assert.equal(ip.statements.length,0);
  assert.equal(ip.rejections.length,1);
});

test('Task 32 import abstains when exact K3 canonical context is unavailable',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter();
  const statement={
    id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    actor:{objectType:'Agent',account:{homePage:'https://automizelab.net/learners',name:'learner:pseudonym-42'}},
    verb:{id:'http://adlnet.gov/expapi/verbs/answered'},
    object:{objectType:'Activity',id:'https://automizelab.net/k3/items/item.v1'},
    result:{response:'2'},
    context:{registration:ids.attempt},
    timestamp:'2026-10-07T10:05:00.000Z'
  };
  const out=adapter.importEvents([statement]);
  assert.equal(out.events.length,0);
  assert.equal(out.staged.length,1);
  assert.match(out.staged[0].reason_code,/CONTEXT|STAG/i);
  assert.equal(out.mapped_ids.length,0);
});

test('Task 32 canonical import uses explicit K3 context and marks importer sequence as processing order only',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter({
    crypto:{randomUUID:()=>ids.importedEvent}
  });
  const statement={
    id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    actor:{objectType:'Agent',account:{homePage:'https://automizelab.net/learners',name:'learner:pseudonym-42'}},
    verb:{id:'http://adlnet.gov/expapi/verbs/answered'},
    object:{objectType:'Activity',id:'https://automizelab.net/k3/items/item.v1'},
    result:{response:'2'},
    context:{registration:ids.attempt},
    timestamp:'2026-10-07T10:05:00.000Z'
  };
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
  const out=adapter.importEvents([statement],{
    contextByExternalId:{[statement.id]:context},
    importerOriginId:ids.importerOrigin,
    nextOriginSeq:()=>7
  });
  assert.equal(out.events.length,1);
  const event=out.events[0];
  assert.equal(event.definition_id,'learner.response.recorded@1');
  assert.equal(event.occurred_at,statement.timestamp);
  assert.equal(event.origin_id,ids.importerOrigin);
  assert.equal(event.origin_seq,7);
  assert.equal(event.payload.response.option_index,2);
  assert.equal(out.mapped_ids[0].source_id,statement.id);
  assert.equal(out.mapped_ids[0].target_id,ids.importedEvent);
  assert.equal(out.mapped_ids[0].source_occurred_at,statement.timestamp);
  assert.equal(out.mapped_ids[0].importer_order_only,true);
});


test('Task 32 strict xAPI import abstains when revision-chain context is unavailable',async()=>{
  const api=await loadApi();
  assert.equal(typeof api.createXapiAdapter,'function','Task 32 xAPI adapter behavior is missing');
  const adapter=api.createXapiAdapter({crypto:{randomUUID:()=>ids.importedEvent}});
  const statement={
    id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    actor:{objectType:'Agent',account:{homePage:'https://automizelab.net/learners',name:'learner:pseudonym-42'}},
    verb:{id:'http://adlnet.gov/expapi/verbs/answered'},
    object:{objectType:'Activity',id:'https://automizelab.net/k3/items/item.v1'},
    result:{response:'2'},
    context:{registration:ids.attempt},
    timestamp:'2026-10-07T10:06:00.000Z'
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
  const out=adapter.importEvents([statement],{
    contextByExternalId:{[statement.id]:incomplete},
    importerOriginId:ids.importerOrigin,
    nextOriginSeq:()=>8
  });
  assert.equal(out.events.length,0);
  assert.equal(out.staged.length,1);
  assert.match(out.staged[0].reason_code,/REVISION|CONTEXT/i);
});


test('Post-merge review: xAPI canonical import rejects item or registration that disagrees with explicit K3 context',async()=>{
  const api=await loadApi();
  const adapter=api.createXapiAdapter({crypto:{randomUUID:()=>ids.importedEvent}});
  const context={
    learner_id:'learner:pseudonym-42',activity_id:ids.activity,track_id:'sdaia-ai-engineer',
    content_release_id:'sdaia-ai-engineer.bootstrap.v1',mode:'mock',locale:'en',
    assessment_attempt_id:ids.attempt,form_id:'form:fixture',
    item_interaction_id:ids.interaction,item_version_id:'item.v1',
    base_attempt_revision:0,proposed_attempt_revision:1
  };
  const baseStatement={
    id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    actor:{objectType:'Agent',account:{homePage:'https://automizelab.net/k3/learners',name:'learner:pseudonym-42'}},
    verb:{id:'http://adlnet.gov/expapi/verbs/answered'},
    object:{objectType:'Activity',id:'https://automizelab.net/k3/items/item.v1'},
    result:{response:'1'},context:{registration:ids.attempt},timestamp:'2026-10-07T10:07:00.000Z'
  };
  for(const mutate of [
    s=>{s.object.id='https://automizelab.net/k3/items/other.v1';},
    s=>{s.context.registration='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';}
  ]){
    const statement=structuredClone(baseStatement); mutate(statement);
    const out=adapter.importEvents([statement],{
      contextByExternalId:{[statement.id]:context},
      importerOriginId:ids.importerOrigin,nextOriginSeq:()=>9
    });
    assert.equal(out.events.length,0,'mismatched external identity/context must not canonicalize');
    assert.ok(out.rejections.length+out.staged.length>=1);
  }
});
