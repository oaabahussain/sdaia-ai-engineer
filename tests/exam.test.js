import test from 'node:test';
import assert from 'node:assert/strict';
import { expandConceptBank } from '../src/logic/questionBank.js';
import { weightedAllocation, sampleWeightedExam, sampleSectionExam, buildOptionOrders, scoreExam } from '../src/logic/exam.js';
import { loadTrack } from '../scripts/load_track.js';

const root=new URL('..',import.meta.url).pathname;
const { examProfile, concepts }=loadTrack(root,'sdaia-ai-engineer');
const questions=expandConceptBank(concepts,{trackId:'sdaia-ai-engineer'});
const total=examProfile.question_count;
const weights=examProfile.weights;

test('current compatibility profile still defines a 200-question full exam',()=>{assert.equal(total,200)});
test('profile-driven weighted allocation is exact',()=>{assert.deepEqual(weightedAllocation(weights,total),{'MLOps / LLMOps':36,'Data / ML / Evaluation':35,'Core AI / Deep Learning / GenAI':33,'Responsible AI / Security / Governance':29,'AI Software Engineering':28,'Architecture / Infrastructure':25,'Business / Professional Practice':14})});
test('full exam follows profile count and weighted domains',()=>{const exam=sampleWeightedExam(questions,weights,total,()=>.42);assert.equal(exam.length,total);assert.equal(new Set(exam.map(q=>q.id)).size,total);const a={};exam.forEach(q=>a[q.domain]=(a[q.domain]||0)+1);assert.deepEqual(a,weightedAllocation(weights,total))});
test('full exam requires an explicit positive integer total',()=>{assert.throws(()=>sampleWeightedExam(questions,weights),/Exam total must be a positive integer/);assert.throws(()=>sampleWeightedExam(questions,weights,0),/Exam total must be a positive integer/)});
test('section exam stays inside requested domain',()=>{const d='MLOps / LLMOps';const exam=sampleSectionExam(questions,d,50,()=>.33);assert.equal(exam.length,50);assert.ok(exam.every(q=>q.domain===d))});
test('option orders are permutations',()=>{const o=buildOptionOrders(questions.slice(0,100),()=>.37);for(const q of questions.slice(0,100))assert.deepEqual([...o[q.id]].sort(),[0,1,2,3])});
test('displayed correct-answer positions stay generally balanced for the profile-sized exam',()=>{const exam=sampleWeightedExam(questions,weights,total,()=>.42);let seed=123456789;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};const orders=buildOptionOrders(exam,rng);const counts=[0,0,0,0];for(const q of exam){const display=orders[q.id].indexOf(q.answer);counts[display]++}assert.ok(Math.max(...counts)-Math.min(...counts)<=1,counts.join(','))});
test('confidence is not required by scoring',()=>{const exam=questions.slice(0,3),answers={[exam[0].id]:exam[0].answer,[exam[1].id]:exam[1].answer};const s=scoreExam(exam,answers);assert.equal(s.correct,2);assert.equal(s.unanswered,1)});
