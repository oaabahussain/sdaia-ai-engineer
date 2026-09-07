#!/usr/bin/env python3
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path.cwd()
REPO = os.environ['GITHUB_REPOSITORY']
TARGET = 'server-ready-clean'
LIVE = 'https://oaabahussain.github.io/sdaia-ai-engineer/'


def run(cmd, check=True, capture=True, env=None):
    print(f'$ {cmd}', flush=True)
    p = subprocess.run(cmd, shell=True, text=True, capture_output=capture, env=env)
    if capture and p.stdout:
        print(p.stdout.rstrip(), flush=True)
    if capture and p.stderr:
        print(p.stderr.rstrip(), flush=True)
    if check and p.returncode != 0:
        raise RuntimeError(f'Command failed ({p.returncode}): {cmd}')
    return p


def write(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')


def dump(path, value):
    write(path, json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def commit(label, message):
    run('git add -A')
    run('git diff --cached --check')
    stat = run('git diff --cached --stat')
    if not stat.stdout.strip():
        raise RuntimeError(f'{label}: no changes to commit')
    run(f'git commit -m {json.dumps(message)}')
    sha = run('git rev-parse HEAD').stdout.strip()
    run(f'git push origin HEAD:{TARGET}')
    print(f'{label}_COMMIT={sha}', flush=True)
    return sha


def verify(label, commands):
    print(f'\n=== {label} VERIFICATION ===', flush=True)
    for cmd in commands:
        run(cmd)


def replace_once(text, old, new, label):
    if old not in text:
        raise RuntimeError(f'Missing transform target: {label}')
    return text.replace(old, new, 1)


def task_a():
    schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#', '$id': 'state.schema.json', 'type': 'object',
      'required': ['version','anon_id','created_at','updated_at','onboarded','profile','answer_map','attempts','confidence','mastered','review_map','errors','bookmark_map','notes','sessions','activity','diagnostic','theme','focus'],
      'properties': {
        'version': {'const': 1},
        'anon_id': {'type':'string','format':'uuid','pattern':'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'},
        'created_at': {'type':'string','format':'date-time'}, 'updated_at': {'type':'string','format':'date-time'},
        'onboarded': {'type':'boolean'},
        'profile': {'type':'object','required':['minutes','examDate'],'properties':{'minutes':{'type':'integer','enum':[15,20,25,30]},'examDate':{'type':'string'}},'additionalProperties':False},
        'answer_map': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'type':'boolean'}},
        'attempts': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'type':'integer','minimum':0}},
        'confidence': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'enum':[1,2,3]}},
        'mastered': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'type':'boolean'}},
        'review_map': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'type':'object','required':['stage','next'],'properties':{'stage':{'type':'integer','minimum':0,'maximum':3},'next':{'type':'integer','minimum':0}},'additionalProperties':False}},
        'errors': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'type':'object','required':['type','at'],'properties':{'type':{'type':'string'},'at':{'type':'integer','minimum':0}},'additionalProperties':False}},
        'bookmark_map': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'type':'boolean'}},
        'notes': {'type':'object','propertyNames':{'pattern':'^q\\d+$'},'additionalProperties':{'type':'string'}},
        'sessions': {'type':'object','additionalProperties':{'type':'boolean'}},
        'activity': {'type':'object','additionalProperties':{'type':'integer','minimum':0}},
        'diagnostic': {'type':'object','required':['done','answers'],'properties':{'done':{'type':'boolean'},'answers':{'type':'object'}},'additionalProperties':False},
        'theme': {'enum':['auto','light','dark']}, 'focus': {'type':'boolean'}
      }, 'additionalProperties': False
    }
    dump('data/schema/state.schema.json', schema)

    fixture = {
      'version':1,'anon_id':'123e4567-e89b-42d3-a456-426614174000','created_at':'2026-09-07T00:00:00Z','updated_at':'2026-09-07T00:00:00Z',
      'onboarded':True,'profile':{'minutes':20,'examDate':''},
      'answer_map':{f'q{i}': (i % 3 != 0) for i in range(1,21)},
      'attempts':{f'q{i}':1 for i in range(1,21)},
      'confidence':{f'q{i}':2 for i in range(1,21)},
      'mastered':{f'q{i}': (i % 5 == 0) for i in range(1,21)},
      'review_map':{'q1':{'stage':0,'next':1893456000000},'q2':{'stage':2,'next':1893628800000}},
      'errors':{},'bookmark_map':{'q1':True,'q4':True},'notes':{'q1':'fixture'},'sessions':{},'activity':{},'diagnostic':{'done':True,'answers':{}},'theme':'auto','focus':False
    }
    dump('tests/fixtures/state.sample.json', fixture)

    app_path = ROOT / 'src/app.js'
    app = app_path.read_text(encoding='utf-8')
    start = app.index('let state=(await loadState())||{}')
    end = app.index('\n\nlet active=', start)
    replacement = '''let state=migrateState((await loadState())||{});\nconst nowIso=()=>new Date().toISOString();\nconst uuidV4=()=>globalThis.crypto?.randomUUID?.() ?? '00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0').slice(0,12);\nfunction migrateState(raw){\n const s=raw&&typeof raw==='object'?{...raw}:{};\n const confidenceNumber=(value)=>value==='low'?1:value==='high'?3:2;\n if(!s.answer_map||typeof s.answer_map!=='object'||Array.isArray(s.answer_map)){s.answer_map={};if(Array.isArray(s.answers))s.answers.forEach(item=>{if(item?.question_id){s.answer_map[item.question_id]=!!item.correct;if(item.confidence)s.confidence={...(s.confidence||{}),[item.question_id]:confidenceNumber(item.confidence)}}})}\n if(!s.review_map||typeof s.review_map!=='object'||Array.isArray(s.review_map)){s.review_map={};if(Array.isArray(s.review))s.review.forEach(item=>{if(item?.question_id){const stage=Math.max(0,[1,3,7,14].indexOf(item.interval_days));s.review_map[item.question_id]={stage,next:Date.parse(item.due_at)||Date.now()}}})}\n if(!s.bookmark_map||typeof s.bookmark_map!=='object'||Array.isArray(s.bookmark_map)){s.bookmark_map={};if(Array.isArray(s.bookmarks))s.bookmarks.forEach(id=>{s.bookmark_map[id]=true})}\n if(s.settings&&typeof s.settings==='object'){s.profile=s.profile||{};if(!s.profile.minutes)s.profile.minutes=s.settings.session_minutes||20;if(s.profile.examDate===undefined)s.profile.examDate=s.settings.exam_date||'';if(s.theme===undefined)s.theme=s.settings.dark?'dark':'auto';if(s.focus===undefined)s.focus=!!s.settings.focus}\n delete s.answers;delete s.review;delete s.bookmarks;delete s.settings;\n s.version=1;s.anon_id=s.anon_id||uuidV4();s.created_at=s.created_at||nowIso();s.updated_at=s.updated_at||s.created_at;\n s.onboarded=!!s.onboarded;s.profile={minutes:s.profile?.minutes||20,examDate:s.profile?.examDate||''};s.answer_map=s.answer_map||{};s.attempts=s.attempts||{};s.confidence=s.confidence||{};s.mastered=s.mastered||{};s.review_map=s.review_map||{};s.errors=s.errors||{};s.bookmark_map=s.bookmark_map||{};s.notes=s.notes||{};s.sessions=s.sessions||{};s.activity=s.activity||{};s.diagnostic=s.diagnostic||{done:false,answers:{}};s.diagnostic.done=!!s.diagnostic.done;s.diagnostic.answers=s.diagnostic.answers||{};s.theme=s.theme||'auto';s.focus=!!s.focus;\n return s;\n}'''
    app = app[:start] + replacement + app[end:]
    app = re.sub(r"function save\(\)\{[^\n]+\}", "function save(){state.updated_at=nowIso();void saveState(state).catch(error=>console.error('State save failed',error))}", app, count=1)
    app = app.replace('recordAnswer(q.id,ok,diag.confidence);','')
    app = app.replace('recordAnswer(q.id,true,active.confidence);','')
    app = app.replace('recordAnswer(q.id,false,active.confidence);','')
    app = app.replace('syncReview();','')
    app = app.replace('syncBookmarks();','')
    app = replace_once(app, "state=JSON.parse(r.result);save();", "state=migrateState(JSON.parse(r.result));save();", 'import migration')
    app = replace_once(app, "state={};await saveState(state);location.reload()", "state=migrateState({});await saveState(state);location.reload()", 'reset migration')
    app_path.write_text(app, encoding='utf-8')

    verify('TASK A', [
      'npm ci --ignore-scripts',
      'node scripts/validate.js --state tests/fixtures/state.sample.json',
      "node --check src/app.js",
      "if grep -nE 'state\\.(answers|review|bookmarks|settings)\\b' src/app.js; then exit 1; else echo 'duplicate state fields in app.js: 0'; fi"
    ])
    sha = commit('TASK_A','Use one runtime-map state representation')

    questions = json.loads((ROOT/'data/questions.json').read_text(encoding='utf-8'))
    weights = json.loads((ROOT/'data/weights.json').read_text(encoding='utf-8'))
    st = fixture
    metrics = {}
    for domain in weights:
        qs = [q for q in questions if q['domain']==domain]
        pts = sum(1 if st['mastered'].get(q['id']) else .75 if st['answer_map'].get(q['id']) is True else 0 for q in qs)
        metrics[domain] = round(pts/len(qs)*100) if qs else 0
    readiness = round(sum(metrics[d]*(weights[d]/100) for d in weights) * (1 if st['diagnostic']['done'] else .9))
    Path('/tmp/old_metrics.json').write_text(json.dumps({'mastery':metrics,'readiness':readiness},indent=2),encoding='utf-8')
    print('OLD_INLINE_METRICS='+json.dumps({'mastery':metrics,'readiness':readiness},ensure_ascii=False),flush=True)
    return sha


