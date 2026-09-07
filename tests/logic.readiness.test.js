import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReadiness } from '../src/logic/readiness.js';
const weights={'MLOps / LLMOps':18,'Data / ML / Evaluation':17.3,'Core AI / Deep Learning / GenAI':16.7,'Responsible AI / Security / Governance':14.7,'AI Software Engineering':14,'Architecture / Infrastructure':12.6,'Business / Professional Practice':6.7};
const questions=Object.keys(weights).map((domain,i)=>({id:`q${i+1}`,domain}));
const full={answer_map:{},mastered:Object.fromEntries(questions.map(q=>[q.id,true])),diagnostic:{done:true}};
test('readiness full mastery is 100',()=>assert.equal(calculateReadiness(weights,questions,full),100));
test('readiness hand-computed weighted value',()=>{const state={answer_map:{q2:true},mastered:{q1:true},diagnostic:{done:true}};assert.equal(calculateReadiness(weights,questions,state),31)});
test('readiness applies 0.9 before diagnostic',()=>assert.equal(calculateReadiness(weights,questions,{...full,diagnostic:{done:false}}),90));
