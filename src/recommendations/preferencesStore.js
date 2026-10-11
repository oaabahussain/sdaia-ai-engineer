import { assertInstant } from './clock.js';

const TYPES=['learner_id','version','revision','snoozed_families','dismissed_families','preferred_domain_id'].sort();
const isRecord=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const keysMatch=(obj,keys)=>isRecord(obj)&&Object.keys(obj).sort().join('|')===keys.join('|');
function base(learnerId){
  return {learner_id:learnerId,version:1,revision:0,
    snoozed_families:[],dismissed_families:[],preferred_domain_id:null};
}
function learner(value){
  if(typeof value!=='string'||!value.trim())throw new TypeError('K4 learner ID required');
  return value;
}
function checkIntent(value,learnerId){
  if(!keysMatch(value,TYPES)||value.learner_id!==learnerId||value.version!==1||
     !Number.isSafeInteger(value.revision)||value.revision<0||
     !Array.isArray(value.snoozed_families)||!Array.isArray(value.dismissed_families)||
     (value.preferred_domain_id!==null&&typeof value.preferred_domain_id!=='string'))
    throw new TypeError('Invalid K4 scheduling preferences');
  for(const [list,strict] of [[value.snoozed_families,true],[value.dismissed_families,false]]){
    const seen=new Set();
    for(const row of list){
      if(!isRecord(row)||typeof row.question_family_id!=='string'||!row.question_family_id||
         seen.has(row.question_family_id))throw new TypeError('Invalid or duplicate K4 family preference');
      if(strict&&typeof row.until_at!=='string')throw new TypeError('K4 snooze expiry required');
      if(row.until_at!=null)assertInstant(row.until_at);
      seen.add(row.question_family_id);
    }
  }
  return structuredClone(value);
}
function openDB(indexedDB,dbName){
  return new Promise((resolve,reject)=>{
    let request;
    try{request=indexedDB.open(dbName,1)}catch(e){reject(e);return}
    request.onerror=()=>reject(request.error??new Error('IndexedDB preferences access failed'));
    request.onblocked=()=>reject(new Error('IndexedDB preferences blocked'));
    request.onupgradeneeded=()=>{
      if(!request.result.objectStoreNames.contains('preferences'))
        request.result.createObjectStore('preferences',{keyPath:'learner_id'});
    };
    request.onsuccess=()=>resolve(request.result);
  });
}
async function transaction(indexedDB,dbName,mode,perform){
  const db=await openDB(indexedDB,dbName);
  return new Promise((resolve,reject)=>{
    let output,abortError;
    let tx;
    try{tx=db.transaction('preferences',mode)}catch(e){db.close();reject(e);return}
    tx.oncomplete=()=>{db.close();resolve(output)};
    tx.onerror=()=>{abortError??=tx.error};
    tx.onabort=()=>{db.close();reject(abortError??tx.error??new Error('K4 preferences transaction aborted'))};
    const fail=(error)=>{
      abortError=error;
      try{tx.abort()}catch{db.close();reject(error)}
    };
    try{perform(tx.objectStore('preferences'),value=>{output=value},fail)}
    catch(error){fail(error)}
  });
}

export function createSchedulingPreferencesStore({indexedDB,dbName,evidenceStore=null}={}){
  if(!indexedDB||typeof indexedDB.open!=='function')throw new TypeError('IndexedDB is required');
  if(typeof dbName!=='string'||!dbName)throw new TypeError('K4 preferences database name required');
  if(evidenceStore && !['getK4Preferences','saveK4Preferences','clearK4Preferences'].every(
    key=>typeof evidenceStore[key]==='function'))
    throw new TypeError('K4 atomic preference port is unavailable');

  async function readLegacy(learnerId){
    return transaction(indexedDB,dbName,'readonly',(store,finish,fail)=>{
      const request=store.get(learnerId);
      request.onsuccess=()=>{
        try{
          const existing=request.result;
          finish(existing?{persisted:true,preferences:checkIntent(existing,learnerId)}
            :{persisted:false,preferences:base(learnerId)});
        }catch(e){fail(e)}
      };
      request.onerror=()=>fail(request.error??new Error('K4 read failed'));
    });
  }
  async function read(learnerId){
    learner(learnerId);
    if(!evidenceStore)return readLegacy(learnerId);
    // The canonical record and all practice events share one IndexedDB
    // transaction domain. Legacy preferences are consulted only once when
    // the canonical row has not yet been initialized.
    const saved=await evidenceStore.getK4Preferences({learnerId});
    if(saved)return {persisted:saved.persisted,
      preferences:checkIntent(saved.preferences,learnerId)};
    const legacy=await readLegacy(learnerId);
    const initialized=await evidenceStore.getK4Preferences({learnerId,initial:legacy});
    return {persisted:initialized.persisted,
      preferences:checkIntent(initialized.preferences,learnerId)};
  }
  return {
    read,
    async save({learnerId,expectedRevision,next}={}){
      learner(learnerId);
      if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)
        throw new TypeError('K4 expected revision must be nonnegative');
      const valid=checkIntent(next,learnerId);
      if(evidenceStore){
        await read(learnerId);
        return evidenceStore.saveK4Preferences({learnerId,expectedRevision,next:valid});
      }
      return transaction(indexedDB,dbName,'readwrite',(store,finish,fail)=>{
        const request=store.get(learnerId);
        request.onsuccess=()=>{
          const previous=request.result,revision=previous?.revision??0;
          if(revision!==expectedRevision){fail(new Error('K4 preferences revision conflict'));return}
          const value={...valid,revision:revision+1};
          const put=store.put(value);
          put.onsuccess=()=>finish({persisted:true,revision:value.revision});
          put.onerror=()=>fail(put.error??new Error('K4 preferences save failed'));
        };
        request.onerror=()=>fail(request.error??new Error('K4 preferences read failed'));
      });
    },
    async clear(learnerId){
      learner(learnerId);
      if(evidenceStore){
        await read(learnerId);
        return evidenceStore.clearK4Preferences(learnerId);
      }
      return transaction(indexedDB,dbName,'readwrite',(store,finish,fail)=>{
        const request=store.delete(learnerId);
        request.onsuccess=()=>finish({persisted:true});
        request.onerror=()=>fail(request.error??new Error('K4 preference clear failed'));
      });
    }
  };
}

export async function updateSchedulingPreferences({store,request,nowIso}={}){
  const now=assertInstant(nowIso);
  if(!store?.read||!store?.save||!request||request.action!=='SNOOZE'||
     typeof request.familyId!=='string'||!request.familyId ||
     !Number.isSafeInteger(request.expectedRevision))
    throw new TypeError('Invalid K4 snooze request');
  if(assertInstant(request.untilAt)<=now)throw new RangeError('K4 snooze expiry must be in the future');
  const read=await store.read(request.learnerId);
  if(read.preferences.revision!==request.expectedRevision)
    throw new Error('K4 preference revision conflict');
  const updated=structuredClone(read.preferences);
  updated.snoozed_families=updated.snoozed_families
    .filter(e=>e.question_family_id!==request.familyId);
  updated.snoozed_families.push({question_family_id:request.familyId,until_at:request.untilAt});
  return store.save({learnerId:request.learnerId,expectedRevision:request.expectedRevision,next:updated});
}
