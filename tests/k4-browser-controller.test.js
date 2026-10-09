import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createK4BrowserController } from '../src/recommendations/browserController.js';

function element(id=''){
  let text='';
  return {
    id,children:[],events:{},disabled:false,
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
