import test from 'node:test';import assert from 'node:assert/strict';
function io(){const out=[];return{out,log:x=>out.push(String(x)),error:x=>out.push('ERR:'+x)}}
test('K2 CLI exposes read plan run status and resume without vendor coupling',async()=>{
 const {main}=await import('../scripts/platform-kernel/cli.js');const calls=[];const fake={
  async read(id){calls.push(['read',id]);return{id}},
  async plan(payload){calls.push(['plan',payload]);return{tranche_id:'t1',status:'PLANNED'}},
  async run(id){calls.push(['run',id]);return{tranche_id:id,status:'COMPLETED'}},
  async status(id){calls.push(['status',id]);return{tranche_id:id,status:'PARTIAL'}},
  async resume(id){calls.push(['resume',id]);return{tranche_id:id,status:'COMPLETED'}}
 };const sink=io();
 assert.equal(await main(['k2','read','t1'],{k2:fake},sink),0);
 assert.equal(await main(['k2','plan',JSON.stringify({expansion_plan_id:'e1'})],{k2:fake},sink),0);
 assert.equal(await main(['k2','run','t1'],{k2:fake},sink),0);
 assert.equal(await main(['k2','status','t1'],{k2:fake},sink),0);
 assert.equal(await main(['k2','resume','t1'],{k2:fake},sink),0);
 assert.deepEqual(calls.map(x=>x[0]),['read','plan','run','status','resume']);
});
test('K2 CLI rejects unknown subcommands and malformed plan payload',async()=>{
 const {main}=await import('../scripts/platform-kernel/cli.js');const sink=io();
 assert.equal(await main(['k2','unknown'],{k2:{}},sink),2);
 assert.equal(await main(['k2','plan','{bad'],{k2:{plan(){}}},sink),2);
});