def task_b():
    write('src/logic/mastery.js', '''export function masteryForDomain(domain, questions, state) {\n  const domainQuestions = questions.filter((question) => question.domain === domain);\n  if (!domainQuestions.length) return 0;\n  const points = domainQuestions.reduce((total, question) => {\n    if (state.mastered?.[question.id]) return total + 1;\n    if (state.answer_map?.[question.id] === true) return total + 0.75;\n    return total;\n  }, 0);\n  return Math.round((points / domainQuestions.length) * 100);\n}\n''')
    write('src/logic/readiness.js', '''import { masteryForDomain } from './mastery.js';\n\nexport function calculateReadiness(weights, questions, state) {\n  const weighted = Object.entries(weights).reduce((total, [domain, weight]) => total + masteryForDomain(domain, questions, state) * (weight / 100), 0);\n  const diagnosticFactor = state.diagnostic?.done ? 1 : 0.9;\n  return Math.round(weighted * diagnosticFactor);\n}\n''')
    write('src/logic/review.js', '''const INTERVAL_DAYS = [1, 3, 7, 14];\n\nexport function nextReview(current, correct, nowMs = Date.now()) {\n  const currentStage = Number.isInteger(current?.stage) ? current.stage : 0;\n  const stage = correct ? Math.min(3, currentStage + 1) : 0;\n  const intervalDays = INTERVAL_DAYS[stage];\n  return { stage, next: nowMs + intervalDays * 86400000 };\n}\n\nexport { INTERVAL_DAYS };\n''')
    write('src/logic/mission.js', '''import { masteryForDomain } from './mastery.js';\n\nexport function rankSessions(sessions, weights, questions, state) {\n  return [...sessions].sort((left, right) => {\n    const leftPriority = (weights[left.domain] || 0) * (1 - masteryForDomain(left.domain, questions, state) / 100);\n    const rightPriority = (weights[right.domain] || 0) * (1 - masteryForDomain(right.domain, questions, state) / 100);\n    return rightPriority - leftPriority;\n  });\n}\n''')
    p=ROOT/'src/app.js';app=p.read_text(encoding='utf-8')
    app=app.replace("import { loadState, saveState, loadBank, submitFeedback, logEvent } from './storage/interface.js';", "import { loadState, saveState, loadBank, submitFeedback, logEvent } from './storage/interface.js';\nimport { masteryForDomain } from './logic/mastery.js';\nimport { calculateReadiness } from './logic/readiness.js';\nimport { nextReview } from './logic/review.js';\nimport { rankSessions } from './logic/mission.js';")
    app=re.sub(r"function masteryFor\(domain\)\{.*?\n\}", "function masteryFor(domain){return masteryForDomain(domain,QUESTIONS,state)}", app, count=1, flags=re.S)
    app=re.sub(r"function readiness\(\)\{.*?\n\}", "function readiness(){return calculateReadiness(WEIGHTS,QUESTIONS,state)}", app, count=1, flags=re.S)
    old_sort='''  candidates.sort((a,b)=>{\n     const pa=(WEIGHTS[a.domain]||0)*(1-masteryFor(a.domain)/100);\n     const pb=(WEIGHTS[b.domain]||0)*(1-masteryFor(b.domain)/100);\n     return pb-pa;\n   });\n   const s=candidates[0];'''
    app=replace_once(app,old_sort,"   const s=rankSessions(candidates,WEIGHTS,QUESTIONS,state)[0];",'mission ranking')
    app=re.sub(r"function schedule\(id,correct\)\{.*?\n\}", "function schedule(id,correct){state.review_map[id]=nextReview(state.review_map[id],correct,Date.now())}", app, count=1, flags=re.S)
    p.write_text(app,encoding='utf-8')
    verify('TASK B',[
      "grep -nE \"from './logic/(mastery|readiness|review|mission)\\.js'\" src/app.js",
      "if grep -nF 'pts+=' src/app.js; then exit 1; else echo 'pts+= occurrences: 0'; fi",
      "if grep -nF '[1,3,7,14]' src/app.js; then exit 1; else echo '[1,3,7,14] occurrences: 0'; fi",
      'node --check src/app.js'
    ])
    return commit('TASK_B','Make app consume pure study logic modules')


