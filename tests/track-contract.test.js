import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadTrack } from '../scripts/load_track.js';
const root=new URL('..',import.meta.url).pathname;
test('SDAIA track loads through one canonical manifest',()=>{const b=loadTrack(root,'sdaia-ai-engineer');assert.equal(b.manifest.id,'sdaia-ai-engineer');assert.equal(b.manifest.schema_version,1);assert.equal(b.examProfile.id,'sdaia-ai-engineer.project-reference.v1');assert.equal(b.examProfile.question_count,200);assert.equal(b.examProfile.evidence_status,'project-reference-unverified');assert.equal(Object.values(b.examProfile.weights).reduce((a,x)=>a+x,0),100);assert.equal(Object.values(b.concepts).flat().length,140)});
test('manifest content references are repository-relative and loadable',()=>{const {manifest}=loadTrack(root,'sdaia-ai-engineer');assert.equal(manifest.content.concept_files.length,7);assert.equal(manifest.default_exam_profile,'sdaia-ai-engineer.project-reference.v1')});


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
