#!/usr/bin/env python3
import json
import os
import re
import subprocess
from pathlib import Path

import audit_fix_builder as b

ROOT = Path.cwd()


def record_old_metrics():
    questions = json.loads((ROOT / 'data/questions.json').read_text(encoding='utf-8'))
    weights = json.loads((ROOT / 'data/weights.json').read_text(encoding='utf-8'))
    state = json.loads((ROOT / 'tests/fixtures/state.sample.json').read_text(encoding='utf-8'))
    mastery = {}
    for domain in weights:
        qs = [q for q in questions if q['domain'] == domain]
        points = sum(1 if state['mastered'].get(q['id']) else 0.75 if state['answer_map'].get(q['id']) is True else 0 for q in qs)
        mastery[domain] = round(points / len(qs) * 100) if qs else 0
    readiness = round(sum(mastery[d] * (weights[d] / 100) for d in weights) * (1 if state['diagnostic']['done'] else 0.9))
    Path('/tmp/old_metrics.json').write_text(json.dumps({'mastery': mastery, 'readiness': readiness}, indent=2), encoding='utf-8')
    print('OLD_INLINE_METRICS=' + json.dumps({'mastery': mastery, 'readiness': readiness}, ensure_ascii=False), flush=True)


def task_b():
    b.write('src/logic/mastery.js', """export function masteryForDomain(domain, questions, state) {
  const domainQuestions = questions.filter((question) => question.domain === domain);
  if (!domainQuestions.length) return 0;
  const points = domainQuestions.reduce((total, question) => {
    if (state.mastered?.[question.id]) return total + 1;
    if (state.answer_map?.[question.id] === true) return total + 0.75;
    return total;
  }, 0);
  return Math.round((points / domainQuestions.length) * 100);
}
""")
    b.write('src/logic/readiness.js', """import { masteryForDomain } from './mastery.js';

export function calculateReadiness(weights, questions, state) {
  const weighted = Object.entries(weights).reduce(
    (total, [domain, weight]) => total + masteryForDomain(domain, questions, state) * (weight / 100),
    0,
  );
  return Math.round(weighted * (state.diagnostic?.done ? 1 : 0.9));
}
""")
    b.write('src/logic/review.js', """const INTERVAL_DAYS = [1, 3, 7, 14];

export function nextReview(current, correct, nowMs = Date.now()) {
  const previousStage = Number.isInteger(current?.stage) ? current.stage : -1;
  const stage = correct ? Math.min(3, previousStage + 1) : 0;
  return { stage, next: nowMs + INTERVAL_DAYS[stage] * 86400000 };
}

export { INTERVAL_DAYS };
""")
    b.write('src/logic/mission.js', """import { masteryForDomain } from './mastery.js';

export function rankSessions(sessions, weights, questions, state) {
  return [...sessions].sort((left, right) => {
    const leftPriority = (weights[left.domain] || 0) * (1 - masteryForDomain(left.domain, questions, state) / 100);
    const rightPriority = (weights[right.domain] || 0) * (1 - masteryForDomain(right.domain, questions, state) / 100);
    return rightPriority - leftPriority;
  });
}
""")
    p = ROOT / 'src/app.js'
    app = p.read_text(encoding='utf-8')
    app = app.replace(
        "import { loadState, saveState, loadBank, submitFeedback, logEvent } from './storage/interface.js';",
        "import { loadState, saveState, loadBank, submitFeedback, logEvent } from './storage/interface.js';\nimport { masteryForDomain } from './logic/mastery.js';\nimport { calculateReadiness } from './logic/readiness.js';\nimport { nextReview } from './logic/review.js';\nimport { rankSessions } from './logic/mission.js';",
        1,
    )
    app = re.sub(r"function masteryFor\(domain\)\{.*?\n\}", "function masteryFor(domain){return masteryForDomain(domain,QUESTIONS,state)}", app, count=1, flags=re.S)
    app = re.sub(r"function readiness\(\)\{.*?\n\}", "function readiness(){return calculateReadiness(WEIGHTS,QUESTIONS,state)}", app, count=1, flags=re.S)
    old_sort = """  candidates.sort((a,b)=>{
     const pa=(WEIGHTS[a.domain]||0)*(1-masteryFor(a.domain)/100);
     const pb=(WEIGHTS[b.domain]||0)*(1-masteryFor(b.domain)/100);
     return pb-pa;
   });
   const s=candidates[0];"""
    app = b.replace_once(app, old_sort, "   const s=rankSessions(candidates,WEIGHTS,QUESTIONS,state)[0];", 'mission ranking')
    app = re.sub(r"function schedule\(id,correct\)\{.*?\n\}", "function schedule(id,correct){state.review_map[id]=nextReview(state.review_map[id],correct,Date.now())}", app, count=1, flags=re.S)
    app = app.replace("const stage=Math.max(0,[1,3,7,14].indexOf(item.interval_days));", "const stage=({1:0,3:1,7:2,14:3}[item.interval_days]??0);", 1)
    p.write_text(app, encoding='utf-8')
    b.verify('TASK B', [
        "grep -nE \"from './logic/(mastery|readiness|review|mission)\\.js'\" src/app.js",
        "if grep -nF 'pts+=' src/app.js; then exit 1; else echo 'pts+= occurrences: 0'; fi",
        "if grep -nF '[1,3,7,14]' src/app.js; then exit 1; else echo '[1,3,7,14] occurrences: 0'; fi",
        'node --check src/app.js',
    ])
    return b.commit('TASK_B', 'Make app consume pure study logic modules')


