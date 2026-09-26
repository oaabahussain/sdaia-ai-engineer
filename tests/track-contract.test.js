import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadTrack } from '../scripts/load_track.js';
import { ACTIVE_TRACK_ID } from '../src/config.js';
const root=new URL('..',import.meta.url).pathname;
const expectedProfile=JSON.parse(fs.readFileSync(new URL('./fixtures/runtime/current-profile.expected.json',import.meta.url),'utf8'));
const expectedBank=JSON.parse(fs.readFileSync(new URL('./fixtures/runtime/current-bank-counts.expected.json',import.meta.url),'utf8'));
test('current track loads through one canonical manifest',()=>{const b=loadTrack(root,ACTIVE_TRACK_ID);assert.equal(b.manifest.id,ACTIVE_TRACK_ID);assert.equal(b.manifest.schema_version,1);assert.equal(b.examProfile.id,b.manifest.default_exam_profile);assert.equal(b.examProfile.question_count,expectedProfile.question_count);assert.equal(b.examProfile.evidence_status,expectedProfile.evidence_status);assert.deepEqual(b.examProfile.weights,expectedProfile.weights);assert.equal(Object.values(b.concepts).flat().length,expectedBank.concepts)});
test('manifest content references are repository-relative and loadable',()=>{const {manifest}=loadTrack(root,ACTIVE_TRACK_ID);assert.equal(manifest.content.concept_files.length,expectedBank.domains);assert.ok(manifest.exam_profiles.length>0)});

function activeFiles(dir){
 if(!fs.existsSync(dir))return[];
 const out=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,entry.name);
  if(entry.isDirectory())out.push(...activeFiles(p));
  else out.push(p);
 }
 return out;
}

test('active runtime and tooling contain no competing legacy bank references',()=>{
 const roots=['src','scripts','.github/workflows','server'].map(p=>path.join(root,p));
 const files=roots.flatMap(activeFiles).filter(p=>/\.(js|py|yml|yaml|html)$/.test(p)&&!p.endsWith(path.join('scripts','validate.js')));
 const forbidden=/(data\/questions\.json|data\/sessions\.json|(?:data\/)?weights\.json|src\/logic\/conceptFiles\.js|conceptFiles\.js)/;
 const hits=[];
 for(const file of files){
  fs.readFileSync(file,'utf8').split('\n').forEach((line,index)=>{
   if(forbidden.test(line))hits.push(`${path.relative(root,file)}:${index+1}: ${line.trim()}`);
  });
 }
 assert.deepEqual(hits,[]);
});
