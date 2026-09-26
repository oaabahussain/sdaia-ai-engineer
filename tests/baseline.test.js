import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { expandConceptBank } from '../src/logic/questionBank.js';
import { loadConcepts } from '../scripts/load_concepts.js';
const root=new URL('..',import.meta.url).pathname;
const expected=JSON.parse(fs.readFileSync(new URL('./fixtures/runtime/current-bank-counts.expected.json',import.meta.url),'utf8'));
const questions=expandConceptBank(loadConcepts(root));
test('pre-migration runtime baseline is captured',()=>{assert.equal(questions.length,expected.rendered_questions);assert.equal(new Set(questions.map(q=>q.domain)).size,expected.domains)});
