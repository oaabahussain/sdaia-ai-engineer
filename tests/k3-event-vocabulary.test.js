import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const defsUrl=new URL('../data/evidence/event-definitions-v1.json',import.meta.url);
const expected=[
'learner.activity.started','learner.activity.completed','learner.assessment.submitted',
'learner.item.presented','learner.item.skipped','learner.response.recorded',
'learner.confidence.recorded','learner.hint.requested','learner.explanation.opened',
'learner.response.evaluated','learner.assessment.mutation.resolved','learner.evidence.correction.recorded'
];

test('K3 v1 vocabulary contains exactly the 12 required governed definitions',()=>{
 assert.equal(fs.existsSync(defsUrl),true);
 const defs=JSON.parse(fs.readFileSync(defsUrl,'utf8'));
 assert.deepEqual(defs.map(d=>d.event_name).sort(),expected.sort());
 for(const d of defs){
  assert.equal(d.schema_version,2); assert.equal(d.plane,'LEARNER_EVIDENCE');
  assert.ok(['LEARNER','SYSTEM','ADMINISTRATIVE'].includes(d.actor_kind));
  assert.ok(d.payload_schema_ref);
  for(const p of Object.values(d.properties)){
   assert.ok(p.privacy_class); assert.ok(p.export);
  }
 }
});

test('definition property names/types agree with payload schemas',()=>{
 const defs=JSON.parse(fs.readFileSync(defsUrl,'utf8'));
 for(const d of defs){
  const pUrl=new URL('../' + d.payload_schema_ref, import.meta.url); // repo root from tests
  const schema=JSON.parse(fs.readFileSync(pUrl,'utf8'));
  new Ajv({strict:false,allErrors:true,formats:{'date-time':true}}).compile(schema);
  assert.deepEqual(Object.keys(d.properties).sort(),Object.keys(schema.properties).sort(),d.event_name);
  for(const [name,g] of Object.entries(d.properties)){
   assert.equal(schema.properties[name].type,g.type,d.event_name+':'+name);
   assert.equal(schema.required.includes(name),g.required,d.event_name+':'+name);
  }
 }
});

test('authority-sensitive events require authority_ref context and generic pause/resume are absent',()=>{
 const defs=JSON.parse(fs.readFileSync(defsUrl,'utf8'));
 const byName=Object.fromEntries(defs.map(d=>[d.event_name,d]));
 for(const n of ['learner.response.evaluated','learner.assessment.mutation.resolved','learner.evidence.correction.recorded']){
   assert.ok(byName[n].required_context_fields.includes('authority_ref'),n);
   assert.notEqual(byName[n].actor_kind,'LEARNER',n);
 }
 assert.equal(byName['learner.activity.paused'],undefined);
 assert.equal(byName['learner.activity.resumed'],undefined);
});
