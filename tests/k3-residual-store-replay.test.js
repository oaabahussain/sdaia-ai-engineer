import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/k3AtomicCapture.js';
import {event,fileStore} from './helpers/k3-repair-fixtures.js';
import {createIndexedDbEvidenceStore} from '../src/evidence/indexedDbStore.js';
import {replayEvidence} from '../src/evidence/replay.js';
import {syncEvidence} from '../src/evidence/sync.js';
import {createEvidenceApiTransport} from '../src/evidence/apiTransport.js';

test('same physical database rejects a second identity even when empty',async()=>{
 const f=fixture();await f.store.read('learner:a');
 const other=createIndexedDbEvidenceStore({dbName:f.name,storeId:'other',indexedDB});
 await assert.rejects(()=>other.accept(event()),/identity|store/i);
 assert.deepEqual(await f.store.read('learner:a'),[]);
});
test('concurrent first initialization cannot split a database identity',async()=>{
 const f=fixture();const other=createIndexedDbEvidenceStore({dbName:f.name,storeId:'other',indexedDB});
 const results=await Promise.allSettled([f.store.accept(event()),other.accept(event(2))]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
});
for(const kind of ['IndexedDB','JSONL'])test(`real ${kind} replay includes receipt identity/order without mutating raw`,async t=>{
 const store=kind==='IndexedDB'?fixture().store:(await fileStore(t)).store;
 const a=event(),b=event(2,{occurred_at:'2020-01-01T00:00:00Z'});const receipt=await store.accept(a);await store.accept(b);
 let got,error=null;try{got=await replayEvidence(store,{fromSeq:1,toSeq:2,projectors:{ids:rows=>rows.map(x=>x.event_id)}})}catch(e){error=e.message}
 assert.equal(error,null);assert.equal(got.source_store_id,receipt.store_id);assert.deepEqual(got.projections.ids,[a.event_id,b.event_id]);
 assert.deepEqual(await store.getById(a.event_id),a);
 await assert.rejects(()=>replayEvidence(store,{fromSeq:1,toSeq:2**53}),/safe|watermark|toSeq/i);
});
test('source-bound numeric resume refuses another store before any local write',async()=>{
 const f=fixture();let wrote=false;
 await assert.rejects(()=>syncEvidence({store:f.store,outbox:f.store.outbox,watermark:5,sourceStoreId:'source:a',syncPort:{async push(){return {schema_version:1,receipts:[]}},async pull(){return {store_id:'source:b',events:[event()],next_store_seq:6}}}}),/source|store|identity/i);
 assert.deepEqual(await f.store.read('learner:a'),[]);
});
test('successful cursor survives reopening and resumes with its source identity',async()=>{
 const f=fixture();
 const syncPort={async push(){return {schema_version:1,receipts:[]}},async pull(n){return {store_id:'source:a',events:n===0?[event()]:[],next_store_seq:1}}};
 const first=await syncEvidence({store:f.store,outbox:f.store.outbox,syncPort});
 assert.deepEqual(first.cursor,{store_id:'source:a',through_store_seq:1});
 const reopened=fixture({name:f.name});let received;
 const second=await syncEvidence({store:reopened.store,outbox:reopened.store.outbox,syncPort:{...syncPort,async pull(n,id){received=[n,id];return {store_id:'source:a',events:[],next_store_seq:n}}}});
 assert.deepEqual(received,[1,'source:a']);assert.equal(second.watermark,1);
});
test('API transport carries source identity and rejects an unbound nonzero cursor',async()=>{
 const urls=[];const transport=createEvidenceApiTransport({fetchImpl:async url=>{urls.push(url);return {ok:true,json:async()=>({store_id:'remote',events:[],next_store_seq:7})}}});
 let error=null;try{await transport.pull({store_id:'remote',through_store_seq:7})}catch(e){error=e.message}
 assert.equal(error,null);assert.match(urls[0],/source_store_id=remote/);assert.match(urls[0],/after_store_seq=7/);
 await assert.rejects(()=>transport.pull(8),/source|cursor|store/i);
});