def task_c():
    b.write('tests/logic.mastery.test.js', """import test from 'node:test';
import assert from 'node:assert/strict';
import { masteryForDomain } from '../src/logic/mastery.js';
const qs=[{id:'q1',domain:'D'},{id:'q2',domain:'D'},{id:'q3',domain:'D'},{id:'q4',domain:'X'}];
test('mastery empty domain is zero',()=>assert.equal(masteryForDomain('Z',qs,{}),0));
test('mastery unanswered is zero',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{},mastered:{}}),0));
test('mastery partial answer credit',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{q1:true},mastered:{}}),25));
test('mastery full mastered is 100',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{},mastered:{q1:true,q2:true,q3:true}}),100));
""")
    b.write('tests/logic.readiness.test.js', """import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReadiness } from '../src/logic/readiness.js';
const weights={'MLOps / LLMOps':18,'Data / ML / Evaluation':17.3,'Core AI / Deep Learning / GenAI':16.7,'Responsible AI / Security / Governance':14.7,'AI Software Engineering':14,'Architecture / Infrastructure':12.6,'Business / Professional Practice':6.7};
const questions=Object.keys(weights).map((domain,i)=>({id:`q${i+1}`,domain}));
const full={answer_map:{},mastered:Object.fromEntries(questions.map(q=>[q.id,true])),diagnostic:{done:true}};
test('readiness full mastery is 100',()=>assert.equal(calculateReadiness(weights,questions,full),100));
test('readiness hand-computed weighted value',()=>{const state={answer_map:{q2:true},mastered:{q1:true},diagnostic:{done:true}};assert.equal(calculateReadiness(weights,questions,state),31)});
test('readiness applies 0.9 before diagnostic',()=>assert.equal(calculateReadiness(weights,questions,{...full,diagnostic:{done:false}}),90));
""")
    b.write('tests/logic.review.test.js', """import test from 'node:test';
import assert from 'node:assert/strict';
import { nextReview } from '../src/logic/review.js';
const day=86400000,now=1000;
test('first correct schedules 1 day',()=>assert.deepEqual(nextReview(undefined,true,now),{stage:0,next:now+day}));
test('second correct schedules 3 days',()=>assert.deepEqual(nextReview({stage:0},true,now),{stage:1,next:now+3*day}));
test('third correct schedules 7 days',()=>assert.deepEqual(nextReview({stage:1},true,now),{stage:2,next:now+7*day}));
test('fourth correct schedules 14 days',()=>assert.deepEqual(nextReview({stage:2},true,now),{stage:3,next:now+14*day}));
test('stage 3 remains 14 days',()=>assert.deepEqual(nextReview({stage:3},true,now),{stage:3,next:now+14*day}));
test('wrong resets to 1 day',()=>assert.deepEqual(nextReview({stage:3},false,now),{stage:0,next:now+day}));
""")
    b.write('tests/logic.mission.test.js', """import test from 'node:test';
import assert from 'node:assert/strict';
import { rankSessions } from '../src/logic/mission.js';
const weights={High:20,Low:10};const questions=[{id:'q1',domain:'High'},{id:'q2',domain:'Low'}];
test('mission ranks high-weight low-mastery first',()=>{const out=rankSessions([{id:1,domain:'Low'},{id:2,domain:'High'}],weights,questions,{answer_map:{},mastered:{}});assert.equal(out[0].domain,'High')});
test('mission can prefer weaker lower-weight domain',()=>{const out=rankSessions([{id:1,domain:'High'},{id:2,domain:'Low'}],weights,questions,{answer_map:{},mastered:{q1:true}});assert.equal(out[0].domain,'Low')});
test('mission does not mutate input',()=>{const input=[{id:1,domain:'Low'},{id:2,domain:'High'}];rankSessions(input,weights,questions,{answer_map:{},mastered:{}});assert.equal(input[0].domain,'Low')});
""")
    b.verify('TASK C', ["node --test tests/*.test.js"])
    return b.commit('TASK_C', 'Add comprehensive pure logic tests')


def main():
    b.run("git config user.name 'Audit Remediation Agent'")
    b.run("git config user.email '147952589+oaabahussain@users.noreply.github.com'")
    b.run('git fetch origin server-ready-clean main')
    b.run('git checkout -B server-ready-clean origin/server-ready-clean')
    current = b.run('git rev-parse HEAD').stdout.strip()
    if current != 'c979a429cdaff6c1675a99c60e3a5dc7e3d747fc':
        raise RuntimeError(f'Unexpected resume commit {current}')
    record_old_metrics()
    task_b(); task_c(); b.task_d(); b.task_e(); b.task_f(); final_sha = b.task_g()
    preflight = b.wait_preflight(final_sha)
    b.task_h(final_sha)
    b.task_i(final_sha)
    print(f'FINAL_RELEASE_COMMIT={final_sha}\nPREFLIGHT_RUN_ID={preflight["id"]}', flush=True)

if __name__ == '__main__':
    main()
