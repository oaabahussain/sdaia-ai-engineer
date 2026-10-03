import test from 'node:test';
import assert from 'node:assert/strict';

async function loadReplay(){try{return await import('../src/evidence/replay.js')}catch{return {}}}
function event(id,seq,occurred){return {schema_version:2,event_id:id,definition_id:'learner.activity.started@1',learner_id:'learner:p1',origin_id:'20000000-0000-4000-8000-000000000001',origin_seq:seq,activity_id:'30000000-0000-4000-8000-000000000001',track_id:'sdaia-ai-engineer',content_release_id:'release-1',mode:'practice',locale:'en',occurred_at:occurred,store_seq:seq}}
function store(events){return {store_id:'store-1',async readRange({fromSeq,toSeq}){return events.filter(e=>e.store_seq>=fromSeq&&e.store_seq<=toSeq)}}}

test('replayEvidence uses authoritative store-sequence watermark and deterministic projector input',async()=>{
 const {replayEvidence}=await loadReplay();assert.equal(typeof replayEvidence,'function','replayEvidence behavior is missing');
 const events=[event('10000000-0000-4000-8000-000000000001',1,'2026-10-03T10:00:00Z'),event('10000000-0000-4000-8000-000000000002',2,'2026-10-03T10:00:01Z')];
 const projectors={ids:(rows,ctx)=>({ids:rows.map(x=>x.event_id),through:ctx.throughStoreSeq})};
 const a=await replayEvidence(store(events),{fromSeq:1,toSeq:2,projectors});
 const b=await replayEvidence(store(events),{fromSeq:1,toSeq:2,projectors});
 assert.deepEqual(a,b);
 assert.equal(a.source_store_id,'store-1');
 assert.equal(a.through_store_seq,2);
 assert.deepEqual(a.projections.ids,{ids:events.map(e=>e.event_id),through:2});
});

test('late evidence with older occurred_at is incorporated when its store_seq enters replay range',async()=>{
 const {replayEvidence}=await loadReplay();assert.equal(typeof replayEvidence,'function','replayEvidence behavior is missing');
 const events=[event('10000000-0000-4000-8000-000000000001',1,'2026-10-03T10:00:00Z'),event('10000000-0000-4000-8000-000000000002',2,'2026-10-03T10:00:01Z')];
 const projector={count:(rows)=>rows.length};
 const before=await replayEvidence(store(events),{fromSeq:1,toSeq:2,projectors:projector});
 events.push(event('10000000-0000-4000-8000-000000000003',3,'2020-01-01T00:00:00Z'));
 const after=await replayEvidence(store(events),{fromSeq:1,toSeq:3,projectors:projector});
 assert.equal(before.projections.count,2);
 assert.equal(after.projections.count,3);
});

test('replayEvidence rejects regressing or invalid watermark ranges',async()=>{
 const {replayEvidence}=await loadReplay();assert.equal(typeof replayEvidence,'function','replayEvidence behavior is missing');
 await assert.rejects(()=>replayEvidence(store([]),{fromSeq:5,toSeq:3,projectors:{}}),/watermark|fromSeq|toSeq/i);
});
