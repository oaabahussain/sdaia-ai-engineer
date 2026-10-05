import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,input} from './helpers/k3AtomicCapture.js';
import {uid} from './helpers/k3-repair-fixtures.js';
import {captureLocalEvidence} from '../src/evidence/localCapture.js';
import {syncEvidence} from '../src/evidence/sync.js';
import {createEvidenceOutbox} from '../src/evidence/outbox.js';
const capture=(f,n)=>captureLocalEvidence({...f,outbox:f.store.outbox,eventInput:input({event_id:uid(n)})});
const pull=async n=>({events:[],next_store_seq:n});
for(const batchSize of [undefined,1])test(`send origin sequence before UUID and before limiting ${batchSize}`,async()=>{
 const f=fixture();await capture(f,999);await capture(f,1);let pushed;
 await syncEvidence({store:f.store,outbox:f.store.outbox,policy:{pushBatchSize:batchSize},syncPort:{async push(events){pushed=events;return {schema_version:1,receipts:[]}},pull}});
 assert.deepEqual(pushed.map(e=>e.origin_seq),batchSize===1?[1]:[1,2]);
});
test('all attempts are durable before push and remain retryable after network loss',async()=>{
 const f=fixture();await capture(f,1);await capture(f,2);
 await assert.rejects(()=>syncEvidence({store:f.store,outbox:f.store.outbox,syncPort:{async push(){const rows=await f.store.outbox.listPending({includeInFlight:true});assert.ok(rows.every(r=>r.attempt_count===1&&r.last_attempt_at));throw Error('network lost')},pull}}),/network lost/);
 const rows=await f.store.outbox.listPending({includeInFlight:true});assert.equal(rows.length,2);assert.ok(rows.every(r=>r.attempt_count===1));
});
for(const type of ['native','portable'])for(const badSeq of [undefined,2**53,0])test(`${type} rejects ACK with sequence ${badSeq}`,async()=>{
 const f=fixture();const x=await capture(f,1);let data=[];
 const outbox=type==='native'?f.store.outbox:createEvidenceOutbox({persistence:{async load(){return data},async save(v){data=v}}});
 if(type==='portable')await outbox.enqueue(x.event.event_id);
 const receipt={...x.receipt,store_id:'remote:test'};if(badSeq===undefined)delete receipt.store_seq;else receipt.store_seq=badSeq;
 await assert.rejects(async()=>outbox.applyReceipt(receipt),/sequence|receipt|store_seq/i);assert.equal((await outbox.listPending({includeInFlight:true})).length,1);
});
test('wrong later batch receipt cannot acknowledge a valid earlier sibling',async()=>{
 const f=fixture();const a=await capture(f,1), b=await capture(f,2);
 await assert.rejects(()=>syncEvidence({store:f.store,outbox:f.store.outbox,syncPort:{async push(){return {schema_version:1,receipts:[{...a.receipt,store_id:'remote:test'},{...b.receipt,store_id:'remote:test',event_fingerprint:'f'.repeat(64)}]}},pull}}),/fingerprint|receipt/i);
 assert.equal((await f.store.outbox.listPending({includeInFlight:true})).length,2);
});