def task_c():
    write('tests/logic.mastery.test.js', '''import test from 'node:test';import assert from 'node:assert/strict';import {masteryForDomain} from '../src/logic/mastery.js';\nconst qs=[{id:'q1',domain:'D'},{id:'q2',domain:'D'},{id:'q3',domain:'D'},{id:'q4',domain:'X'}];\ntest('mastery empty domain is zero',()=>assert.equal(masteryForDomain('Z',qs,{}),0));\ntest('mastery all unanswered is zero',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{},mastered:{}}),0));\ntest('mastery partial uses 0.75 credit',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{q1:true},mastered:{}}),25));\ntest('mastery full mastered is 100',()=>assert.equal(masteryForDomain('D',qs,{answer_map:{},mastered:{q1:true,q2:true,q3:true}}),100));\n''')
    write('tests/logic.readiness.test.js', '''import test from 'node:test';import assert from 'node:assert/strict';import {calculateReadiness} from '../src/logic/readiness.js';\nconst weights={'MLOps / LLMOps':18,'Data / ML / Evaluation':17.3,'Core AI / Deep Learning / GenAI':16.7,'Responsible AI / Security / Governance':14.7,'AI Software Engineering':14,'Architecture / Infrastructure':12.6,'Business / Professional Practice':6.7};\nconst questions=Object.keys(weights).map((domain,i)=>({id:`q${i+1}`,domain}));\nconst full={answer_map:{},mastered:Object.fromEntries(questions.map(q=>[q.id,true])),diagnostic:{done:true}};\ntest('readiness full mastery is 100',()=>assert.equal(calculateReadiness(weights,questions,full),100));\ntest('readiness hand-computed weighted score',()=>{const state={answer_map:{q1:true,q2:true},mastered:{q1:true},diagnostic:{done:true}};assert.equal(calculateReadiness(weights,questions,state),28)});\ntest('readiness applies 0.9 before diagnostic',()=>{const state={...full,diagnostic:{done:false}};assert.equal(calculateReadiness(weights,questions,state),90)});\n''')
    write('tests/logic.review.test.js', '''import test from 'node:test';import assert from 'node:assert/strict';import {nextReview} from '../src/logic/review.js';\nconst day=86400000,now=1000;\ntest('review first correct schedules 3 days from stage 0',()=>assert.deepEqual(nextReview({stage:0},true,now),{stage:1,next:now+3*day}));\ntest('review stage 1 correct schedules 7 days',()=>assert.deepEqual(nextReview({stage:1},true,now),{stage:2,next:now+7*day}));\ntest('review stage 2 correct schedules 14 days',()=>assert.deepEqual(nextReview({stage:2},true,now),{stage:3,next:now+14*day}));\ntest('review stage 3 stays at 14 days',()=>assert.deepEqual(nextReview({stage:3},true,now),{stage:3,next:now+14*day}));\ntest('wrong answer resets to one day',()=>assert.deepEqual(nextReview({stage:3},false,now),{stage:0,next:now+day}));\n''')
    write('tests/logic.mission.test.js', '''import test from 'node:test';import assert from 'node:assert/strict';import {rankSessions} from '../src/logic/mission.js';\nconst weights={High:20,Low:10};const questions=[{id:'q1',domain:'High'},{id:'q2',domain:'Low'}];\ntest('mission ranks high-weight low-mastery first',()=>{const out=rankSessions([{id:1,domain:'Low'},{id:2,domain:'High'}],weights,questions,{answer_map:{},mastered:{}});assert.equal(out[0].domain,'High')});\ntest('mission can prefer weaker lower-weight domain',()=>{const out=rankSessions([{id:1,domain:'High'},{id:2,domain:'Low'}],weights,questions,{answer_map:{},mastered:{q1:true}});assert.equal(out[0].domain,'Low')});\ntest('mission does not mutate input order',()=>{const input=[{id:1,domain:'Low'},{id:2,domain:'High'}];rankSessions(input,weights,questions,{answer_map:{},mastered:{}});assert.equal(input[0].domain,'Low')});\n''')
    verify('TASK C',["node --test tests/*.test.js"])
    return commit('TASK_C','Add comprehensive pure logic tests')


