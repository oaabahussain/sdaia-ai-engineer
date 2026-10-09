// K4 browser-only controller; never mutates the strict assessment screens.
const VALID_REASONS=new Set(['COLD_START','REVIEW_DUE','NEW_FAMILY','TRUSTED_ERROR_REVIEW']);
export function createK4BrowserController({
  document,loadRecommendation,startSession,respond,clock,localize,locale=()=> 'ar',onViewChange=()=>{}
}={}){
  if(!document?.getElementById||!document?.createElement ||
     !['loadRecommendation','startSession','respond','clock','localize','onViewChange']
       .every(k=>typeof ({loadRecommendation,startSession,respond,clock,localize,onViewChange})[k]==='function'))
    throw new TypeError('K4 controller dependencies missing');
  const home=document.getElementById('k4HomeCard');
  const practice=document.getElementById('k4Practice');
  if(!home||!practice)throw new Error('K4 public practice screen unavailable');
  let current=null,session=null,selectedIndex=null,reasonVisible=false;
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
    if(!current?.question || !session)throw new Error('K4 practice question unavailable');
    const q=current.question;
    if(q.id!==current.recommendation.action?.item_version_id)throw new Error('K4 public question mismatch');
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
        const recorded=await respond({session,optionIndex:i});
        if(!recorded?.receipt||!['ACCEPTED','DUPLICATE'].includes(recorded.receipt.disposition))
          throw new Error('K4 response durable receipt unavailable');
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
    const nowIso=clock();
    const result=await loadRecommendation({nowIso});
    current=result;
    reasonVisible=false;
    const rec=result?.recommendation;
    const title=make('h2',label('k4Title'));
    if(rec?.status!=='ACTION'||rec.action?.action_type!=='PRACTICE_ONE'||
       rec.action?.route_mode!=='practice'||!VALID_REASONS.has(rec.reason_code)){
      home.replaceChildren(title,make('p',label('k4Unavailable')));
      return rec??{status:'INSUFFICIENT_EVIDENCE'};
    }
    home.replaceChildren(title,button('k4Start',()=>openPractice(),'btn primary'),
      button('k4Reason',showReason));
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
    if(!current?.question || current.question.id!==current.recommendation?.action?.item_version_id)
      throw new Error('K4 public question unavailable');
    if(current.recommendation.status!=='ACTION')
      throw new Error('K4 public practice action unavailable');
    if(!session){
      session=await startSession({recommendation:current.recommendation,question:current.question,locale:locale()});
      if(!session)throw new Error('K4 practice start failed');
    }
    const view=renderPractice();
    onViewChange('k4Practice');
    return view;
  }
  function refreshLocale(){
    if(session)return renderPractice();
    if(current)return renderHome();
    return null;
  }
  function close(){
    session=null;selectedIndex=null;
    practice.replaceChildren();
    onViewChange('home');
    return true;
  }
  return {renderHome,openPractice,showReason,close,refreshLocale};
}
