import test from 'node:test';
import assert from 'node:assert/strict';
import {
  registerEventDefinition,
  isValidatedEvent
} from '../src/platform-kernel/observability/eventRegistry.js';
import { createGuardedAnalyticsSink } from '../src/platform-kernel/observability/ports.js';

async function loadBridge(){
  try{return await import('../src/platform-kernel/observability/learnerEvidenceBridge.js');}
  catch(error){
    if(error?.code==='ERR_MODULE_NOT_FOUND'&&String(error?.message).includes('/learnerEvidenceBridge.js'))return {};
    throw error;
  }
}

const analyticsDefinition={
  schema_version:1,
  event_name:'product.k3.evidence.sanitized',
  event_version:1,
  purpose:'Measure sanitized K3 product interaction signals without using learner evidence as analytics truth',
  owner:'learning-platform',
  trigger_semantics:'Emit only after governed learner-evidence export policy and explicit bridge mapping',
  properties:{
    analytics_event_id:{type:'string',required:true,privacy_class:'ANONYMOUS',export:'ALLOW'},
    track_id:{type:'string',required:true,privacy_class:'ANONYMOUS',export:'ALLOW'},
    evidence_kind:{type:'string',required:true,privacy_class:'ANONYMOUS',export:'ALLOW'},
    response_kind:{type:'string',required:false,privacy_class:'PSEUDONYMOUS',export:'ALLOW'},
    learner_note:{type:'string',required:false,privacy_class:'SENSITIVE',export:'REDACT'}
  },
  privacy_class:'PSEUDONYMOUS',
  retention_class:'SHORT',
  producer:'platform-kernel',
  compatibility:{strategy:'NEW_EVENT',previous_versions:[]},
  created_at:'2026-10-07T00:00:00Z'
};
const analyticsDefinitionId=registerEventDefinition(analyticsDefinition);

const learnerDefinition={
  schema_version:2,
  event_name:'learner.response.recorded',
  event_version:1,
  plane:'LEARNER_EVIDENCE',
  properties:{
    response_kind:{type:'string',required:true,privacy_class:'PSEUDONYMOUS',export:'ALLOW'},
    learner_note:{type:'string',required:false,privacy_class:'SENSITIVE',export:'REDACT'},
    raw_secret:{type:'string',required:false,privacy_class:'SENSITIVE',export:'REJECT'}
  }
};

function evidence(payload={}){
  return {
    schema_version:2,
    event_id:'11111111-1111-4111-8111-111111111111',
    definition_id:'learner.response.recorded@1',
    learner_id:'learner:pseudonym-42',
    origin_id:'22222222-2222-4222-8222-222222222222',
    origin_seq:1,
    activity_id:'33333333-3333-4333-8333-333333333333',
    track_id:'sdaia-ai-engineer',
    content_release_id:'release.v1',
    mode:'practice',
    locale:'en',
    occurred_at:'2026-10-07T12:00:00.000Z',
    payload:{response_kind:'OPTION',...payload}
  };
}

const mapping={
  mapping_version:'k3-product-analytics.v1',
  analytics_definition_id:analyticsDefinitionId,
  properties:{
    track_id:{from:'envelope.track_id'},
    evidence_kind:{constant:'learner.response.recorded'},
    response_kind:{from:'payload.response_kind'},
    learner_note:{from:'payload.learner_note'}
  }
};

test('Task 34 exposes a pure learner-evidence to Product Analytics bridge',async()=>{
  const api=await loadBridge();
  assert.equal(typeof api.toAnalyticsEvent,'function','Task 34 analytics bridge behavior is missing');
});

test('Task 34 returns a registry-validated analytics event with a separate identity',async()=>{
  const {toAnalyticsEvent}=await loadBridge();
  assert.equal(typeof toAnalyticsEvent,'function','Task 34 analytics bridge behavior is missing');
  const ids=['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'];
  const out=toAnalyticsEvent(evidence(),learnerDefinition,mapping,{crypto:{randomUUID:()=>ids.shift()}});
  assert.equal(isValidatedEvent(out),true);
  assert.equal(out.definition_id,analyticsDefinitionId);
  assert.equal(out.occurred_at,'2026-10-07T12:00:00.000Z');
  assert.equal(out.properties.track_id,'sdaia-ai-engineer');
  assert.equal(out.properties.response_kind,'OPTION');
  assert.equal(out.properties.analytics_event_id,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  assert.notEqual(out.properties.analytics_event_id,evidence().event_id);
  assert.equal('learner_id' in out.properties,false);
  assert.equal('origin_id' in out.properties,false);
  assert.equal('event_id' in out.properties,false);
  assert.equal('payload' in out,false);
});

test('Task 34 redacts learner fields before analytics mapping and never forwards raw payload',async()=>{
  const {toAnalyticsEvent}=await loadBridge();
  const out=toAnalyticsEvent(
    evidence({learner_note:'private free text'}),
    learnerDefinition,
    mapping,
    {crypto:{randomUUID:()=> 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'}}
  );
  assert.equal(isValidatedEvent(out),true);
  assert.equal('learner_note' in out.properties,false);
  assert.equal(JSON.stringify(out).includes('private free text'),false);
});

test('Task 34 rejects analytics export when learner definition marks any present payload field REJECT',async()=>{
  const {toAnalyticsEvent}=await loadBridge();
  const out=toAnalyticsEvent(
    evidence({raw_secret:'must never leave learner plane'}),
    learnerDefinition,
    mapping,
    {crypto:{randomUUID:()=> 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'}}
  );
  assert.equal(out,null);
});

test('Task 34 maps only explicitly declared fields and rejects unknown mapping sources',async()=>{
  const {toAnalyticsEvent}=await loadBridge();
  const bad=structuredClone(mapping);
  bad.properties.response_kind={from:'payload.not_governed'};
  assert.throws(
    ()=>toAnalyticsEvent(evidence(),learnerDefinition,bad,{crypto:{randomUUID:()=> 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'}}),
    /mapping|govern|source|not_governed/i
  );
});

test('Task 34 output can cross guarded AnalyticsSink while raw learner evidence cannot',async()=>{
  const {toAnalyticsEvent}=await loadBridge();
  const published=[];
  const sink=createGuardedAnalyticsSink({async publish(value){published.push(value);return {accepted:true};}});
  const raw=evidence();
  await assert.rejects(()=>sink.publish(raw),/validated|registry/i);
  const analytics=toAnalyticsEvent(raw,learnerDefinition,mapping,{crypto:{randomUUID:()=> 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'}});
  assert.deepEqual(await sink.publish(analytics),{accepted:true});
  assert.equal(published.length,1);
  assert.equal(published[0],analytics);
  assert.equal(JSON.stringify(published[0]).includes(raw.learner_id),false);
});

test('Task 34 bridge has no telemetry side effect and cannot accept a sink as learner payload transport',async()=>{
  const {toAnalyticsEvent}=await loadBridge();
  let emitted=0;
  const telemetry={emit(){emitted+=1;}};
  const out=toAnalyticsEvent(evidence(),learnerDefinition,mapping,{
    crypto:{randomUUID:()=> 'ffffffff-ffff-4fff-8fff-ffffffffffff'},
    telemetry
  });
  assert.equal(isValidatedEvent(out),true);
  assert.equal(emitted,0,'bridge must not mirror learner evidence into TelemetrySink');
});