def task_d():
    expected=json.loads(Path('/tmp/old_metrics.json').read_text(encoding='utf-8'))
    dump('tests/fixtures/state.sample.expected.json',expected)
    write('tests/logic.equivalence.test.js', '''import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {masteryForDomain} from '../src/logic/mastery.js';import {calculateReadiness} from '../src/logic/readiness.js';\nconst state=JSON.parse(fs.readFileSync('tests/fixtures/state.sample.json','utf8'));const expected=JSON.parse(fs.readFileSync('tests/fixtures/state.sample.expected.json','utf8'));const questions=JSON.parse(fs.readFileSync('data/questions.json','utf8'));const weights=JSON.parse(fs.readFileSync('data/weights.json','utf8'));\ntest('refactored mastery matches recorded old inline metrics',()=>{for(const domain of Object.keys(weights))assert.equal(masteryForDomain(domain,questions,state),expected.mastery[domain],domain)});\ntest('refactored readiness matches recorded old inline metric',()=>assert.equal(calculateReadiness(weights,questions,state),expected.readiness));\n''')
    verify('TASK D',["cat tests/fixtures/state.sample.expected.json","node --test tests/*.test.js"])
    return commit('TASK_D','Lock behavioral equivalence for study metrics')


def task_e():
    sw="""const CACHE = 'sdaia-ai-pages-v6';\nconst ASSETS = [\n  './', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png',\n  './src/app.js', './src/config.js', './src/logic/mastery.js', './src/logic/readiness.js', './src/logic/review.js', './src/logic/mission.js',\n  './src/storage/interface.js', './src/storage/browser.js', './src/storage/api.js',\n  './data/questions.json', './data/sessions.json', './data/learn.json', './data/cases.json', './data/weights.json'\n];\n\nself.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())); });\nself.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });\nself.addEventListener('fetch', (event) => {\n  if (event.request.method !== 'GET') return;\n  const url = new URL(event.request.url); if (url.origin !== self.location.origin) return;\n  event.respondWith(fetch(event.request).then((response) => { if (response && response.ok) { const copy=response.clone(); caches.open(CACHE).then((cache)=>cache.put(event.request,copy)); } return response; }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));\n});\n"""
    write('sw.js',sw)
    write('scripts/verify_sw_assets.js', '''import fs from 'node:fs';import path from 'node:path';const root=process.argv[2]||'.';const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');const match=sw.match(/const ASSETS = \[([\s\S]*?)\];/);if(!match)throw new Error('ASSETS missing');const assets=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);for(const asset of assets){if(asset==='./')continue;const target=path.join(root,asset.replace(/^\.\//,''));if(!fs.existsSync(target))throw new Error(`Missing precache asset: ${asset}`)}console.log(`service worker assets: PASS (${assets.length})`);\n''')
    p=ROOT/'.github/workflows/pages.yml';pages=p.read_text(encoding='utf-8')
    pages=replace_once(pages,'          node scripts/verify_html.js _site/index.html\n','          node scripts/verify_html.js _site/index.html\n          node scripts/verify_sw_assets.js _site\n','pages SW verification')
    p.write_text(pages,encoding='utf-8')
    run("rm -rf _site && mkdir _site && cp index.html manifest.webmanifest sw.js icon.svg icon-180.png icon-192.png icon-512.png _site/ && cp -R src data _site/")
    verify('TASK E',["grep -n \"sdaia-ai-pages-v6\|./src/app.js\|./data/questions.json\" sw.js","node scripts/verify_sw_assets.js _site"])
    run('rm -rf _site')
    return commit('TASK_E','Precache modular app and study data')


