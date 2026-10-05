import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {pathToFileURL} from 'node:url';
const root=process.env.AUDIT_REPO;if(!root)throw Error('AUDIT_REPO required');
const load=p=>import(pathToFileURL(`${root}/${p}`).href);
const {event,fileStore}=await load('tests/helpers/k3-repair-fixtures.js');
const {fixture,input}=await load('tests/helpers/k3AtomicCapture.js');
const {captureLocalEvidence}=await load('src/evidence/localCapture.js');
test('K01 interrupted JSONL sidecar remains fail-closed and needs operator recovery',async t=>{
 const f=await fileStore(t);const original=fs.rename;
 fs.rename=async (...args)=>{if(args[1]===f.indexFile)throw Error('injected sidecar publication failure');return original(...args);};
 t.after(()=>{fs.rename=original;});
 await assert.rejects(()=>f.store.accept(event()),/sidecar publication/);
 fs.rename=original;
 assert.equal(JSON.parse((await fs.readFile(f.eventFile,'utf8')).trim()).event_id,event().event_id);
 await assert.rejects(()=>f.store.read('learner:a'),/event\/index length mismatch/);
});
test('K02 native outbox still rejects a receipt with a changed fingerprint',async()=>{
 const f=fixture();const x=await captureLocalEvidence({...f,outbox:f.store.outbox,eventInput:input()});
 await assert.rejects(()=>f.store.outbox.applyReceipt({...x.receipt,event_fingerprint:'0'.repeat(64)}),/fingerprint/);
 assert.equal((await f.store.outbox.listPending()).length,1);
});
test('K03 ordinary JSONL duplicate retry still preserves receipt identity',async t=>{
 const f=await fileStore(t);const a=await f.store.accept(event());const b=await f.store.accept(event());
 assert.equal(b.disposition,'DUPLICATE');assert.equal(a.store_id,b.store_id);assert.equal(a.store_seq,b.store_seq);assert.equal(a.event_fingerprint,b.event_fingerprint);
});
