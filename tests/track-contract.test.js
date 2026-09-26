import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTrack } from '../scripts/load_track.js';
const root=new URL('..',import.meta.url).pathname;
test('SDAIA track loads through one canonical manifest',()=>{const b=loadTrack(root,'sdaia-ai-engineer');assert.equal(b.manifest.id,'sdaia-ai-engineer');assert.equal(b.manifest.schema_version,1);assert.equal(b.examProfile.id,'sdaia-ai-engineer.project-reference.v1');assert.equal(b.examProfile.question_count,200);assert.equal(b.examProfile.evidence_status,'project-reference-unverified');assert.equal(Object.values(b.examProfile.weights).reduce((a,x)=>a+x,0),100);assert.equal(Object.values(b.concepts).flat().length,140)});
test('manifest content references are repository-relative and loadable',()=>{const {manifest}=loadTrack(root,'sdaia-ai-engineer');assert.equal(manifest.content.concept_files.length,7);assert.equal(manifest.default_exam_profile,'sdaia-ai-engineer.project-reference.v1')});
