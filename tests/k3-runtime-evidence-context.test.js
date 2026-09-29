import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';
import {loadRuntimeBundle} from '../src/content/runtimeBundle.js';

const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));

test('SDAIA track declares K3 capability and stable evidence context',async()=>{
 const manifest=read('tracks/sdaia-ai-engineer/manifest.json');
 assert.ok(manifest.capabilities.includes('learner-evidence-v2'));
 assert.ok(manifest.evidence);
 const fetchJson=async p=>read(p.replace(/^\.\//,''));
 const bundle=await loadRuntimeBundle(fetchJson,'sdaia-ai-engineer');
 assert.equal(bundle.contract_version,4);
 assert.equal(bundle.evidence.content_release_id,'sdaia-ai-engineer.bootstrap.v1');
 assert.equal(bundle.evidence.scoring_policy_ref,'sdaia-ai-engineer.scoring.v1');
 assert.equal(bundle.evidence.event_definitions_ref,'data/evidence/event-definitions-v1.json');
 assert.equal(bundle.exam_profile.question_count,200);
});

test('RuntimeBundleV4 validates and carries the protected payload digest',async()=>{
 const schema=read('data/schema/runtime-bundle-v4.schema.json');
 const ajv=new Ajv({strict:false,allErrors:true});
 delete schema.$id;
 for(const name of ['track-manifest.schema.json','exam-profile-v2.schema.json','domain-catalog-v2.schema.json','runtime-evidence-context-v1.schema.json']){
   const s=read('data/schema/'+name); ajv.addSchema(s,name);
 }
 const validate=ajv.compile(schema);
 const fetchJson=async p=>read(p.replace(/^\.\//,''));
 const bundle=await loadRuntimeBundle(fetchJson,'sdaia-ai-engineer');
 assert.equal(validate(bundle),true,JSON.stringify(validate.errors));
 assert.match(bundle.evidence.question_payload_sha256,/^[0-9a-f]{64}$/);
});

test('scoring policy records current scoreExam semantics',()=>{
 const p=read('data/evidence/sdaia-ai-engineer.scoring-v1.json');
 assert.equal(p.schema_version,1);
 assert.equal(p.id,'sdaia-ai-engineer.scoring.v1');
 assert.equal(p.correctness_rule,'selected_option_index_equals_item_answer_index');
 assert.equal(p.percent_rule,'round(correct / total * 1000) / 10');
 assert.equal(p.unanswered_rule,'total - answered');
});
