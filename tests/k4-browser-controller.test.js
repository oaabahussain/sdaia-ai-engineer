import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createK4BrowserController } from '../src/recommendations/browserController.js';

function element(id=''){
  let text='';
  return {
    id,children:[],events:{},disabled:false,attrs:new Map(),setAttribute(name,value){this.attrs.set(name,String(value))},getAttribute(name){return this.attrs.get(name)??null},
    get textContent(){return text},set textContent(value){text=String(value);this.children=[]},
    append(...children){this.children.push(...children)},
    replaceChildren(...children){this.children=[...children]},
    addEventListener(name,fn){this.events[name]=fn},
    click(){return this.events.click?.()},
    classList:{add(){},remove(){}}
  };
}
function doc(){
  const nodes=new Map([['k4HomeCard',element('k4HomeCard')],['k4Practice',element('k4Practice')]]);
  return {nodes,getElementById(id){return nodes.get(id)??null},createElement:tag=>{const e=element();e.tagName=tag.toUpperCase();return e}};
}
const recommendation={
  schema_version:1,recommendation_type:'RecommendationV1',status:'ACTION',reason_code:'COLD_START',
  evidence_strength:'COLD_START',action:{action_type:'PRACTICE_ONE',route_mode:'practice',
    track_id:'sdaia-ai-engineer',release_id:'sdaia-ai-engineer.bootstrap.v1',
    item_version_id:'item-a.v1',question_family_id:'item-a',objective_id:'objective-a',domain_id:'core-ai'}
};
const question={id:'item-a.v1',question:'<img src=x onerror=alert(1)>',
  question_en:'What is a safe example?',options:['A','B','C','D'],options_en:['A','B','C','D']};
function make({locale='en',loading=async()=>({recommendation,question}),start=async()=>({id:'s1'}),respond=async()=>({receipt:{disposition:'ACCEPTED'}})}={}){
  const document=doc(),calls=[];
  const controller=createK4BrowserController({
    document,loadRecommendation:loading,
    startSession:async(...args)=>{calls.push('start');return start(...args)},
    respond:async(...args)=>{calls.push('respond');return respond(...args)},
    clock:()=> '2026-10-09T10:00:00.000Z',
    localize:k=>({k4Title:locale==='ar'?'مراجعة واحدة':'Practice one question',
      k4Start:locale==='ar'?'ابدأ الآن':'Start now',k4Reason:'Reason',
      k4Close:'Back',k4Saved:'Response recorded',k4Unavailable:'No practice available',
      k4ReasonColdStart:'New practice question',k4Option:'Option'}[k]??k),
    locale:()=>locale
  });
  return {document,controller,calls};
}
test('browser controller renders accessible public practice card and start action',async()=>{
  const {document,controller,calls}=make();
  const r=await controller.renderHome();
  assert.equal(r.status,'ACTION');
  const card=document.getElementById('k4HomeCard');
  assert.match(card.children.map(c=>c.textContent).join(' '),/Practice one question/);
  const start=card.children.find(c=>c.tagName==='BUTTON');
  assert.ok(start,'keyboard focusable button must exist');
  await start.click();
  assert.deepEqual(calls,['start']);
  assert.match(document.getElementById('k4Practice').children.map(c=>c.textContent).join(' '),/What is a safe example/);
});
test('question text is set with textContent rather than unsafe HTML',async()=>{
  const {document,controller}=make({locale:'ar'});
  await controller.renderHome();await controller.openPractice();
  const root=document.getElementById('k4Practice');
  assert.equal(root.children.some(c=>c.textContent===question.question),true);
  assert.match(root.children.map(c=>c.textContent).join(' '),/img src/);
});
test('one answer invokes non-strict response path without official grading',async()=>{
  const {document,controller,calls}=make();
  await controller.renderHome();await controller.openPractice();
  const option=document.getElementById('k4Practice').children.find(c=>c.tagName==='BUTTON'&&c.textContent==='A');
  await option.click();
  assert.deepEqual(calls,['start','respond']);
  assert.doesNotMatch(document.getElementById('k4Practice').children.map(c=>c.textContent).join(' '),/official score|readiness|mastery/i);
});
test('missing public asset never creates practice route',async()=>{
  const {controller,calls}=make({loading:async()=>({recommendation,question:null})});
  await controller.renderHome();
  await assert.rejects(()=>controller.openPractice(),/unavailable|question/i);
  assert.deepEqual(calls,[]);
});
test('home is integrated as a separate screen; existing exam route remains',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(html,/id="k4HomeCard"/);
  assert.match(html,/id="k4Practice"/);
  assert.match(html,/id="startFullBtn"/);
  assert.match(html,/id="exam"/);
  assert.match(app,/createK4BrowserController/);
});

