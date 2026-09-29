import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const ajv=new Ajv({strict:false,allErrors:true,formats:{'date-time':true}});
const load=n=>JSON.parse(fs.readFileSync(new URL('../data/schema/'+n,import.meta.url),'utf8'));
const validate=n=>{ const schema=load(n); if(schema.$id) delete schema.$id; return ajv.compile(schema); };
const uuid='123e4567-e89b-42d3-a456-426614174000';
const uuid2='123e4567-e89b-42d3-a456-426614174001';

test('LearnerEvidenceEventV2 accepts canonical raw evidence and rejects derived truth',()=>{
 const v=validate('learner-evidence-event-v2.schema.json');
 const e={schema_version:2,event_id:uuid,definition_id:'learner.response.recorded@1',learner_id:'learner:p1',origin_id:uuid2,origin_seq:1,activity_id:uuid,track_id:'sdaia-ai-engineer',content_release_id:'sdaia-ai-engineer.bootstrap.v1',mode:'mock',locale:'ar',occurred_at:'2026-09-29T00:00:00Z',payload:{response_kind:'OPTION',response:1}};
 assert.equal(v(e),true,JSON.stringify(v.errors));
 assert.equal(v({...e,mastery:0.9}),false);
 assert.equal(v({...e,origin_seq:0}),false);
 assert.equal(v({...e,event_id:'not-a-uuid'}),false);
});

test('support contracts enforce dispositions, outbox states and lifecycle enums',()=>{
 const receipt=validate('evidence-storage-receipt-v1.schema.json');
 assert.equal(receipt({schema_version:1,store_id:'local',event_id:uuid,event_fingerprint:'a'.repeat(64),disposition:'ACCEPTED',accepted_at:'2026-09-29T00:00:00Z',store_seq:1,warnings:[]}),true,JSON.stringify(receipt.errors));
 assert.equal(receipt({schema_version:1,store_id:'local',event_id:uuid,event_fingerprint:'a'.repeat(64),disposition:'OVERWROTE',accepted_at:'2026-09-29T00:00:00Z',warnings:[]}),false);
 const outbox=validate('evidence-outbox-record-v1.schema.json');
 assert.equal(outbox({schema_version:1,event_id:uuid,state:'PENDING',attempt_count:0}),true,JSON.stringify(outbox.errors));
 assert.equal(outbox({schema_version:1,event_id:uuid,state:'DROPPED',attempt_count:0}),false);
 const link=validate('learner-identity-link-record-v1.schema.json');
 assert.equal(link({schema_version:1,identity_link_record_id:uuid,link_id:uuid,action:'LINK',source_learner_id:'learner:a',target_learner_id:'learner:b',effective_at:'2026-09-29T00:00:00Z',authority_ref:'auth:1',reason_code:'ACCOUNT_LINK',created_at:'2026-09-29T00:00:00Z'}),true,JSON.stringify(link.errors));
 const exp=validate('evidence-export-record-v1.schema.json');
 assert.equal(exp({schema_version:1,export_record_id:uuid,event_id:uuid,adapter_id:'xapi',adapter_version:'1',destination_class:'LRS',mapping_version:'1',action:'DELETE_REQUESTED',occurred_at:'2026-09-29T00:00:00Z',privacy_disposition:'ALLOW'}),true,JSON.stringify(exp.errors));
});

test('batch and projection schemas are versioned and closed',()=>{
 for(const name of ['evidence-batch-result-v1.schema.json','activity-projection-v1.schema.json','attempt-projection-v1.schema.json']){
   const s=load(name); assert.equal(s.additionalProperties,false,name); assert.ok(s.properties.schema_version,name);
 }
});
