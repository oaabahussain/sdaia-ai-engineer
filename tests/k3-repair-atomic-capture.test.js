import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture,input,snapshot,faultAdd,result,storage } from './helpers/k3AtomicCapture.js';
import { captureLocalEvidence } from '../src/evidence/localCapture.js';
import { syncEvidence } from '../src/evidence/sync.js';
import { fingerprintEvent } from '../src/evidence/jcs.js';
import { EVIDENCE_ORIGIN_KEY,EVIDENCE_ORIGIN_SEQ_KEY } from '../src/storage/identity.js';
import { event as baseEvent } from './helpers/k3-repair-fixtures.js';
const options=f=>({...f,eventInput:input(),outbox:f.store.outbox});
function native(f){ assert.equal(typeof f.store.outbox?.listPending,'function','atomic store-bound outbox is required'); }

test('F01 separate outbox persistence is rejected before any raw write',async()=>{
 const f=fixture();await assert.rejects(()=>captureLocalEvidence({...options(f),outbox:{enqueue:async()=>{throw Error('separate outbox failure');}}}),/outbox/);
 assert.deepEqual(await f.store.read('learner:a'),[]);
});
for(const name of ['events','receipts','outbox']) test(`F01 ${name} write failure rolls back all state and permits retry`,async t=>{
 const f=fixture();native(f);const restore=faultAdd(t,name);
 await assert.rejects(()=>captureLocalEvidence(options(f)),/injected/);restore();
 const empty=await snapshot(f.name);
 assert.deepEqual(empty.events,[]);assert.deepEqual(empty.receipts,[]);assert.deepEqual(empty.outbox,[]);
 assert.equal(empty.meta.some(r=>['capture_origin','next_store_seq'].includes(r.key)),false);
 const next=await captureLocalEvidence(options(f));assert.equal(next.event.origin_seq,1);assert.equal(next.receipt.store_seq,1);
 assert.deepEqual((await f.store.outbox.listPending()).map(r=>r.event_id),[next.event.event_id]);
});
test('F01 late transaction abort cannot produce a successful capture or orphan',async t=>{
 const f=fixture();native(f);const restore=faultAdd(t,'outbox',{lateAbort:true});
 await assert.rejects(()=>captureLocalEvidence(options(f)),/abort/i);restore();
 assert.deepEqual((await snapshot(f.name)).events,[]);assert.deepEqual(await f.store.outbox.listPending(),[]);
 const next=await captureLocalEvidence(options(f));assert.equal(next.event.origin_seq,1);
});
test('F01 concurrent adapters allocate one origin and unique ordered committed sequences',async()=>{
 const a=fixture(),b=fixture({name:a.name});native(a);native(b);
 const values=await Promise.all(Array.from({length:16},(_,i)=>captureLocalEvidence(options(i%2?a:b))));
 assert.deepEqual(values.map(v=>v.event.origin_seq).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i+1));
 assert.equal(new Set(values.map(v=>v.event.origin_id)).size,1);
 const state=await snapshot(a.name);assert.equal(state.events.length,16);assert.equal(state.receipts.length,16);assert.equal(state.outbox.length,16);
 assert.equal(state.meta.find(r=>r.key==='capture_origin').value.origin_seq,16);
});
test('F01 reopen preserves durable origin even with lost localStorage',async()=>{
 const a=fixture();native(a);const one=await captureLocalEvidence(options(a));
 const b=fixture({name:a.name,originStorage:null});native(b);const two=await captureLocalEvidence(options(b));
 assert.equal(two.event.origin_id,one.event.origin_id);assert.equal(two.event.origin_seq,2);
 assert.equal((await b.store.outbox.listPending()).length,2);
});
test('F01 disabled synchronization does not enqueue but preserves event and sequence',async()=>{
 const f=fixture();native(f);
 const v=await captureLocalEvidence({...options(f),outbox:undefined});
 assert.equal(v.receipt.disposition,'ACCEPTED');assert.deepEqual(await f.store.outbox.listPending(),[]);
 assert.equal((await snapshot(f.name)).meta.find(r=>r.key==='capture_origin').value.origin_seq,1);
});
test('F01 invalid event and another store outbox never change capture state',async()=>{
 const f=fixture(),other=fixture();native(f);native(other);
 await assert.rejects(()=>captureLocalEvidence({...options(f),outbox:other.store.outbox}),/outbox/);
 await assert.rejects(()=>captureLocalEvidence({...options(f),eventInput:input({payload:{mastery:1}})}),/payload|Invalid/);
 assert.deepEqual(await f.store.read('learner:a'),[]);
 assert.equal((await captureLocalEvidence(options(f))).event.origin_seq,1);
});
test('F01 captures input snapshot before asynchronous preparation',async()=>{
 const f=fixture();native(f);const value=input();const promise=captureLocalEvidence({...options(f),eventInput:value});
 value.payload.response.option_index=3;
 assert.equal((await promise).event.payload.response.option_index,0);
});
test('F01 native outbox survives lost acknowledgement and sync restart',async()=>{
 const f=fixture(),remote=fixture();native(f);native(remote);const captured=await captureLocalEvidence(options(f));let lost=true;
 const syncPort={push:async events=>{const batch=await remote.store.acceptBatch(events);if(lost){lost=false;throw Error('lost ACK');}return batch;},pull:async n=>({events:[],next_store_seq:n})};
 await assert.rejects(()=>syncEvidence({store:f.store,outbox:f.store.outbox,syncPort}),/lost ACK/);
 const reopened=fixture({name:f.name});const done=await syncEvidence({store:reopened.store,outbox:reopened.store.outbox,syncPort});
 assert.equal(done.pushed,1);assert.deepEqual(await reopened.store.outbox.listPending({includeInFlight:true}),[]);
 const record=(await snapshot(f.name)).outbox[0];assert.equal(record.state,'ACKNOWLEDGED');assert.equal(record.last_disposition,'DUPLICATE');
 assert.deepEqual(await remote.store.getById(captured.event.event_id),captured.event);
});
test('F01 outbox batch update rolls back if a later record is absent',async()=>{
 const f=fixture();native(f);const v=await captureLocalEvidence(options(f));
 await assert.rejects(()=>f.store.outbox.markInFlight([v.event.event_id,'20000000-0000-4000-8000-000000000999'],'2026-10-03T18:00:00Z'),/not found/i);
 const r=(await snapshot(f.name)).outbox[0];assert.equal(r.state,'PENDING');assert.equal(r.attempt_count,0);
});
test('F01 native outbox rejects an acknowledgement for changed event bytes',async()=>{
 const f=fixture();native(f);const v=await captureLocalEvidence(options(f));
 await assert.rejects(()=>f.store.outbox.applyReceipt({...v.receipt,event_fingerprint:'f'.repeat(64)}),/fingerprint/i);
 assert.equal((await f.store.outbox.listPending()).length,1);
});
test('F01 V1 database upgrade preserves evidence and resumes the committed origin high-water mark',async()=>{
 const name=crypto.randomUUID(), originStorage=storage(),e=baseEvent(6);
 originStorage.setItem(EVIDENCE_ORIGIN_KEY,e.origin_id);originStorage.setItem(EVIDENCE_ORIGIN_SEQ_KEY,'12');
 const request=indexedDB.open(name,1);
 request.onupgradeneeded=()=>{
  const db=request.result,events=db.createObjectStore('events',{keyPath:'event_id'});
  for(const [name,key,unique] of [['by_origin_seq',['origin_id','origin_seq'],true],['by_store_seq','store_seq',true]]) events.createIndex(name,key,{unique});
  db.createObjectStore('receipts',{keyPath:'event_id'});db.createObjectStore('meta',{keyPath:'key'});
 };
 const db=await result(request),fp=await fingerprintEvent(e),receipt={schema_version:1,event_id:e.event_id,event_fingerprint:fp,store_id:'local:test',store_seq:7,disposition:'ACCEPTED',accepted_at:'2026-10-03T18:00:00Z',warnings:[]};
 const tx=db.transaction(['events','receipts','meta'],'readwrite');const done=new Promise((res,rej)=>{tx.oncomplete=res;tx.onabort=rej;});
 tx.objectStore('events').add({...e,event_fingerprint:fp,store_id:'local:test',store_seq:7,accepted_at:receipt.accepted_at,event:e});
 tx.objectStore('receipts').add(receipt);tx.objectStore('meta').put({key:'next_store_seq',value:8});await done;db.close();
 const f=fixture({name,originStorage});native(f);const next=await captureLocalEvidence(options(f));
 assert.equal(next.event.origin_id,e.origin_id);assert.equal(next.event.origin_seq,13);assert.equal(next.receipt.store_seq,8);
 assert.deepEqual(await f.store.getById(e.event_id),e);assert.equal((await f.store.outbox.listPending()).length,1);
});
