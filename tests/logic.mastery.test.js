import test from 'node:test';
import assert from 'node:assert/strict';
import { masteryForDomain } from '../src/logic/mastery.js';
const qs=[{id:'q1',domain:'D'},{id:'q2',domain:'D'},{id:'q3',domain:'D'},{id:'q4',domain:'X'}];
test('mastery empty domain is zero',()=>assert.equal(masteryForDomain('Z',qs,{}),0));
test('mastery unanswered is zero',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{},mastered:{}}),0));
test('mastery partial answer credit',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{q1:true},mastered:{}}),25));
test('mastery full mastered is 100',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{},mastered:{q1:true,q2:true,q3:true}}),100));
