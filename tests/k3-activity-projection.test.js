import test from 'node:test';
import assert from 'node:assert/strict';

async function loadProjection() {
  try { return await import('../src/evidence/projections/activityProjection.js'); }
  catch { return {}; }
}

function ev(id, definition, seq, overrides = {}) {
  return {
    schema_version: 2,
    event_id: id,
    definition_id: definition,
    learner_id: 'learner:p1',
    origin_id: '223e4567-e89b-42d3-a456-426614174001',
    origin_seq: seq,
    activity_id: '323e4567-e89b-42d3-a456-426614174002',
    track_id: 'sdaia-ai-engineer',
    content_release_id: 'release-1',
    mode: 'practice',
    locale: 'en',
    occurred_at: `2026-10-03T10:00:0${Math.min(seq,9)}Z`,
    accepted_at: `2026-10-03T10:01:0${Math.min(seq,9)}Z`,
    store_id: 'store-1',
    store_seq: seq,
    payload: {},
    ...overrides
  };
}

test('ActivityProjectionV1 summarizes explicit activity and item evidence deterministically', async () => {
  const { projectActivity } = await loadProjection();
  assert.equal(typeof projectActivity, 'function', 'projectActivity behavior is missing');
  const events = [
    ev('10000000-0000-4000-8000-000000000001','learner.activity.started@1',1),
    ev('10000000-0000-4000-8000-000000000002','learner.item.presented@1',2,{item_interaction_id:'i1',item_version_id:'v1',question_family_id:'qf1',objective_id:'o1',domain_id:'d1'}),
    ev('10000000-0000-4000-8000-000000000003','learner.response.recorded@1',3,{item_interaction_id:'i1',item_version_id:'v1',payload:{response_version:1,response_kind:'OPTION',response:{option_index:0}}}),
    ev('10000000-0000-4000-8000-000000000004','learner.hint.requested@1',4,{item_interaction_id:'i1',item_version_id:'v1'}),
    ev('10000000-0000-4000-8000-000000000005','learner.explanation.opened@1',5,{item_interaction_id:'i1',item_version_id:'v1'}),
    ev('10000000-0000-4000-8000-000000000006','learner.activity.completed@1',6)
  ];
  const options={throughStoreSeq:6,policyVersion:'activity-v1',identityResolutionVersion:'identity-v1'};
  const a=projectActivity(events,options);
  const b=projectActivity(events,options);
  assert.deepEqual(a,b);
  assert.equal(a.projection_type,'ActivityProjectionV1');
  assert.equal(a.activity_id,events[0].activity_id);
  assert.equal(a.started_event_id,events[0].event_id);
  assert.equal(a.completed_event_id,events[5].event_id);
  assert.equal(a.integrity_status,'COMPLETE');
  assert.deepEqual(a.item_interactions[0].response_event_ids,[events[2].event_id]);
  assert.deepEqual(a.item_interactions[0].hint_event_ids,[events[3].event_id]);
  assert.deepEqual(a.item_interactions[0].explanation_event_ids,[events[4].event_id]);
  assert.equal('mastery' in a,false);
  assert.equal('readiness' in a,false);
  assert.equal('abandonment' in a,false);
});

test('projection incorporates late evidence by store sequence rather than occurred_at', async () => {
  const { projectActivity } = await loadProjection();
  assert.equal(typeof projectActivity,'function','projectActivity behavior is missing');
  const late=ev('10000000-0000-4000-8000-000000000003','learner.response.recorded@1',3,{
    item_interaction_id:'i1',item_version_id:'v1',occurred_at:'2020-01-01T00:00:00Z',
    payload:{response_version:1,response_kind:'OPTION',response:{option_index:1}}
  });
  const events=[
    ev('10000000-0000-4000-8000-000000000001','learner.activity.started@1',1),
    ev('10000000-0000-4000-8000-000000000002','learner.item.presented@1',2,{item_interaction_id:'i1',item_version_id:'v1'}),
    late
  ];
  const p=projectActivity(events,{throughStoreSeq:3,policyVersion:'activity-v1',identityResolutionVersion:'identity-v1'});
  assert.deepEqual(p.item_interactions[0].response_event_ids,[late.event_id]);
});

test('VOID correction removes current response and unresolved corrections mark projection incomplete', async () => {
  const { projectActivity } = await loadProjection();
  assert.equal(typeof projectActivity,'function','projectActivity behavior is missing');
  const response=ev('10000000-0000-4000-8000-000000000003','learner.response.recorded@1',3,{item_interaction_id:'i1',item_version_id:'v1'});
  const voidCorrection=ev('10000000-0000-4000-8000-000000000004','learner.evidence.correction.recorded@1',4,{
    authority_ref:'authority:test',
    payload:{target_event_id:response.event_id,action:'VOID',reason_code:'ADMIN_CORRECTION'}
  });
  const unresolved=ev('10000000-0000-4000-8000-000000000005','learner.evidence.correction.recorded@1',5,{
    authority_ref:'authority:test',
    payload:{target_event_id:'99999999-0000-4000-8000-000000000999',action:'VOID',reason_code:'ADMIN_CORRECTION'}
  });
  const p=projectActivity([
    ev('10000000-0000-4000-8000-000000000001','learner.activity.started@1',1),
    ev('10000000-0000-4000-8000-000000000002','learner.item.presented@1',2,{item_interaction_id:'i1',item_version_id:'v1'}),
    response,voidCorrection,unresolved
  ],{throughStoreSeq:5,policyVersion:'activity-v1',identityResolutionVersion:'identity-v1'});
  assert.deepEqual(p.item_interactions[0].response_event_ids,[]);
  assert.equal(p.integrity_status,'INCOMPLETE');
  assert.equal(p.unresolved_reference_count,1);
});