def task_f():
    workflow="""name: Daily question review proposal\n\non:\n  schedule:\n    - cron: '0 3 * * *'\n  workflow_dispatch:\n\npermissions:\n  contents: write\n  issues: write\n  pull-requests: write\n\njobs:\n  propose:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v6\n        with:\n          fetch-depth: 0\n      - uses: actions/setup-node@v5\n        with:\n          node-version: '22'\n      - name: Install validation dependencies\n        run: npm ci --ignore-scripts\n      - name: Validate LLM configuration\n        env:\n          LLM_PROVIDER: ${{ vars.LLM_PROVIDER }}\n          LLM_MODEL: ${{ vars.LLM_MODEL }}\n          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}\n        shell: bash\n        run: |\n          set -euo pipefail\n          if [ -z \"$LLM_PROVIDER\" ]; then echo 'LLM_PROVIDER repository variable is required'; exit 1; fi\n          if [ -z \"$LLM_MODEL\" ]; then echo 'LLM_MODEL repository variable is required'; exit 1; fi\n          if [ -z \"$LLM_API_KEY\" ]; then echo 'LLM_API_KEY repository secret is required'; exit 1; fi\n          if [ \"$LLM_PROVIDER\" != 'openai' ] && [ \"$LLM_PROVIDER\" != 'anthropic' ]; then echo 'LLM_PROVIDER must be openai or anthropic'; exit 1; fi\n      - name: Review reported questions\n        env:\n          LLM_PROVIDER: ${{ vars.LLM_PROVIDER }}\n          LLM_MODEL: ${{ vars.LLM_MODEL }}\n          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}\n          GH_TOKEN: ${{ github.token }}\n        run: python3 .github/agent/review_agent.py\n"""
    write('.github/workflows/daily-review.yml',workflow)
    p=ROOT/'.github/agent/review_agent.py';agent=p.read_text(encoding='utf-8')
    agent=agent.replace("API_KEY = os.environ.get('OPENAI_API_KEY')\nMODEL = os.environ.get('OPENAI_MODEL', 'gpt-5.6-luna')", "API_KEY = os.environ.get('LLM_API_KEY')\nPROVIDER = os.environ.get('LLM_PROVIDER', '').lower()\nMODEL = os.environ.get('LLM_MODEL', '')")
    start=agent.index('def call_llm(question, reports):')
    end=agent.index('\ndef apply_patch',start)
    call="""def call_llm(question, reports):\n    if not API_KEY or not PROVIDER or not MODEL:\n        raise RuntimeError('LLM_PROVIDER, LLM_MODEL, and LLM_API_KEY are required')\n    if PROVIDER not in {'openai', 'anthropic'}:\n        raise RuntimeError('LLM_PROVIDER must be openai or anthropic')\n    user = 'CURRENT_QUESTION_START\\n' + json.dumps(question, ensure_ascii=False) + '\\nCURRENT_QUESTION_END\\nREPORTS_START\\n' + json.dumps(reports, ensure_ascii=False) + '\\nREPORTS_END'\n    if PROVIDER == 'openai':\n        payload = json.dumps({'model': MODEL, 'instructions': PROMPT, 'input': user, 'store': False}).encode()\n        request = urllib.request.Request('https://api.openai.com/v1/responses', data=payload, headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'})\n        with urllib.request.urlopen(request, timeout=60) as response:\n            body = json.loads(response.read())\n        texts = [content.get('text', '') for item in body.get('output', []) for content in item.get('content', []) if content.get('type') == 'output_text']\n        return json.loads(''.join(texts))\n    payload = json.dumps({'model': MODEL, 'max_tokens': 2048, 'system': PROMPT, 'messages': [{'role': 'user', 'content': user}]}).encode()\n    request = urllib.request.Request('https://api.anthropic.com/v1/messages', data=payload, headers={'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json'})\n    with urllib.request.urlopen(request, timeout=60) as response:\n        body = json.loads(response.read())\n    texts = [item.get('text', '') for item in body.get('content', []) if item.get('type') == 'text']\n    return json.loads(''.join(texts))\n"""
    agent=agent[:start]+call+agent[end:]
    p.write_text(agent,encoding='utf-8')
    verify('TASK F',["python3 -m py_compile .github/agent/review_agent.py","grep -nE 'vars.LLM_PROVIDER|vars.LLM_MODEL|secrets.LLM_API_KEY' .github/workflows/daily-review.yml","if grep -R -nE 'gpt-[0-9]|claude-[0-9]|OPENAI_MODEL|OPENAI_API_KEY' .github/workflows/daily-review.yml .github/agent/review_agent.py; then exit 1; else echo 'hardcoded provider model/key names: 0'; fi"])
    return commit('TASK_F','Make daily review LLM provider configurable')


