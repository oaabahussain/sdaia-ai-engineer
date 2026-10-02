import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvidenceOutbox } from '../src/evidence/outbox.js';

async function loadSync() {
  try { return await import('../src/evidence/sync.js'); }
  catch { return {}; }
}
async function loadPort() {
  try { return await import('../src/evidence/syncPort.js'); }
  catch { return {}; }
}

const A='123e4567-e89b-42d3-a456-426614174000';
const B='223e4567-e89b-42d3-a456-426614174001';

function event(id, originSeq=1) {
  return { event_id:id, learner_id:'learner:p1', origin_id:'323e4567-e89b-42d3-a456-426614174002', origin_seq:originSeq, body:{answer:originSeq} };
}

function persistence() {
  let state=[];
  return {
    async load(){ return structuredClone(state); },
    async save(records){ state=structuredClone(records); }
  };
}

function localStore(seed=[]) {
  const rows=new Map(seed.map((x)=>[x.event_id, structuredClone(x)]));
  return {
    async accept(value){
      const current=rows.get(value.event_id);
      if (current) {
        return {schema_version:1,store_id:'local',event_id:value.event_id,event_fingerprint:'a'.repeat(64),disposition:JSON.stringify(current)===JSON.stringify(value)?'DUPLICATE':'CONFLICT',accepted_at:'2026-10-02T22:00:00Z',store_seq:[...rows.keys()].indexOf(value.event_id)+1,warnings:[]};
      }
      rows.set(value.event_id,structuredClone(value));
      return {schema_version:1,store_id:'local',event_id:value.event_id,event_fingerprint:'a'.repeat(64),disposition:'ACCEPTED',accepted_at:'2026-10-02T22:00:00Z',store_seq:rows.size,warnings:[]};
    },
    async getById(id){ return structuredClone(rows.get(id) ?? null); },
    values(){ return [...rows.values()].map((value)=>structuredClone(value)); }
  };
}

function receipt(id, disposition='ACCEPTED', seq=1) {
  return {schema_version:1,store_id:'authority',event_id:id,event_fingerprint:'b'.repeat(64),disposition,accepted_at:'2026-10-02T22:10:00Z',store_seq:seq,warnings:[]};
}

test('sync port requires push and pull', async()=>{
  const { assertEvidenceSyncPort }=await loadPort();
  assert.equal(typeof assertEvidenceSyncPort,'function','assertEvidenceSyncPort behavior is missing');
  const port={async push(){},async pull(){}};
  assert.equal(assertEvidenceSyncPort(port),port);
  assert.throws(()=>assertEvidenceSyncPort({pull(){}}),/push/);
  assert.throws(()=>assertEvidenceSyncPort({push(){}}),/pull/);
});

test('lost ACK keeps original event pending and duplicate retry acknowledges it', async()=>{
  const { syncEvidence }=await loadSync();
  assert.equal(typeof syncEvidence,'function','syncEvidence behavior is missing');
  const store=localStore([event(A)]);
  const shared=persistence();
  const outbox=createEvidenceOutbox({persistence:shared});
  await outbox.enqueue(A);
  const pushed=[];
  let calls=0;
  const port={
    async push(events){
      pushed.push(structuredClone(events));
      calls+=1;
      if(calls===1) throw new Error('lost-ack');
      return {schema_version:1,receipts:[receipt(A,'DUPLICATE',9)]};
    },
    async pull(after){ return {events:[],next_store_seq:after}; }
  };
  await assert.rejects(()=>syncEvidence({store,outbox,syncPort:port,watermark:0,policy:{now:()=> '2026-10-02T22:11:00Z'}}),/lost-ack/);
  assert.deepEqual((await outbox.listPending()).map(x=>x.event_id),[A]);

  const result=await syncEvidence({store,outbox,syncPort:port,watermark:0,policy:{now:()=> '2026-10-02T22:12:00Z'}});
  assert.equal(result.pushed,1);
  assert.deepEqual(pushed[0],pushed[1],'retry must preserve original event bytes');
  assert.deepEqual(await outbox.listPending(),[]);
});

test('partial batch only resolves returned receipts and leaves missing sibling pending', async()=>{
  const { syncEvidence }=await loadSync();
  const store=localStore([event(A),event(B,2)]);
  const outbox=createEvidenceOutbox({persistence:persistence()});
  await outbox.enqueue(A); await outbox.enqueue(B);
  const port={
    async push(events){ assert.deepEqual(events.map(x=>x.event_id),[A,B]); return {schema_version:1,receipts:[receipt(A,'ACCEPTED',1)]}; },
    async pull(after){ return {events:[],next_store_seq:after}; }
  };
  const result=await syncEvidence({store,outbox,syncPort:port,watermark:0,policy:{now:()=> '2026-10-02T22:13:00Z'}});
  assert.equal(result.pushed,2);
  assert.deepEqual((await outbox.listPending()).map(x=>x.event_id),[B]);
});

test('restart reuses persisted pending outbox and network failure does not lose work', async()=>{
  const { syncEvidence }=await loadSync();
  const store=localStore([event(A)]);
  const shared=persistence();
  let outbox=createEvidenceOutbox({persistence:shared});
  await outbox.enqueue(A);
  const fail={async push(){throw new Error('offline')},async pull(after){return {events:[],next_store_seq:after}}};
  await assert.rejects(()=>syncEvidence({store,outbox,syncPort:fail,watermark:0,policy:{}}),/offline/);

  outbox=createEvidenceOutbox({persistence:shared});
  const ok={async push(){return {schema_version:1,receipts:[receipt(A,'ACCEPTED',4)]}},async pull(after){return {events:[],next_store_seq:after}}};
  await syncEvidence({store,outbox,syncPort:ok,watermark:0,policy:{now:()=> '2026-10-02T22:14:00Z'}});
  assert.deepEqual(await outbox.listPending(),[]);
});

test('pull is resumable and stores authoritative events without re-enqueueing them', async()=>{
  const { syncEvidence }=await loadSync();
  const store=localStore();
  const outbox=createEvidenceOutbox({persistence:persistence()});
  const remote=[event(A),event(B,2)];
  const calls=[];
  const port={
    async push(){return {schema_version:1,receipts:[]}},
    async pull(after){
      calls.push(after);
      if(after===0) return {events:[remote[0]],next_store_seq:10};
      if(after===10) return {events:[remote[1]],next_store_seq:11};
      return {events:[],next_store_seq:after};
    }
  };
  const first=await syncEvidence({store,outbox,syncPort:port,watermark:0,policy:{}});
  assert.equal(first.watermark,10);
  const second=await syncEvidence({store,outbox,syncPort:port,watermark:first.watermark,policy:{}});
  assert.equal(second.watermark,11);
  assert.deepEqual(calls,[0,10]);
  assert.deepEqual(store.values(),remote);
  assert.deepEqual(await outbox.listPending(),[]);
});
