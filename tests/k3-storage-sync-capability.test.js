import test from 'node:test';
import assert from 'node:assert/strict';

class FakeLocalStorage{
  constructor(){this.map=new Map();}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}

async function freshApi(){
  return import('../src/storage/api.js?task30='+Date.now()+'-'+Math.random());
}

test('Task 30 exposes an explicit evidence sync capability factory and stays local-only by default',async()=>{
  const api=await freshApi();
  assert.equal(typeof api.createEvidenceSyncCapability,'function','Task 30 evidence sync capability is missing');
  assert.equal(await api.createEvidenceSyncCapability(),null);
  assert.equal(await api.createEvidenceSyncCapability({anonId:'portable-progress-id'}),null);
  assert.equal(await api.createEvidenceSyncCapability({learner_id:'learner:p1'}),null);
});

test('Task 30 enables evidence sync only with an explicitly injected authorization provider',async()=>{
  const api=await freshApi();
  assert.equal(typeof api.createEvidenceSyncCapability,'function','Task 30 evidence sync capability is missing');
  const calls=[];
  const fetchImpl=async(url,options={})=>{
    calls.push({url,options:structuredClone(options)});
    const isPush=(options.method??'GET')==='POST';
    return {ok:true,status:200,async json(){return isPush?{schema_version:1,receipts:[]}:{events:[],next_store_seq:0};}};
  };
  const capability=await api.createEvidenceSyncCapability({
    baseUrl:'https://evidence.example.test',
    fetchImpl,
    authorizationProvider:async()=>({headers:{Authorization:'Bearer explicit-test-token'}})
  });
  assert.equal(typeof capability?.push,'function');
  assert.equal(typeof capability?.pull,'function');
  await capability.pull(0);
  assert.equal(calls.length,1);
  assert.equal(calls[0].options.headers.Authorization,'Bearer explicit-test-token');
  const headerNames=Object.keys(calls[0].options.headers).map(x=>x.toLowerCase());
  assert.equal(headerNames.includes('x-anon-id'),false,'X-Anon-Id must never authorize learner evidence sync');
});

test('Task 30 obtains authorization per request and fails closed before transport when provider fails',async()=>{
  const api=await freshApi();
  let providerCalls=0;
  let fetchCalls=0;
  const capability=await api.createEvidenceSyncCapability({
    baseUrl:'https://evidence.example.test',
    fetchImpl:async()=>{fetchCalls+=1;throw new Error('network should not be reached');},
    authorizationProvider:async()=>{providerCalls+=1;throw new Error('authorization unavailable');}
  });
  await assert.rejects(()=>capability.pull(0),/authorization unavailable/);
  assert.equal(providerCalls,1);
  assert.equal(fetchCalls,0);
});

test('Task 30 does not persist authorization material into StateV2 or browser identity storage',async()=>{
  globalThis.localStorage=new FakeLocalStorage();
  globalThis.__SDAIA_API_BASE__='https://progress.example.test/v1';
  const api=await freshApi();
  const secret='Bearer secret-must-not-persist';
  const capability=await api.createEvidenceSyncCapability({
    baseUrl:'https://evidence.example.test',
    fetchImpl:async()=>({ok:true,status:200,json:async()=>({events:[],next_store_seq:0})}),
    authorizationProvider:async()=>({headers:{Authorization:secret}})
  });
  await capability.pull(0);
  const persisted=[...globalThis.localStorage.map.entries()].map(([k,v])=>k+'='+v).join('\n');
  assert.equal(persisted.includes(secret),false);
});

test('Task 30 storage interface exposes the optional capability while browser-default remains local-only',async()=>{
  const storage=await import('../src/storage/interface.js?task30='+Date.now()+'-'+Math.random());
  assert.equal(typeof storage.createEvidenceSyncCapability,'function','storage interface evidence sync capability is missing');
  assert.equal(await storage.createEvidenceSyncCapability(),null);
});

test('Task 30 evidence transport never silently falls back to progress X-Anon-Id',async()=>{
  globalThis.localStorage=new FakeLocalStorage();
  globalThis.__SDAIA_API_BASE__='https://progress.example.test/v1';
  const progressCalls=[];
  globalThis.fetch=async(url,options={})=>{
    progressCalls.push({url,options});
    return {ok:false,status:404,headers:new Headers(),json:async()=>({})};
  };
  const api=await freshApi();
  await api.loadState();
  const anonId=globalThis.localStorage.getItem('learning-platform.anon-id.v1');
  assert.ok(anonId);
  assert.equal(progressCalls[0].options.headers['X-Anon-Id'],anonId,'existing progress API behavior must remain unchanged');
  assert.equal(await api.createEvidenceSyncCapability({anonId}),null,'possessing the progress ID must not enable evidence sync');
});