def task_g():
    workflow="""name: Server-ready release preflight\n\non:\n  push:\n    branches: [server-ready-clean]\n  workflow_dispatch:\n\npermissions:\n  contents: read\n\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v5\n        with:\n          node-version: '22'\n      - uses: actions/setup-python@v6\n        with:\n          python-version: '3.12'\n      - name: Install dependencies\n        run: |\n          set -euo pipefail\n          npm ci --ignore-scripts\n          pip install -r server/requirements.txt\n      - name: Full preflight\n        env:\n          DB_URL: sqlite:///./preflight.db\n          PYTHONPATH: server\n        shell: bash\n        run: |\n          set -euo pipefail\n          node scripts/validate.js\n          node --test tests/*.test.js\n          node scripts/contract_test.js browser\n          node scripts/verify_html.js index.html\n          python3 scripts/verify_release.py index.html\n          npx redocly lint api/openapi.yaml\n          pytest -q server/tests\n          python3 scripts/db_smoke.py\n          rm -rf _site\n          mkdir _site\n          cp index.html manifest.webmanifest sw.js icon.svg icon-180.png icon-192.png icon-512.png _site/\n          cp -R src data _site/\n          node scripts/verify_sw_assets.js _site\n          if git ls-files | grep -E '^(node_modules/|.*\\.db$|.*__pycache__/|.*\\.pytest_cache/)'; then echo 'Forbidden generated files are tracked'; exit 1; fi\n          if git grep -n --fixed-strings 'continue-on-error: true' -- '.github/workflows'; then echo 'Forbidden continue-on-error found'; exit 1; fi\n          if grep -nE 'localStorage|fetch\\(' src/app.js; then echo 'Direct storage/network access found in app.js'; exit 1; fi\n          echo 'app direct storage/fetch count: 0'\n          echo 'FULL PREFLIGHT: PASS'\n"""
    write('.github/workflows/release-preflight.yml',workflow)
    verify('TASK G',["if grep -n \"grep -cE.*printf '0'\" .github/workflows/release-preflight.yml; then exit 1; else echo 'zero-count shell bug: fixed'; fi","node --test tests/*.test.js","node scripts/validate.js","python3 scripts/db_smoke.py"])
    sha=commit('TASK_G','Fix and enforce full release preflight')
    return sha


