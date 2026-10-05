import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createJsonlEvidenceStore } from '../scripts/platform-kernel/adapters/jsonlEvidenceStore.js';
import { event, fileStore } from './helpers/k3-repair-fixtures.js';

test('F03 concurrent unique JSONL writes allocate unique receipts and preserve all events',async t=>{
  const f=await fileStore(t);
  const outcomes=await Promise.allSettled(Array.from({length:12},(_,i)=>f.store.accept(event(i+1))));
  assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,12,JSON.stringify(outcomes));
  assert.deepEqual(outcomes.map(x=>x.value.store_seq).sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+1));
  assert.equal((await f.store.read('learner:a')).length,12);
});
test('F03 separate adapters sharing storage serialize exact retry and concurrent reads',async t=>{
  const f=await fileStore(t);
  const other=createJsonlEvidenceStore(f.eventFile,f.indexFile,{storeId:'repair:jsonl'});
  const outcomes=await Promise.all(Array.from({length:12},(_,i)=>(i%2?other:f.store).accept(event())));
  assert.equal(outcomes.filter(x=>x.disposition==='ACCEPTED').length,1);
  assert.equal(outcomes.filter(x=>x.disposition==='DUPLICATE').length,11);
  await Promise.all([f.store.accept(event(2)),other.read('learner:a')]);
  assert.equal((await other.read('learner:a')).length,2);
});
test('F03 existing foreign writer lock is not stolen or removed',async t=>{
  const f=await fileStore(t);
  const lock=f.eventFile+'.lock';await fs.writeFile(lock,'foreign owner');
  await assert.rejects(()=>f.store.accept(event()),/busy|lock/i);
  assert.equal(await fs.readFile(lock,'utf8'),'foreign owner');
  await assert.rejects(()=>fs.stat(f.eventFile),{code:'ENOENT'});
  await fs.unlink(lock);
  assert.equal((await f.store.accept(event())).disposition,'ACCEPTED');
});
test('F03 failed load releases owned locks and does not poison the queue',async t=>{
  const f=await fileStore(t);
  await fs.writeFile(f.eventFile,'invalid json\n');
  await assert.rejects(()=>f.store.accept(event()));
  await fs.unlink(f.eventFile);
  assert.equal((await f.store.accept(event())).disposition,'ACCEPTED');
  const names=await fs.readdir(f.dir);
  assert.deepEqual(names.sort(),['events.jsonl','index.json']);
});
