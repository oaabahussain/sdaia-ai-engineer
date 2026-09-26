import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { expandConceptBank } from '../src/logic/questionBank.js';
import { weightedAllocation, sampleWeightedExam, sampleSectionExam, buildOptionOrders, scoreExam } from '../src/logic/exam.js';
import { loadTrack } from '../scripts/load_track.js';
import { ACTIVE_TRACK_ID } from '../src/config.js';

const root=new URL('..',import.meta.url).pathname;
const expectedProfile=JSON.parse(fs.readFileSync(new URL('./fixtures/runtime/current-profile.expected.json',import.meta.url),'utf8'));
const { examProfile, concepts }=loadTrack(root,ACTIVE_TRACK_ID);
const questions=expandConceptBank(concepts,{trackId:ACTIVE_TRACK_ID});
const total=examProfile.question_count;
const weights=examProfile.weights;

test('current compatibility profile matches the versioned fixture',()=>{assert.equal(total,expectedProfile.question_count);assert.deepEqual(examProfile.section_sizes,expectedProfile.section_sizes);assert.deepEqual(examProfile.weights,expectedProfile.weights)});
test('weighted allocation honors the requested total',()=>{assert.deepEqual(weightedAllocation({A:60,B:40},5),{A:3,B:2})});
test('full exam follows profile count and weighted domains',()=>{const exam=sampleWeightedExam(questions,weights,total,()=>.42);assert.equal(exam.length,total);assert.equal(new Set(exam.map(q=>q.id)).size,total);const a={};exam.forEach(q=>a[q.domain]=(a[q.domain]||0)+1);assert.deepEqual(a,weightedAllocation(weights,total))});
test('full exam requires an explicit positive integer total',()=>{assert.throws(()=>sampleWeightedExam(questions,weights),/Exam total must be a positive integer/);assert.throws(()=>sampleWeightedExam(questions,weights,0),/Exam total must be a positive integer/)});
test('section exam stays inside requested domain',()=>{const d=Object.keys(weights)[0];const size=examProfile.section_sizes.find(Number.isInteger);const exam=sampleSectionExam(questions,d,size,()=>.33);assert.equal(exam.length,size);assert.ok(exam.every(q=>q.domain===d))});
test('option orders are permutations',()=>{const subset=questions.slice(0,Math.min(100,questions.length));const o=buildOptionOrders(subset,()=>.37);for(const q of subset)assert.deepEqual([...o[q.id]].sort(),[0,1,2,3])});
test('displayed correct-answer positions stay generally balanced for the profile-sized exam',()=>{const exam=sampleWeightedExam(questions,weights,total,()=>.42);let seed=123456789;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};const orders=buildOptionOrders(exam,rng);const counts=[0,0,0,0];for(const q of exam){const display=orders[q.id].indexOf(q.answer);counts[display]++}assert.ok(Math.max(...counts)-Math.min(...counts)<=1,counts.join(','))});
test('confidence is not required by scoring',()=>{const exam=questions.slice(0,3),answers={[exam[0].id]:exam[0].answer,[exam[1].id]:exam[1].answer};const s=scoreExam(exam,answers);assert.equal(s.correct,2);assert.equal(s.unanswered,1)});
