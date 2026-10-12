import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateK5ObjectiveMap} from '../src/mastery/objectiveMap.js';
const track='sdaia-ai-engineer';
const raw=JSON.parse(readFileSync(new URL('../data/evidence/sdaia-ai-engineer.objectives-v1.json',import.meta.url),'utf8'));
test('exact released objective mapping is provisionally accepted with pinned canonical SHA',async()=>{
 const r=await validateK5ObjectiveMap(raw,track);
 assert.equal(r.items.length,140);
 assert.ok(r.items.every(item=>item.mapping_status==='PROVISIONAL'));
 assert.equal(r.canonicalSha256,'6727666fa76c7ea66d35bb9c61232e523295e523ebc52ee0b49822af66ebf8bf');
});
test('typo and unapproved objective status never become APPROVED',async()=>{
 for(const status of ['provisionl','APPROVED','approved']){
  const changed=structuredClone(raw);
  changed.objectives[0].status=status;
  await assert.rejects(validateK5ObjectiveMap(changed,track),/status|approval|provisional|digest/i);
 }
});
test('offline map mutation keeping status provisional invalidates immutable digest',async()=>{
 const changed=structuredClone(raw);
 changed.objectives[0].domain_id='forged-domain';
 await assert.rejects(validateK5ObjectiveMap(changed,track),/digest|hash|mapping/i);
});
test('unknown track or missing objective rows fails closed',async()=>{
 await assert.rejects(validateK5ObjectiveMap(raw,'different-track'),/track/i);
 await assert.rejects(validateK5ObjectiveMap({schema_version:1,track_id:track,objectives:[]},track),/map|objective|digest/i);
});
