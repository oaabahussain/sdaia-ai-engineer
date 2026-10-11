import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSchedulingPreferencesStore, updateSchedulingPreferences } from '../src/recommendations/preferencesStore.js';
let sequence=0;
const db=()=> 'k4-prefs-'+(++sequence);
const user='learner:opaque';
const initial=()=>({learner_id:user,version:1,revision:0,snoozed_families:[],dismissed_families:[],preferred_domain_id:null});
test('cold local preferences have non-persisted defaults',async()=>{
  const store=createSchedulingPreferencesStore({indexedDB,dbName:db()});
  assert.deepEqual(await store.read(user),{persisted:false,preferences:initial()});
});
test('successful transaction has revision and persists across a new handle',async()=>{
  const name=db(),store=createSchedulingPreferencesStore({indexedDB,dbName:name});
  const value={...initial(),snoozed_families:[{question_family_id:'family-1',until_at:'2026-10-12T00:00:00.000Z'}]};
  assert.deepEqual(await store.save({learnerId:user,expectedRevision:0,next:value}),{persisted:true,revision:1});
  const reloaded=createSchedulingPreferencesStore({indexedDB,dbName:name});
  const read=await reloaded.read(user);
  assert.equal(read.persisted,true);
  assert.equal(read.preferences.revision,1);
  assert.deepEqual(read.preferences.snoozed_families,value.snoozed_families);
});
test('stale compare-and-swap revision cannot overwrite user intent',async()=>{
  const store=createSchedulingPreferencesStore({indexedDB,dbName:db()});
  await store.save({learnerId:user,expectedRevision:0,next:initial()});
  await assert.rejects(()=>store.save({learnerId:user,expectedRevision:0,next:{...initial(),preferred_domain_id:'core-ai'}}));
  assert.equal((await store.read(user)).preferences.preferred_domain_id,null);
});
test('storage access failure is not reported as persisted',async()=>{
  const store=createSchedulingPreferencesStore({indexedDB:{open(){throw new Error('denied')}},dbName:db()});
  await assert.rejects(()=>store.read(user));
  await assert.rejects(()=>store.save({learnerId:user,expectedRevision:0,next:initial()}));
});
test('snooze action validates future expiration and durable receipt',async()=>{
  const store=createSchedulingPreferencesStore({indexedDB,dbName:db()});
  const receipt=await updateSchedulingPreferences({store,nowIso:'2026-10-09T00:00:00.000Z',
    request:{learnerId:user,expectedRevision:0,action:'SNOOZE',familyId:'family-1',untilAt:'2026-10-12T00:00:00.000Z'}});
  assert.equal(receipt.persisted,true);
  assert.equal((await store.read(user)).preferences.snoozed_families[0].question_family_id,'family-1');
  await assert.rejects(()=>updateSchedulingPreferences({store,nowIso:'2026-10-09T00:00:00.000Z',
    request:{learnerId:user,expectedRevision:1,action:'SNOOZE',familyId:'family-2',untilAt:'2026-10-08T00:00:00.000Z'}}));
});

test('AC-13 actual readwrite put quota error aborts and cannot return a durable receipt',async()=>{
  const dbName=db(),native=globalThis.IDBObjectStore.prototype.put;
  const store=createSchedulingPreferencesStore({indexedDB,dbName});
  await store.read(user); // ensure opening the DB itself is not the failing path
  try{
    globalThis.IDBObjectStore.prototype.put=function(...args){
      if(this.name==='preferences')throw new DOMException('Synthetic write quota exhausted','QuotaExceededError');
      return native.apply(this,args);
    };
    await assert.rejects(
      ()=>store.save({learnerId:user,expectedRevision:0,next:initial()}),
      e=>e?.name==='QuotaExceededError'||e?.name==='AbortError',
      'a simulated full quota must reject, never return a persisted receipt'
    );
  }finally{globalThis.IDBObjectStore.prototype.put=native}
  const after=await store.read(user);
  assert.equal(after.persisted,false,'a failed quota write cannot be presented as saved');
  assert.equal(after.preferences.revision,0,'transaction must not advance durable revision');
});
