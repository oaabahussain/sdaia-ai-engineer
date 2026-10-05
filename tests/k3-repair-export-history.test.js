import test from 'node:test';
import assert from 'node:assert/strict';
import { createExportLedger } from '../src/platform-kernel/evidence/exportLedger.js';
import { uid } from './helpers/k3-repair-fixtures.js';
const time='2026-10-03T18:00:00Z';
const record=(n,action='EXPORTED',parent,extra={})=>({schema_version:1,export_record_id:uid(n),event_id:uid(1),adapter_id:'adapter:test',adapter_version:'1',destination_class:'TEST',mapping_version:'1',action,occurred_at:time,privacy_disposition:'ALLOW',...(parent?{predecessor_record_id:uid(parent)}:{}),...extra});
const root=record(10), req=record(11,'DELETE_REQUESTED',10), done=record(12,'DELETED',11);
const cases={
  orphan:[record(12,'DELETED',999)],
  missingRoot:[record(11,'DELETE_REQUESTED',999),done],
  rootHasParent:[record(10,'EXPORTED',999)],
  duplicate:[root,root],
  invalidTransition:[root,record(12,'DELETED',10)],
  changedIdentity:[root,req,{...done,event_id:uid(2)}],
  fork:[root,req,record(13,'DELETE_REQUESTED',10)],
  cycle:[record(11,'DELETE_REQUESTED',12),record(12,'DELETION_FAILED',11)]
};
for (const [name,rows] of Object.entries(cases)) test(`F09 rejects persisted ${name} on read, propagation and append`,async()=>{
  let writes=0,calls=0;
  const api=createExportLedger({load:async()=>structuredClone(rows),append:async()=>{writes++;},destinationPolicy:{deletion_support:'SUPPORTED'}});
  await assert.rejects(()=>api.read(),/export|predecessor/i);
  await assert.rejects(()=>api.propagateDeletion(rows.at(-1).export_record_id,{occurred_at:time,deleteRemote:async()=>{calls++;return true;}}),/export|predecessor/i);
  await assert.rejects(()=>api.append(record(90)),/export|predecessor/i);
  assert.equal(writes,0);assert.equal(calls,0);
});
test('F09 valid failed deletion history resumes without using wall clock as order',async()=>{
  const rows=[root,req,record(12,'DELETION_FAILED',11,{occurred_at:'2026-10-01T00:00:00Z'})];
  const api=createExportLedger({load:async()=>structuredClone(rows),append:async r=>rows.push(r),destinationPolicy:{deletion_support:'SUPPORTED'}});
  const result=await api.propagateDeletion(root.export_record_id,{occurred_at:time,deleteRemote:async()=>true});
  assert.equal(result.action,'DELETED');assert.equal(rows.length,5);assert.deepEqual((await api.read())[0],root);
});
