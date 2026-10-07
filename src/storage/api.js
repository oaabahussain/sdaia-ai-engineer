import { API_BASE } from '../config.js';import { getOrCreateAnonId } from './identity.js';import { createEvidenceApiTransport } from '../evidence/apiTransport.js';
const VERSION=new Map();const base=()=>(globalThis.__SDAIA_API_BASE__||API_BASE).replace(/\/$/,'');
async function request(path,options={},includeAnon=true){const id=getOrCreateAnonId();const headers={'Content-Type':'application/json',...(includeAnon?{'X-Anon-Id':id}:{}),...(options.headers||{})};const response=await fetch(`${base()}${path}`,{...options,headers});return{response,id}}
export async function loadState(){const id=getOrCreateAnonId();const{response}=await request(`/progress/${id}`);if(response.status===404)return null;if(!response.ok)throw new Error(`Progress load failed: ${response.status}`);VERSION.set(id,Number(response.headers.get('etag')||0));return response.json()}
export async function saveState(state){const id=getOrCreateAnonId();if(state.anon_id!==id)throw new Error('State anonymous ID does not match adapter ID');const expected=VERSION.get(id)??0;const{response}=await request(`/progress/${id}`,{method:'PUT',headers:{'If-Match':String(expected)},body:JSON.stringify(state)});if(response.status===409)throw new Error('Progress version conflict');if(!response.ok)throw new Error(`Progress save failed: ${response.status}`);VERSION.set(id,Number(response.headers.get('etag')||expected+1))}
export async function loadBank(trackId){if(typeof trackId!=='string'||!trackId)throw new Error('trackId is required');const{response}=await request(`/bank?track_id=${encodeURIComponent(trackId)}`,{},false);if(!response.ok)throw new Error(`Bank load failed: ${response.status}`);return response.json()}
export async function submitFeedback(item){const{response}=await request('/feedback',{method:'POST',body:JSON.stringify(item)});if(!response.ok)throw new Error(`Feedback submit failed: ${response.status}`);return response.json()}
export async function logEvent(evt){const item={...evt,created_at:evt.created_at||new Date().toISOString(),payload:evt.payload||{}};const{response}=await request('/events',{method:'POST',body:JSON.stringify([item])});if(!response.ok)throw new Error(`Event submit failed: ${response.status}`)}

export function createEvidenceSyncCapability({authorizationProvider,baseUrl=globalThis.__SDAIA_EVIDENCE_API_BASE__||API_BASE,fetchImpl=globalThis.fetch,pullLimit}={}){
 if(typeof authorizationProvider!=='function')return null;
 if(typeof fetchImpl!=='function')throw new TypeError('fetch implementation is required');
 const authorizedFetch=async(url,options={})=>{
  const grant=await authorizationProvider({url:String(url),method:options.method||'GET'});
  if(!grant?.headers||typeof grant.headers!=='object'||Array.isArray(grant.headers))throw new Error('Evidence sync authorization headers are required');
  const granted={...grant.headers};
  const keys=Object.keys(granted);
  if(!keys.length)throw new Error('Evidence sync authorization headers are required');
  if(keys.some(key=>key.toLowerCase()==='x-anon-id'))throw new Error('X-Anon-Id cannot authorize learner evidence sync');
  return fetchImpl(url,{...options,headers:{...(options.headers||{}),...granted}});
 };
 return createEvidenceApiTransport({baseUrl,fetchImpl:authorizedFetch,pullLimit});
}
