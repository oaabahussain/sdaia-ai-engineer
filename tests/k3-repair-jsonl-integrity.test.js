import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { event, fileStore, uid } from './helpers/k3-repair-fixtures.js';
const corruptions={
  reorder:x=>x.entries.reverse(),
  learner:x=>{x.entries[0].learner_id='learner:b'},
  origin:x=>{x.entries[0].origin_id=uid(900)},
  fingerprint:x=>{x.entries[0].event_fingerprint='a'.repeat(64)},
  sequence:x=>{x.entries[1].store_seq=x.entries[0].store_seq},
  counter:x=>{x.next_store_seq=1},
  store:x=>{x.entries[0].store_id='different'}
};
for(const [name,mutate] of Object.entries(corruptions)) test(`F04 rejects ${name} sidecar corruption on every path without writing`,async t=>{
  const f=await fileStore(t);await f.store.accept(event());await f.store.accept(event(2,{learner_id:'learner:b'}));
  const index=JSON.parse(await fs.readFile(f.indexFile));mutate(index);await fs.writeFile(f.indexFile,JSON.stringify(index));
  const bytes=await fs.readFile(f.eventFile,'utf8');
  await assert.rejects(()=>f.store.read('learner:a'));
  await assert.rejects(()=>f.store.getById(uid(1)));
  await assert.rejects(()=>f.store.accept(event(3)));
  assert.equal(await fs.readFile(f.eventFile,'utf8'),bytes);
});
test('F04 detects changed raw body with same sidecar count',async t=>{
  const f=await fileStore(t);await f.store.accept(event());
  await fs.writeFile(f.eventFile,JSON.stringify(event(1,{payload:{source:'tampered'}}))+'\n');
  await assert.rejects(()=>f.store.getById(uid(1)));
});
test('F04 valid sidecar still preserves read scope and exact retry',async t=>{
  const f=await fileStore(t);await f.store.accept(event());await f.store.accept(event(2,{learner_id:'learner:b'}));
  assert.deepEqual(await f.store.read('learner:a'),[event()]);
  assert.equal((await f.store.accept(event())).disposition,'DUPLICATE');
});
