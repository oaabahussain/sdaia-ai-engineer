import test from 'node:test';
import assert from 'node:assert/strict';
import { createK4BrowserController } from '../src/recommendations/browserController.js';

const a={question_family_id:'sdaia-ai-engineer.core-ai.alpha.def',item_version_id:'sdaia-ai-engineer.core-ai.alpha.def.v1',
  action_type:'PRACTICE_ONE',route_mode:'practice',release_id:'sdaia-ai-engineer.bootstrap.v1',
  objective_id:'objective-a',track_id:'sdaia-ai-engineer',domain_id:'core-ai'};
const b={...a,question_family_id:'sdaia-ai-engineer.core-ai.beta.def',item_version_id:'sdaia-ai-engineer.core-ai.beta.def.v1'};
function node(){return {children:[],events:{},textContent:'',attrs:new Map(),setAttribute(k,v){this.attrs.set(k,String(v))},getAttribute(k){return this.attrs.get(k)??null},classList:{add(){},remove(){}},
  replaceChildren(...a){this.children=a},append(...a){this.children.push(...a)},
  addEventListener(type,cb){this.events[type]=cb},click(){return this.events.click?.()}}}
function doc(){
  const home=node(),practice=node();
  return {home,practice,getElementById:id=>id==='k4HomeCard'?home:id==='k4Practice'?practice:null,
    createElement:()=>node()};
}
const recommend=(action)=>({recommendation:{schema_version:1,recommendation_type:'RecommendationV1',
  status:'ACTION',reason_code:'NEW_FAMILY',action},
  question:{id:action.item_version_id,question:'سؤال',question_en:'Question',
    options:['a','b','c','d'],options_en:['a','b','c','d']}});
function setup({save=async()=>({persisted:true,revision:1})}={}){
  const document=doc(),seen=[],reads=[];
  let now='2026-10-09T12:00:00.000Z';
  const prefs={learner_id:'learner:test',version:1,revision:0,snoozed_families:[],
    dismissed_families:[],preferred_domain_id:null};
  const store={read:async()=>({persisted:true,preferences:structuredClone(prefs)}),
    save:async arg=>{reads.push(arg);return save(arg)}};
  const controller=createK4BrowserController({
    document,clock:()=>now,preferencesStore:store,learnerId:'learner:test',
    locale:()=> 'en',localize:k=>k,onViewChange:()=>{},
    loadRecommendation:async x=>{seen.push(x);return recommend(x.excludeFamilyId===a.question_family_id?b:a)},
    startSession:async()=>({id:'sample'}),respond:async()=>({receipt:{disposition:'ACCEPTED'}})
  });
  return {controller,document,seen,reads,setNow:v=>now=v};
}
test('nextAction evaluates time again even when event watermark is unchanged',async()=>{
  const t=setup();
  await t.controller.nextAction();
  t.setNow('2026-10-10T12:01:00.000Z');
  await t.controller.nextAction();
  assert.equal(t.seen.length,2);
  assert.equal(t.seen[1].nowIso,'2026-10-10T12:01:00.000Z');
});
test('another requests a fresh alternate public candidate, never cached old link',async()=>{
  const t=setup();await t.controller.renderHome();
  await t.controller.another();
  assert.equal(t.seen[1].excludeFamilyId,a.question_family_id);
  const r=await t.controller.openPractice();
  assert.ok(r);
  assert.match(JSON.stringify(t.document.practice.children.map(n=>n.textContent)),/Question/);
});
test('snooze commits revision and refreshes only when durable receipt succeeds',async()=>{
  const t=setup();await t.controller.renderHome();
  const receipt=await t.controller.snooze({familyId:a.question_family_id,untilAt:'2026-10-10T12:00:00.000Z'});
  assert.equal(receipt.persisted,true);
  assert.equal(t.reads.length,1);
  assert.equal(t.reads[0].expectedRevision,0);
  assert.equal(t.reads[0].next.snoozed_families[0].question_family_id,a.question_family_id);
  assert.equal(t.seen.length,2);
});
test('denied preference write never claims saved snooze or keeps stale candidate link',async()=>{
  const t=setup({save:async()=>{throw new Error('quota denied')}});
  await t.controller.renderHome();
  const receipt=await t.controller.snooze({familyId:a.question_family_id,untilAt:'2026-10-10T12:00:00.000Z'});
  assert.equal(receipt.persisted,false);
  assert.equal(t.seen.length,1);
  assert.match(t.document.home.children.map(n=>n.textContent).join(' '),/k4StorageUnavailable/);
});
test('close keeps strict exam untouched, no implicit preference mutation',async()=>{
  const t=setup();await t.controller.renderHome();t.controller.close();
  assert.equal(t.reads.length,0);
  assert.equal(t.document.practice.children.length,0);
});

test('another publishes a changed family identity only after replacement is rendered',async()=>{
  const t=setup();
  await t.controller.renderHome();
  const before=t.document.home.getAttribute('data-k4-family-id');
  assert.equal(before,a.question_family_id);
  await t.controller.another();
  const after=t.document.home.getAttribute('data-k4-family-id');
  assert.equal(after,b.question_family_id);
  assert.notEqual(after,before);
});

test('confirmed snooze stays persisted if subsequent recommendation refresh fails',async()=>{
  const document=doc();
  let refreshCount=0,writeCount=0;
  const prefs={learner_id:'learner:test',version:1,revision:0,snoozed_families:[],
    dismissed_families:[],preferred_domain_id:null};
  const controller=createK4BrowserController({
    document,learnerId:'learner:test',clock:()=> '2026-10-09T12:00:00.000Z',
    localize:k=>k,locale:()=> 'en',onViewChange:()=>{},
    preferencesStore:{
      read:async()=>({persisted:false,preferences:structuredClone(prefs)}),
      save:async()=>{writeCount++;return {persisted:true,revision:1}}
    },
    loadRecommendation:async()=>{
      if(++refreshCount>1)throw new Error('recommendation refresh temporarily unavailable');
      return recommend(a);
    },
    startSession:async()=>({id:'unused'}),
    respond:async()=>({receipt:{disposition:'ACCEPTED'}})
  });
  await controller.renderHome();
  const saved=await controller.snooze({
    familyId:a.question_family_id,untilAt:'2026-10-10T12:00:00.000Z'
  });
  assert.equal(writeCount,1);
  assert.equal(saved.persisted,true,'do not misreport a committed preference as unsaved');
  assert.equal(saved.revision,1);
  assert.equal(document.home.getAttribute('data-k4-family-id'),'',
    'do not retain stale click-through to a snoozed question');
  assert.match(document.home.children.map(n=>n.textContent).join(' '),/k4Unavailable/);
});