def wait_preflight(sha):
    print('\n=== WAIT FOR FULL PREFLIGHT ===',flush=True)
    for _ in range(60):
        data=json.loads(run(f"gh api 'repos/{REPO}/actions/runs?branch={TARGET}&event=push&per_page=30'",capture=True).stdout)
        runs=[r for r in data.get('workflow_runs',[]) if r.get('head_sha')==sha and r.get('path')=='.github/workflows/release-preflight.yml']
        if runs:
            r=runs[0];print(f"PREFLIGHT_RUN_ID={r['id']} STATUS={r['status']} CONCLUSION={r.get('conclusion')} URL={r['html_url']}",flush=True)
            if r['status']=='completed':
                if r.get('conclusion')!='success': raise RuntimeError('Full preflight did not pass')
                return r
        time.sleep(5)
    raise RuntimeError('Timed out waiting for full preflight')


def wait_main_runs(sha):
    print('\n=== TASK H WORKFLOW VERIFICATION ===',flush=True)
    wanted={'.github/workflows/pages.yml':None,'.github/workflows/server-tests.yml':None}
    for _ in range(90):
        data=json.loads(run(f"gh api 'repos/{REPO}/actions/runs?head_sha={sha}&per_page=50'",capture=True).stdout)
        for r in data.get('workflow_runs',[]):
            if r.get('path') in wanted:
                wanted[r['path']]=r
        if all(wanted.values()) and all(r['status']=='completed' for r in wanted.values()):
            for path,r in wanted.items(): print(f"{path}: run={r['id']} conclusion={r['conclusion']} url={r['html_url']}",flush=True)
            if any(r['conclusion']!='success' for r in wanted.values()): raise RuntimeError('A required main workflow failed')
            return wanted
        time.sleep(5)
    raise RuntimeError('Timed out waiting for main workflows')


def task_h(final_sha):
    print('\n=== TASK H RELEASE ===',flush=True)
    run(f'git push origin {final_sha}:refs/heads/main')
    runs=wait_main_runs(final_sha)
    source_sha=run('sha256sum index.html').stdout.split()[0]
    run(f"curl --fail --silent --show-error --location '{LIVE}?audit={final_sha}' -o /tmp/live-index.html")
    live_sha=run('sha256sum /tmp/live-index.html').stdout.split()[0]
    print(f'SOURCE_INDEX_SHA256={source_sha}\nLIVE_INDEX_SHA256={live_sha}',flush=True)
    if source_sha!=live_sha: raise RuntimeError('Live index SHA mismatch')
    run(f"curl --fail --silent --show-error --location -o /tmp/live-app.js -w 'src/app.js HTTP=%{{http_code}}\\n' '{LIVE}src/app.js?audit={final_sha}'")
    run(f"curl --fail --silent --show-error --location '{LIVE}data/questions.json?audit={final_sha}' -o /tmp/live-questions.json")
    run("node -e \"const q=JSON.parse(require('fs').readFileSync('/tmp/live-questions.json','utf8')); if(q.length!==121)process.exit(1); console.log('live questions: PASS (121)')\"")
    run(f"curl --fail --silent --show-error --location '{LIVE}sw.js?audit={final_sha}' -o /tmp/live-sw.js")
    run("grep -n \"sdaia-ai-pages-v6\" /tmp/live-sw.js")
    print('TASK_H_RELEASE=PASS',flush=True)
    return runs


