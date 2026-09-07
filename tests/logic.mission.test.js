import test from 'node:test';
import assert from 'node:assert/strict';
import { rankSessions } from '../src/logic/mission.js';
const weights={High:20,Low:10};const questions=[{id:'q1',domain:'High'},{id:'q2',domain:'Low'}];
test('mission ranks high-weight low-mastery first',()=>{const out=rankSessions([{id:1,domain:'Low'},{id:2,domain:'High'}],weights,questions,{answer_map:{},mastered:{}});assert.equal(out[0].domain,'High')});
test('mission can prefer weaker lower-weight domain',()=>{const out=rankSessions([{id:1,domain:'High'},{id:2,domain:'Low'}],weights,questions,{answer_map:{},mastered:{q1:true}});assert.equal(out[0].domain,'Low')});
test('mission does not mutate input',()=>{const input=[{id:1,domain:'Low'},{id:2,domain:'High'}];rankSessions(input,weights,questions,{answer_map:{},mastered:{}});assert.equal(input[0].domain,'Low')});
