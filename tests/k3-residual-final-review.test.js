import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,input} from './helpers/k3AtomicCapture.js';
import {event,uid} from './helpers/k3-repair-fixtures.js';
import {captureLocalEvidence} from '../src/evidence/localCapture.js';
import {createEvidenceOutbox} from '../src/evidence/outbox.js';
import {replayEvidence} from '../src/evidence/replay.js';

test('direct atomic local capture cannot originate a privileged definition',async()=>{
 const f=fixture();const context={...f.runtimeContext,eventDefinitions:[{event_name:'learner.evidence.correction.recorded',event_version:1,required_context_fields:['authority_ref'],payload_schema_ref:'data/evidence/payload-schemas/evidence-correction-recorded-v1.schema.json'}]};
 const value=event(1,{definition_id:'learner.evidence.correction.recorded@1',authority_ref:'unverified',payload:{action:'VOID',target_event_id:uid(99),reason_code:'TEST'}});
 await assert.rejects(async()=>f.store.captureLocal({eventInput:value,runtimeContext:context,outbox:f.store.outbox}),/producer|authority|authoriz/i);
 assert.equal((await f.store.read('learner:a')).length,0);
});
for(const kind of ['native','portable'])for(const wrong of ['foreign-source','different-sequence','late-conflict'])test(`${kind} preserves acknowledged evidence on ${wrong}`,async()=>{
 const f=fixture(),got=await captureLocalEvidence({...f,eventInput:input(),outbox:f.store.outbox});let rows=[];
 const box=kind==='native'?f.store.outbox:createEvidenceOutbox({persistence:{async load(){return rows},async save(v){rows=v}}});
 if(kind==='portable')await box.enqueue(got.event.event_id);
 const good={...got.receipt,store_id:'remote'};const original=await box.applyReceipt(good);
 const bad=wrong==='foreign-source'?{...good,store_id:'different'}:wrong==='different-sequence'?{...good,store_seq:good.store_seq+1}:{...good,disposition:'CONFLICT',reason_code:'TEST'};
 await assert.rejects(()=>box.applyReceipt(bad),/acknowledg|source|receipt|conflict/i);
 assert.deepEqual(await box.applyReceipt({...good,disposition:'DUPLICATE'}),original);
 assert.equal((await box.listPending({includeInFlight:true})).length,0);
});
for(const bad of ['unsafe-seq','foreign-source','duplicate-seq','duplicate-id'])test(`replay rejects ${bad} instead of silently certifying watermark`,async()=>{
 const rows=[{...event(),store_seq:1,store_id:'source'}];
 if(bad==='unsafe-seq')rows[0].store_seq=2**53;
 if(bad==='foreign-source')rows[0].store_id='other';
 if(bad==='duplicate-seq')rows.push({...event(2),store_seq:1,store_id:'source'});
 if(bad==='duplicate-id')rows.push({...rows[0],store_seq:2});
 await assert.rejects(()=>replayEvidence({store_id:'source',async readRange(){return rows}},{fromSeq:1,toSeq:2}),/sequence|identity|store|duplicate|range/i);
});
test('one projector cannot mutate evidence for another projector or store',async()=>{
 const rows=[{...event(),store_seq:1,store_id:'source'}],before=structuredClone(rows);
 const out=await replayEvidence({store_id:'source',async readRange(){return rows}},{fromSeq:1,toSeq:1,projectors:{a:values=>{values[0].learner_id='learner:changed';values.pop();return 1},b:values=>values.map(x=>x.learner_id)}});
 assert.deepEqual(rows,before);assert.deepEqual(out.projections.b,['learner:a']);assert.equal(out.event_count,1);
});