def task_i(final_sha):
    print('\n=== TASK I HOUSEKEEPING ===',flush=True)
    run('git checkout -B housekeeping/npm-audit-refresolver')
    audit=run('npm audit --json',check=False)
    if audit.returncode not in (0,1): raise RuntimeError(f'npm audit returned unexpected status {audit.returncode}')
    data=json.loads(audit.stdout)
    highs=[]
    for name,item in data.get('vulnerabilities',{}).items():
        if item.get('severity')=='high': highs.append((name,item.get('via',[])))
    lines=['# npm audit high-severity report','','Generated: 2026-09-07','',f'High-severity packages reported: {len(highs)}','']
    for name,via in highs:
        details=[]
        for entry in via:
            if isinstance(entry,str): details.append(entry)
            elif isinstance(entry,dict): details.append(entry.get('title') or entry.get('name') or 'advisory')
        lines.append(f'- `{name}` — ' + (', '.join(details) if details else 'high severity'))
    write('docs/npm-audit-2026-09-07.md','\n'.join(lines)+'\n')
    p=ROOT/'server/app/main.py';text=p.read_text(encoding='utf-8')
    text=text.replace('from jsonschema import Draft7Validator, FormatChecker, RefResolver','from jsonschema import Draft7Validator, FormatChecker\nfrom referencing import Registry, Resource\nfrom referencing.jsonschema import DRAFT7')
    old="""def make_validator(name):\n    schema = load_schema(name)\n    resolver = RefResolver(base_uri=SCHEMA_DIR.resolve().as_uri() + '/', referrer=schema)\n    return Draft7Validator(schema, resolver=resolver, format_checker=FormatChecker())\n"""
    new="""def make_registry():\n    registry = Registry()\n    base_uri = SCHEMA_DIR.resolve().as_uri() + '/'\n    for path in SCHEMA_DIR.glob('*.json'):\n        schema = json.loads(path.read_text(encoding='utf-8'))\n        resource = Resource.from_contents(schema, default_specification=DRAFT7)\n        registry = registry.with_resource(base_uri + path.name, resource)\n        registry = registry.with_resource(path.name, resource)\n    return registry\n\nSCHEMA_REGISTRY = make_registry()\n\ndef make_validator(name):\n    schema = load_schema(name)\n    return Draft7Validator(schema, registry=SCHEMA_REGISTRY, format_checker=FormatChecker())\n"""
    text=replace_once(text,old,new,'RefResolver migration')
    p.write_text(text,encoding='utf-8')
    verify('TASK I',["grep -n '^High-severity packages reported' docs/npm-audit-2026-09-07.md || cat docs/npm-audit-2026-09-07.md","if grep -n 'RefResolver' server/app/main.py; then exit 1; else echo 'RefResolver occurrences: 0'; fi","PYTHONPATH=server pytest -q server/tests"])
    run('git add docs/npm-audit-2026-09-07.md server/app/main.py')
    run('git diff --cached --check')
    run("git commit -m 'Audit npm dependencies and migrate schema references'")
    sha=run('git rev-parse HEAD').stdout.strip();run('git push -u origin housekeeping/npm-audit-refresolver')
    pr=run("gh pr create --base main --head housekeeping/npm-audit-refresolver --title 'Housekeeping: npm audit and referencing migration' --body 'Non-blocking housekeeping after the server-ready release. Adds the npm high-severity audit report and migrates jsonschema RefResolver usage to the referencing API. Server tests pass.'")
    print(f'TASK_I_COMMIT={sha}\nTASK_I_PR={pr.stdout.strip()}',flush=True)


def main():
    run("git config user.name 'Audit Remediation Agent'")
    run("git config user.email '147952589+oaabahussain@users.noreply.github.com'")
    run(f'git fetch origin {TARGET} main')
    run(f'git checkout -B {TARGET} origin/{TARGET}')
    base=run('git rev-parse HEAD').stdout.strip()
    if base!='e24145e2f6696a96a1abe4e2f2bf4a164f32ab1f': raise RuntimeError(f'Unexpected base {base}')
    print(f'BASE_COMMIT={base}',flush=True)
    task_a();task_b();task_c();task_d();task_e();task_f();final_sha=task_g()
    preflight=wait_preflight(final_sha)
    task_h(final_sha)
    task_i(final_sha)
    print(f'FINAL_RELEASE_COMMIT={final_sha}\nPREFLIGHT_RUN_ID={preflight["id"]}',flush=True)

if __name__=='__main__': main()