test('active practice remains bound to its original item across asynchronous home refresh',async()=>{
  let calls=0, recorded=null;
  const second={
    ...recommendation,
    action:{...recommendation.action,item_version_id:'item-b.v1',question_family_id:'item-b'}
  };
  const secondQuestion={...question,id:'item-b.v1',question_en:'Different second question'};
  const {controller,document}=make({
    loading:async()=>++calls===1?{recommendation,question}:{recommendation:second,question:secondQuestion},
    start:async({recommendation:chosen})=>({candidate:chosen.action}),
    respond:async({session})=>{
      recorded=session.candidate.item_version_id;
      return {receipt:{disposition:'ACCEPTED'}};
    }
  });
  await controller.renderHome();
  await controller.openPractice();
  await controller.renderHome(); // happens after language change while K3 recorder keeps original session
  await controller.refreshLocale();
  const current=()=>document.getElementById('k4Practice').children.map(x=>x.textContent).join(' ');
  assert.match(current(),/What is a safe example/);
  assert.doesNotMatch(current(),/Different second question/);
  const option=document.getElementById('k4Practice').children.find(x=>x.tagName==='BUTTON'&&x.textContent==='A');
  await option.click();
  assert.equal(recorded,'item-a.v1');
  assert.match(current(),/Response recorded/);
});

test('latest async home request wins; older completion cannot restore prior recommendation',async()=>{
  let pendingResolve;
  const second={...recommendation,action:{...recommendation.action,question_family_id:'item-b',item_version_id:'item-b.v1'}};
  let call=0;
  const {document,controller}=make({loading:async()=>{
    call++;
    if(call===1)return {recommendation,question};
    if(call===2)return new Promise(resolve=>{pendingResolve=resolve});
    return {recommendation:second,question:{...question,id:'item-b.v1',question_en:'Updated'}};
  }});
  await controller.renderHome();
  const stale=controller.renderHome();
  await controller.renderHome();
  pendingResolve({recommendation,question});
  await stale;
  assert.equal(document.getElementById('k4HomeCard').getAttribute('data-k4-family-id'),'item-b');
});

test('two concurrent practice start clicks open only one K3 evidence session',async()=>{
  let release;
  const pause=new Promise(resolve=>{release=resolve});
  const {controller,calls}=make({start:async()=>{await pause;return {candidate:recommendation.action}}});
  await controller.renderHome();
  const one=controller.openPractice(),two=controller.openPractice();
  release();
  await Promise.all([one,two]);
  assert.deepEqual(calls,['start']);
});


test('stale pending Start cannot restore old practice after selecting Another',async()=>{
  let release;
  const wait=new Promise(resolve=>{release=resolve});
  const other={...recommendation,action:{...recommendation.action,question_family_id:'item-b',item_version_id:'item-b.v1'}};
  const otherQuestion={...question,id:'item-b.v1',question_en:'New alternate question'};
  const {controller,document}=make({
    loading:async({excludeFamilyId}={})=>excludeFamilyId?{recommendation:other,question:otherQuestion}:{recommendation,question},
    start:async({recommendation:chosen})=>{
      if(chosen.action.question_family_id==='item-a')await wait;
      return {candidate:chosen.action};
    }
  });
  await controller.renderHome();
  const staleStart=controller.openPractice();
  await controller.another();
  assert.equal(document.getElementById('k4HomeCard').getAttribute('data-k4-family-id'),'item-b');
  release();
  await staleStart;
  assert.equal(document.getElementById('k4Practice').children.length,0,'superseded async Start must not reopen prior item');
  await controller.openPractice();
  assert.match(document.getElementById('k4Practice').children.map(c=>c.textContent).join(' '),/New alternate question/);
});


test('late answer from a closed session cannot mark a new practice item as saved',async()=>{
  let release;
  const pause=new Promise(resolve=>{release=resolve});
  const replacement={...recommendation,action:{...recommendation.action,question_family_id:'item-b',item_version_id:'item-b.v1'}};
  const replacementQuestion={...question,id:'item-b.v1',question_en:'Unanswered replacement'};
  const {controller,document}=make({
    loading:async({excludeFamilyId}={})=>excludeFamilyId?
      {recommendation:replacement,question:replacementQuestion}:{recommendation,question},
    start:async({recommendation:chosen})=>({candidate:chosen.action}),
    respond:async({session:answerSession})=>{
      if(answerSession.candidate.item_version_id==='item-a.v1')await pause;
      return {receipt:{disposition:'ACCEPTED'}};
    }
  });
  await controller.renderHome();
  await controller.openPractice();
  const root=document.getElementById('k4Practice');
  const firstOption=root.children.find(c=>c.tagName==='BUTTON'&&c.textContent==='A');
  const oldAnswer=firstOption.click();
  controller.close();
  await controller.another();
  await controller.openPractice();
  assert.match(root.children.map(c=>c.textContent).join(' '),/Unanswered replacement/);
  release();
  await oldAnswer;
  assert.doesNotMatch(root.children.map(c=>c.textContent).join(' '),/Response recorded/,
    'receipt from retired session must not falsely mark new question as answered');
  assert.equal(root.children.find(c=>c.tagName==='BUTTON'&&c.textContent==='A').disabled,false);
});


