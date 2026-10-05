import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrCreateEvidenceOriginId, withNextEvidenceOriginSeq } from '../src/evidence/origin.js';
import { EVIDENCE_ORIGIN_KEY, EVIDENCE_ORIGIN_SEQ_KEY } from '../src/storage/identity.js';

test('F02 absent storage keeps origin identity and increasing in-memory sequence', async () => {
  assert.equal(getOrCreateEvidenceOriginId(null), getOrCreateEvidenceOriginId(null));
  const first = await withNextEvidenceOriginSeq(null, async n => n);
  assert.equal(await withNextEvidenceOriginSeq(null, async n => n), first + 1);
});
test('F02 readable storage whose writes fail retains committed memory sequence', async () => {
  const storage = { getItem: () => null, setItem: () => { throw Error('quota'); } };
  const id = getOrCreateEvidenceOriginId(storage);
  assert.equal(getOrCreateEvidenceOriginId(storage), id);
  assert.equal(await withNextEvidenceOriginSeq(storage, async n => n), 1);
  assert.equal(await withNextEvidenceOriginSeq(storage, async n => n), 2);
});
test('F02 later blocked storage preserves an already observed origin and sequence', async () => {
  const values = new Map([[EVIDENCE_ORIGIN_KEY,'10000000-0000-4000-8000-000000000001'], [EVIDENCE_ORIGIN_SEQ_KEY,'9']]);
  let blocked = false;
  const storage = { getItem:k => { if(blocked) throw Error('blocked'); return values.get(k) ?? null; }, setItem:(k,v) => { if(blocked) throw Error('quota'); values.set(k,v); } };
  const id = getOrCreateEvidenceOriginId(storage);
  assert.equal(await withNextEvidenceOriginSeq(storage, async n => n), 10);
  blocked = true;
  assert.equal(getOrCreateEvidenceOriginId(storage), id);
  assert.equal(await withNextEvidenceOriginSeq(storage, async n => n), 11);
});
test('F02 stale persistent sequence never lowers committed session sequence', async () => {
  const storage = { getItem:k => k === EVIDENCE_ORIGIN_SEQ_KEY ? '4' : null, setItem:() => { throw Error('quota'); } };
  assert.equal(await withNextEvidenceOriginSeq(storage, async n => n), 5);
  assert.equal(await withNextEvidenceOriginSeq(storage, async n => n), 6);
});
test('F02 failed operation does not advance sequence and overflow never reaches callback', async () => {
  const values = new Map(); const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  await assert.rejects(withNextEvidenceOriginSeq(storage, async()=>{throw Error('failed')}),/failed/);
  assert.equal(await withNextEvidenceOriginSeq(storage, async n=>n),1);
  values.set(EVIDENCE_ORIGIN_SEQ_KEY,String(Number.MAX_SAFE_INTEGER));
  let called=false;
  await assert.rejects(withNextEvidenceOriginSeq(storage,async()=>{called=true}),/sequence|overflow/i);
  assert.equal(called,false);
});
