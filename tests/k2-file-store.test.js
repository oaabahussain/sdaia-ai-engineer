import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';

test('K2 governance file store persists immutable records idempotently',async()=>{
 const {createK2GovernanceFileStore}=await import('../scripts/platform-kernel/adapters/k2GovernanceFileStore.js');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'k2-gov-'));const s=createK2GovernanceFileStore(root);
 const record={schema_version:1,plan_id:'expansion:1',track_id:'sdaia-ai-engineer'};
 await s.put('expansion','expansion:1',record);
 assert.deepEqual(await s.get('expansion','expansion:1'),record);
 assert.equal(await s.put('expansion','expansion:1',structuredClone(record)),'expansion:1');
 await assert.rejects(()=>s.put('expansion','expansion:1',{...record,track_id:'changed'}),/immutable|different/i);
});

test('K2 governance file store isolates supported artifact kinds and lists IDs',async()=>{
 const {createK2GovernanceFileStore}=await import('../scripts/platform-kernel/adapters/k2GovernanceFileStore.js');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'k2-gov-'));const s=createK2GovernanceFileStore(root);
 for(const [kind,id] of [['expansion','e1'],['tranche','t1'],['activation','a1'],['improvement','i1']])await s.put(kind,id,{id,kind});
 assert.deepEqual(await s.list('tranche'),['t1']);
 await assert.rejects(()=>s.put('unknown','x',{}),/kind/i);
});
