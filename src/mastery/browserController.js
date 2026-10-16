import {readK5Source} from './source.js';
import {deriveK5EvidenceSufficiency} from './projection.js';
import {renderK5Summary} from './view.js';
const FALLBACK={
 ar:{heading:'النشاط المسجل',body:'لا يمكن التحقق من النشاط المسجل حاليًا. يمكنك مواصلة التدريب العام.',explanation:'تقديرات الإتقان والجاهزية الرقمية غير متاحة.'},
 en:{heading:'Recorded activity',body:'Recorded activity is currently unavailable for verification. Public practice remains available.',explanation:'Numerical mastery and readiness estimates are not available.'}
};
// DOM is written only with textContent; K5 does not change K3 events or K4 preferences.
export function createK5BrowserController({document,root,store,catalog,objectiveMap,learnerId,trackId,releaseId,locale=()=> 'ar'}={}){
 if(!document?.createElement||!root?.replaceChildren||typeof root.setAttribute!=='function'||
    typeof locale!=='function'||![learnerId,trackId,releaseId].every(value=>typeof value==='string'&&value))
   throw new TypeError('K5 browser controller requires pinned learner context and live DOM');
 let generation=0;
 function paint(view){
   const lang=locale()==='en'?'en':'ar';
   root.setAttribute('role','region');root.setAttribute('aria-live','polite');
   root.setAttribute('lang',lang);root.setAttribute('dir',lang==='ar'?'rtl':'ltr');
   root.setAttribute('aria-label',view.heading);root.setAttribute('data-k5-status',view.status);
   const make=(tag,text)=>{const node=document.createElement(tag);node.textContent=text;return node};
   root.replaceChildren(make('h2',view.heading),make('p',view.body),make('p',view.explanation));
 }
 async function render(){
   const current=++generation;
   let result;
   try{
     const head=await store.getSourceHead();
     const source=await readK5Source({store,learnerId,trackId,releaseId,throughStoreSeq:head.through_store_seq});
     const projection=await deriveK5EvidenceSufficiency({
       source,events:source.events,acceptedPublicCatalog:catalog,
       acceptedObjectiveMap:objectiveMap,policy:{policy_id:'K5.EVIDENCE.v1'},
       identityResolutionVersion:null
     });
     result=renderK5Summary({projection,locale:locale()});
   }catch{
     const lang=locale()==='en'?'en':'ar',words=FALLBACK[lang];
     result={...words,status:'SOURCE_INVALID',count:null};
   }
   if(current===generation)paint(result);
   return result;
 }
 return Object.freeze({render});
}
export async function mountK5Summary(options){return createK5BrowserController(options).render()}
