import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,input} from './helpers/k3AtomicCapture.js';
import {captureLocalEvidence} from '../src/evidence/localCapture.js';
import {createEvidenceOutbox} from '../src/evidence/outbox.js';
for(const kind of ['native','portable'])test(`${kind} receipt errors obey asynchronous port rejection`,async()=>{
 const f=fixture(), x=await captureLocalEvidence({...f,eventInput:input(),outbox:f.store.outbox});let rows=[];
 const box=kind==='native'?f.store.outbox:createEvidenceOutbox({persistence:{async load(){return rows},async save(v){rows=v}}});
 if(kind==='portable')await box.enqueue(x.event.event_id);
 const bad={...x.receipt};delete bad.store_seq;
 await assert.rejects(()=>box.applyReceipt(bad),/store_seq/i);
 assert.equal((await box.listPending({includeInFlight:true})).length,1);
});