test('missing public question asset fails closed without rendering clickable Start',async()=>{
  const {controller,document,calls}=make({loading:async()=>({recommendation,question:null})});
  const result=await controller.renderHome();
  const card=document.getElementById('k4HomeCard');
  assert.equal(result.status,'NO_ELIGIBLE_ACTION',
    'an unavailable runtime question must not be advertised as an ACTION');
  assert.equal(card.getAttribute('data-k4-family-id'),'');
  assert.equal(card.children.some(child=>child.tagName==='BUTTON'),false,
    'an unavailable question must not render a clickable practice Start');
  await assert.rejects(()=>controller.openPractice(),/unavailable|question/i);
  assert.deepEqual(calls,[]);
});


test('closing a presented question recalculates the home next action from fresh evidence',async()=>{
  let loads=0;
  const next={...recommendation,action:{...recommendation.action,question_family_id:'item-b',item_version_id:'item-b.v1'}};
  const alternate={...question,id:'item-b.v1',question_en:'New unseen question'};
  const {controller,document}=make({
    loading:async()=>++loads===1?{recommendation,question}:{recommendation:next,question:alternate},
    start:async({recommendation:chosen})=>({candidate:chosen.action})
  });
  await controller.renderHome();
  await controller.openPractice();
  await controller.close();
  assert.equal(loads,2,'return to home must re-read source after presentation was persisted');
  assert.equal(document.getElementById('k4HomeCard').getAttribute('data-k4-family-id'),'item-b');
  assert.equal(document.getElementById('k4Practice').children.length,0);
});


test('header Home refresh cannot reopen the previously presented session as a new action',async()=>{
  let loads=0;
  const next={...recommendation,action:{...recommendation.action,question_family_id:'item-b',item_version_id:'item-b.v1'}};
  const newQuestion={...question,id:'item-b.v1',question_en:'Question after header Home'};
  const launched=[];
  const {controller,document}=make({
    loading:async()=>++loads===1?{recommendation,question}:{recommendation:next,question:newQuestion},
    start:async({recommendation:chosen})=>{
      launched.push(chosen.action.item_version_id);
      return {candidate:chosen.action};
    }
  });
  await controller.renderHome();
  await controller.openPractice();
  await controller.renderHome(); // app's header Home refreshes, but does not call close()
  assert.equal(document.getElementById('k4HomeCard').getAttribute('data-k4-family-id'),'item-b');
  await controller.openPractice();
  assert.deepEqual(launched,['item-a.v1','item-b.v1']);
  assert.match(document.getElementById('k4Practice').children.map(c=>c.textContent).join(' '),/Question after header Home/);
});


test('header Home hides prior Start synchronously while source refresh is pending',async()=>{
  let resolveRefresh;
  const future=new Promise(resolve=>{resolveRefresh=resolve});
  const next={...recommendation,action:{...recommendation.action,question_family_id:'item-b',item_version_id:'item-b.v1'}};
  const nextQuestion={...question,id:'item-b.v1',question_en:'Next after delayed refresh'};
  const launched=[];
  let calls=0;
  const {document,controller}=make({
    loading:async()=>{
      calls++;
      return calls===1?{recommendation,question}:future;
    },
    start:async({recommendation:rec})=>{launched.push(rec.action.item_version_id);return {candidate:rec.action}}
  });
  await controller.renderHome();
  await controller.openPractice();
  controller.leavePractice(); // Header Home must retire old action *before* awaiting fetch
  const pending=controller.renderHome();
  const home=document.getElementById('k4HomeCard');
  assert.equal(home.getAttribute('data-k4-family-id'),'');
  assert.equal(home.children.some(child=>child.tagName==='BUTTON'),false);
  await assert.rejects(()=>controller.openPractice(),/unavailable/i);
  resolveRefresh({recommendation:next,question:nextQuestion});
  await pending;
  await controller.openPractice();
  assert.deepEqual(launched,['item-a.v1','item-b.v1']);
  assert.match(document.getElementById('k4Practice').children.map(x=>x.textContent).join(' '),/Next after delayed refresh/);
  const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  assert.match(app,/function resetToHome\(\)\{[^}]*K4_CONTROLLER\.leavePractice\(\)/,
    'header Home must retire the old K4 session before triggering renderHome');
});
