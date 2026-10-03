import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function loadIdentity(){try{return await import('../src/platform-kernel/evidence/identityLinks.js')}catch{return {}}}
async function loadStore(){try{return await import('../scripts/platform-kernel/adapters/jsonlIdentityLinkStore.js')}catch{return {}}}

function rec(id,link,action,source,target,created,overrides={}){
  return {
    schema_version:1,
    identity_link_record_id:id,
    link_id:link,
    action,
    source_learner_id:source,
    target_learner_id:target,
    effective_at:created,
    authority_ref:'authority:test',
    reason_code:'ACCOUNT_LINK',
    created_at:created,
    ...overrides
  };
}

test('LINK chain resolves to final pseudonymous principal without mutating records',async()=>{
 const {resolveLearnerPrincipal}=await loadIdentity();assert.equal(typeof resolveLearnerPrincipal,'function','resolveLearnerPrincipal behavior is missing');
 const records=[
  rec('10000000-0000-4000-8000-000000000001','link-1','LINK','learner:a','learner:b','2026-10-03T10:00:00Z'),
  rec('10000000-0000-4000-8000-000000000002','link-2','LINK','learner:b','learner:c','2026-10-03T10:01:00Z')
 ];
 const before=structuredClone(records);
 assert.deepEqual(resolveLearnerPrincipal('learner:a',records),{principal:'learner:c',chain:['learner:a','learner:b','learner:c'],status:'LINKED'});
 assert.deepEqual(records,before);
});

test('UNLINK deactivates its predecessor link append-only',async()=>{
 const {resolveLearnerPrincipal}=await loadIdentity();assert.equal(typeof resolveLearnerPrincipal,'function','resolveLearnerPrincipal behavior is missing');
 const link=rec('10000000-0000-4000-8000-000000000001','link-1','LINK','learner:a','learner:b','2026-10-03T10:00:00Z');
 const unlink=rec('10000000-0000-4000-8000-000000000002','link-1','UNLINK','learner:a','learner:b','2026-10-03T10:02:00Z',{predecessor_record_id:link.identity_link_record_id,reason_code:'ACCOUNT_UNLINK'});
 assert.deepEqual(resolveLearnerPrincipal('learner:a',[link,unlink]),{principal:'learner:a',chain:['learner:a'],status:'UNLINKED'});
});

test('conflicting active links and cycles fail closed',async()=>{
 const {resolveLearnerPrincipal}=await loadIdentity();assert.equal(typeof resolveLearnerPrincipal,'function','resolveLearnerPrincipal behavior is missing');
 const conflict=[
  rec('10000000-0000-4000-8000-000000000001','link-1','LINK','learner:a','learner:b','2026-10-03T10:00:00Z'),
  rec('10000000-0000-4000-8000-000000000002','link-2','LINK','learner:a','learner:c','2026-10-03T10:01:00Z')
 ];
 assert.deepEqual(resolveLearnerPrincipal('learner:a',conflict),{principal:null,chain:['learner:a'],status:'CONFLICT'});
 const cycle=[
  rec('10000000-0000-4000-8000-000000000003','link-3','LINK','learner:a','learner:b','2026-10-03T10:00:00Z'),
  rec('10000000-0000-4000-8000-000000000004','link-4','LINK','learner:b','learner:a','2026-10-03T10:01:00Z')
 ];
 assert.deepEqual(resolveLearnerPrincipal('learner:a',cycle),{principal:null,chain:['learner:a','learner:b','learner:a'],status:'CYCLE'});
});

test('identity resolver rejects direct-PII principals',async()=>{
 const {resolveLearnerPrincipal}=await loadIdentity();assert.equal(typeof resolveLearnerPrincipal,'function','resolveLearnerPrincipal behavior is missing');
 assert.throws(()=>resolveLearnerPrincipal('person@example.com',[]),/pseudonymous|PII/i);
});

test('JSONL identity-link store is append-only, idempotent on exact retry, and conflict-safe',async()=>{
 const {createJsonlIdentityLinkStore}=await loadStore();assert.equal(typeof createJsonlIdentityLinkStore,'function','JSONL identity link store behavior is missing');
 const dir=await mkdtemp(join(tmpdir(),'k3-links-'));const file=join(dir,'links.jsonl');const store=createJsonlIdentityLinkStore(file);
 const record=rec('10000000-0000-4000-8000-000000000001','link-1','LINK','learner:a','learner:b','2026-10-03T10:00:00Z');
 assert.equal((await store.append(record)).disposition,'ACCEPTED');
 assert.equal((await store.append(record)).disposition,'DUPLICATE');
 await assert.rejects(()=>store.append({...record,target_learner_id:'learner:c'}),/conflict/i);
 assert.deepEqual(await store.readAll(),[record]);
 assert.equal((await readFile(file,'utf8')).trim().split('\n').length,1);
});


test('identity-link records reject raw IP principals as direct PII',async()=>{
 const {assertIdentityLinkRecord}=await loadIdentity();
 const record=rec('10000000-0000-4000-8000-000000000009','link-ip','LINK','192.0.2.55','learner:b','2026-10-03T10:05:00Z');
 assert.throws(()=>assertIdentityLinkRecord(record),/pseudonymous|PII/i);
});
