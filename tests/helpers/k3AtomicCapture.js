import 'fake-indexeddb/auto';
import { createIndexedDbEvidenceStore } from '../../src/evidence/indexedDbStore.js';
export const definition={event_name:'learner.response.recorded',event_version:1,required_context_fields:['item_interaction_id'],payload_schema_ref:'data/evidence/payload-schemas/response-recorded-v1.schema.json'};
export function storage() {
  const values=new Map();
  return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))};
}
export function input(extra={}) {
  return {learner_id:'learner:a',activity_id:'20000000-0000-4000-8000-000000000090',track_id:'sdaia-ai-engineer',content_release_id:'release:test',mode:'practice',locale:'en',occurred_at:'2026-10-03T18:00:00Z',item_interaction_id:'20000000-0000-4000-8000-000000000091',item_version_id:'item:test',payload:{response_version:1,response_kind:'OPTION',response:{option_index:0}},...extra};
}
export function fixture({name=crypto.randomUUID(),originStorage=storage()}={}) {
  const store=createIndexedDbEvidenceStore({dbName:name,storeId:'local:test',indexedDB});
  return {name,store,definition,runtimeContext:{track:{id:'sdaia-ai-engineer',locales:['en']},evidence:{content_release_id:'release:test'},eventDefinitions:[definition],originStorage}};
}
export const result=request=>new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
export async function snapshot(name) {
  const db=await result(indexedDB.open(name));
  try {
    const names=[...db.objectStoreNames]; const tx=db.transaction(names,'readonly');
    const values=await Promise.all(names.map(n=>result(tx.objectStore(n).getAll())));
    return Object.fromEntries(names.map((n,i)=>[n,values[i]]));
  } finally {db.close();}
}
export function faultAdd(t,storeName,{lateAbort=false}={}) {
  const original=IDBObjectStore.prototype.add;
  IDBObjectStore.prototype.add=function(...args) {
    if(this.name===storeName) {
      if(!lateAbort) throw Error(`injected ${storeName} write failure`);
      const request=original.apply(this,args);const tx=this.transaction;
      request.addEventListener('success',()=>tx.abort());return request;
    }
    return original.apply(this,args);
  };
  const restore=()=>{IDBObjectStore.prototype.add=original;};t.after(restore);return restore;
}
