import { updateSchedulingPreferences } from './preferencesStore.js';
// K4 browser-only controller; never mutates the strict assessment screens.
const VALID_REASONS=new Set(['COLD_START','REVIEW_DUE','NEW_FAMILY','TRUSTED_ERROR_REVIEW']);
export function createK4BrowserController({
  document,loadRecommendation,startSession,respond,clock,localize,locale=()=> 'ar',onViewChange=()=>{},preferencesStore=null,learnerId=null
}={}){
  if(!document?.getElementById||!document?.createElement ||
     !['loadRecommendation','startSession','respond','clock','localize','onViewChange']
       .every(k=>typeof ({loadRecommendation,startSession,respond,clock,localize,onViewChange})[k]==='function'))
    throw new TypeError('K4 controller dependencies missing');
  const home=document.getElementById('k4HomeCard');
  const practice=document.getElementById('k4Practice');
  if(!home||!practice)throw new Error('K4 public practice screen unavailable');
  let current=null,session=null,practiceQuestion=null,selectedIndex=null,reasonVisible=false;
  let homeGeneration=0,openPromise=null,practiceGeneration=0,lastPracticeFamily=null;
  const pendingStarts=new Set(),pendingStartFamilies=new Map();
  let pendingBarrier=null;
  function durableStartBarrier(){
    if(!pendingStarts.size)return Promise.resolve();
    if(!pendingBarrier)pendingBarrier=Promise.allSettled([...pendingStarts]);
    return pendingBarrier;
  }
  function invalidatePractice(){
    // Navigation retires any in-flight Start; a late receipt must not restore
    // a view whose user intent has already been superseded.
    practiceGeneration++;
    session=null;practiceQuestion=null;selectedIndex=null;openPromise=null;
    practice.replaceChildren();
  }
  const label=k=>String(localize(k));
  const make=(tag,value,css)=>{
    const node=document.createElement(tag);
    node.textContent=value??'';
    if(css)node.className=css;
    return node;
  };
  const button=(key,onClick,css='btn')=>{
    const n=make('button',label(key),css);
    n.type='button';
    n.addEventListener('click',onClick);
    return n;
  };
  function renderPractice(){
    if(!practiceQuestion || !session)throw new Error('K4 practice question unavailable');
    const q=practiceQuestion;
    if(session.candidate && q.id!==session.candidate.item_version_id)throw new Error('K4 practice session item mismatch');
    const ar=locale()==='ar',text=ar?q.question:q.question_en,options=ar?q.options:q.options_en;
    if(typeof text!=='string'||!Array.isArray(options)||options.length!==4||
       options.some(o=>typeof o!=='string'))throw new Error('K4 localized question unavailable');
    const nodes=[make('h2',label('k4Title')),make('p',text,'qText')];
    options.forEach((option,i)=>{
      const b=make('button',option,'btn option');
      b.type='button';
      b.disabled=selectedIndex!==null;
      b.addEventListener('click',async()=>{
        if(selectedIndex!==null)return;
        const answeredSession=session;
        const recorded=await respond({session:answeredSession,optionIndex:i});
        if(!recorded?.receipt||!['ACCEPTED','DUPLICATE'].includes(recorded.receipt.disposition))
          throw new Error('K4 response durable receipt unavailable');
        // The receipt belongs to the original interaction, never a newly opened one.
        if(session!==answeredSession)return;
        selectedIndex=i;
        renderPractice();
      });
      nodes.push(b);
    });
    if(selectedIndex!==null)nodes.push(make('p',label('k4Saved')));
    nodes.push(button('k4Close',close));
    practice.replaceChildren(...nodes);
    return practice;
  }
  async function renderHome(){
    const generation=++homeGeneration;
    if(pendingStarts.size){
      displayHome({recommendation:{status:'NO_ELIGIBLE_ACTION'}});
      await durableStartBarrier();
      if(generation!==homeGeneration)return current?.recommendation??{status:'INSUFFICIENT_EVIDENCE'};
    }
    const nowIso=clock();
    const result=await loadRecommendation({nowIso});
    if(generation!==homeGeneration)return current?.recommendation??{status:'INSUFFICIENT_EVIDENCE'};
    return displayHome(result);
  }
  function displayHome(result){
    current=result;
    reasonVisible=false;
    const rec=result?.recommendation;
    const title=make('h2',label('k4Title'));
    if(rec?.status!=='ACTION'||rec.action?.action_type!=='PRACTICE_ONE'||
       rec.action?.route_mode!=='practice'||!VALID_REASONS.has(rec.reason_code)||
       result?.question?.id!==rec.action?.item_version_id){
      // A recommendation without its exact public question is not actionable.
      // Do not expose a Start link or return an ACTION to the caller.
      const safe=rec?.status==='ACTION'
        ? {...rec,status:'NO_ELIGIBLE_ACTION',action:null,reason_code:'CONTENT_UNAVAILABLE'}
        : rec??{status:'INSUFFICIENT_EVIDENCE'};
      current={recommendation:safe,question:null};
      home.setAttribute?.('data-k4-family-id','');
      home.replaceChildren(title,make('p',label('k4Unavailable')));
      return safe;
    }
    home.setAttribute?.('data-k4-family-id',rec.action.question_family_id);
    home.replaceChildren(title,button('k4Start',()=>openPractice(),'btn primary'),
      button('k4Reason',showReason),
      button('k4Another',()=>another()),
      button('k4Snooze',()=>snooze({
        familyId:rec.action.question_family_id,
        untilAt:new Date(Date.parse(clock())+24*60*60*1000).toISOString()
      })));
    return rec;
  }
  function showReason(){
    const rec=current?.recommendation;
    if(!rec||!VALID_REASONS.has(rec.reason_code))return null;
    if(!reasonVisible){
      const reason=rec.reason_code==='COLD_START'?'k4ReasonColdStart':
        rec.reason_code==='REVIEW_DUE'?'k4ReasonDue':
        rec.reason_code==='NEW_FAMILY'?'k4ReasonNew':'k4ReasonDue';
      home.append(make('p',label(reason)));
      reasonVisible=true;
    }
    return rec.reason_code;
  }
  async function openPractice(){
    if(session){
      if(session.candidate?.item_version_id!==current?.recommendation?.action?.item_version_id)
        invalidatePractice();
      else {const view=renderPractice();onViewChange('k4Practice');return view}
    }
    if(openPromise)return openPromise;
    const selected=current,generation=practiceGeneration;
    if(!selected?.question || selected.question.id!==selected.recommendation?.action?.item_version_id)
      throw new Error('K4 public question unavailable');
    if(selected.recommendation.status!=='ACTION')
      throw new Error('K4 public practice action unavailable');
    const work=(async()=>{
      const started=await startSession({recommendation:selected.recommendation,question:selected.question,locale:locale()});
      if(!started)throw new Error('K4 practice start failed');
      if(generation!==practiceGeneration)return null;
      practiceQuestion=structuredClone(selected.question);
      session=started;
      const view=renderPractice();
      onViewChange('k4Practice');
      return view;
    })();
    openPromise=work;
    pendingStarts.add(work);
    pendingStartFamilies.set(work,selected.recommendation.action.question_family_id);
    pendingBarrier=null;
    try{return await work}finally{
      if(openPromise===work)openPromise=null;
      pendingStarts.delete(work);
      pendingStartFamilies.delete(work);
      if(!pendingStarts.size)pendingBarrier=null;
    }
  }
  async function another(){
    // A previously offered alternative cannot reselect an older unpublished family.
    if([...pendingStartFamilies.values()].some(f=>f!==current?.recommendation?.action?.question_family_id)){
      // More than one durable presentation is not yet reflected in the source.
      // No single-family exclusion can safely pick a third candidate.
      invalidatePractice();
      const generation=++homeGeneration;
      displayHome({recommendation:{status:'NO_ELIGIBLE_ACTION'}});
      await durableStartBarrier();
      if(generation!==homeGeneration)return current?.recommendation??{status:'INSUFFICIENT_EVIDENCE'};
      return renderHome();
    }
    const family=current?.recommendation?.action?.question_family_id??lastPracticeFamily;
    if(!family)return renderHome();
    invalidatePractice();
    const generation=++homeGeneration;
    const result=await loadRecommendation({nowIso:clock(),excludeFamilyId:family});
    if(generation!==homeGeneration)return current?.recommendation??{status:'INSUFFICIENT_EVIDENCE'};
    lastPracticeFamily=null;
    return displayHome(result);
  }
  async function nextAction(){
    invalidatePractice();
    return renderHome();
  }
  async function snooze({familyId,untilAt}={}){
    if(!preferencesStore?.read || !preferencesStore?.save ||
       typeof learnerId!=='string'||!learnerId ||
       familyId!==current?.recommendation?.action?.question_family_id)
      return {persisted:false,reason:'SOURCE_INVALID'};
    try {
      const saved=await preferencesStore.read(learnerId);
      const receipt=await updateSchedulingPreferences({
        store:preferencesStore,nowIso:clock(),
        request:{learnerId,expectedRevision:saved.preferences.revision,
          action:'SNOOZE',familyId,untilAt}
      });
      if(!receipt?.persisted)throw new Error('K4 snooze commit was not persisted');
      // Commit is authoritative. A later recommendation refresh may fail, but
      // it must not turn a durable successful write into a false save failure.
      displayHome({recommendation:{status:'NO_ELIGIBLE_ACTION'}});
      try { await nextAction(); }
      catch {
        // Preserve persisted receipt and a non-clickable unavailable card.
        displayHome({recommendation:{status:'NO_ELIGIBLE_ACTION'}});
      }
      return receipt;
    }catch(error){
      home.append(make('p',label('k4StorageUnavailable')));
      return {persisted:false,reason:'STORAGE_UNAVAILABLE'};
    }
  }
  function refreshLocale(){
    if(session)return renderPractice();
    if(current)return renderHome();
    return null;
  }
  function leavePractice(){
    // The durable presentation write may still be pending when Home is clicked.
    // Retire the UI synchronously but return its settlement barrier to the app.
    const pending=durableStartBarrier();
    lastPracticeFamily=session?.candidate?.question_family_id??current?.recommendation?.action?.question_family_id??null;
    invalidatePractice();
    homeGeneration++;
    displayHome({recommendation:{status:'NO_ELIGIBLE_ACTION'}});
    return pending??Promise.resolve();
  }
  async function close(){
    lastPracticeFamily=session?.candidate?.question_family_id??current?.recommendation?.action?.question_family_id??null;
    invalidatePractice();
    // Never offer a stale family while K3's durable presentation is re-read.
    const generation=++homeGeneration;
    displayHome({recommendation:{status:'NO_ELIGIBLE_ACTION'}});
    onViewChange('home');
    try {
      await durableStartBarrier();
      if(generation!==homeGeneration)return false;
      await renderHome();return true;
    }
    catch {
      displayHome({recommendation:{status:'NO_ELIGIBLE_ACTION'}});
      return false;
    }
  }
  return {renderHome,openPractice,showReason,close,leavePractice,refreshLocale,nextAction,another,snooze};
}
