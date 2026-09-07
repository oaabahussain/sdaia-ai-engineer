import { loadState, saveState, loadBank, submitFeedback, logEvent } from './storage/interface.js';

const BANK = await loadBank();
let QUESTIONS = BANK.questions;
let SESSIONS = BANK.sessions;
let LEARN = BANK.learn;
let CASES = BANK.cases;
let WEIGHTS = BANK.weights;

const PATTERNS=[["Anki", "Active recall + spaced repetition; FSRS schedules review based on forgetting/retention."], ["Quizlet", "Personalized Learn mode, mixed question types, practice tests, targeted review."], ["Brilliant", "Learn-by-doing, short guided lessons, immediate feedback, step-by-step reasoning."], ["Duolingo", "Bite-sized daily goals and a lightweight streak/habit mechanism."], ["Microsoft Learn", "Learning paths → modules → units, with knowledge checks and interactive experiences."], ["AWS Skill Builder", "Domain review, official-style practice question sets, labs, and practice exams."], ["Google Skills", "Bite-size content + multi-module courses + real hands-on labs and guided learning paths."]];

const $=id=>document.getElementById(id);
const themeBtn=$('themeBtn'), focusBtn=$('focusBtn'), focusHint=$('focusHint');
const enterBtn=$('enterBtn'), finishOnboard=$('finishOnboard'), examDate=$('examDate'),
      dailyMinutes=$('dailyMinutes'), startMode=$('startMode');
const startDiag=$('startDiag'), diagIntro=$('diagIntro'), diagQuiz=$('diagQuiz');
const readinessBar=$('readinessBar'), due=$('due'), errors=$('errors'),
      bookmarks=$('bookmarks'), streak=$('streak'), heat=$('heat'),
      domainList=$('domainList'), sessionList=$('sessionList'),
      missionTitle=$('missionTitle'), missionWhy=$('missionWhy'),
      missionChips=$('missionChips'), missionBtn=$('missionBtn');
const studyLabel=$('studyLabel'), studyProgress=$('studyProgress'), studyBar=$('studyBar'),
      learnArea=$('learnArea'), qTopic=$('qTopic'), qtext=$('qtext'), opts=$('opts'),
      bookmarkBtn=$('bookmarkBtn'), reportQuestionLink=$('reportQuestionLink'), feedback=$('feedback'), qnote=$('qnote'),
      checkBtn=$('checkBtn'), nextBtn=$('nextBtn');
const errorList=$('errorList'), dueList=$('dueList'), reviewDueBtn=$('reviewDueBtn');
const storageStatus=$('storageStatus');
const searchBox=$('searchBox'), searchResults=$('searchResults'), caseGrid=$('caseGrid'),
      patterns=$('patterns'), exportBtn=$('exportBtn'), importFile=$('importFile'),
      resetBtn=$('resetBtn');


let state=(await loadState())||{}
const nowIso=()=>new Date().toISOString();
const confidenceName=(value)=>value===1?'low':value===3?'high':'mid';
const uuidV4=()=>globalThis.crypto?.randomUUID?.() ?? '00000000-0000-4000-8000-'+Math.random().toString(16).slice(2,14).padEnd(12,'0').slice(0,12);
const legacyAnswers=!Array.isArray(state.answers)&&state.answers?state.answers:{};
const legacyReview=!Array.isArray(state.review)&&state.review?state.review:{};
const legacyBookmarks=!Array.isArray(state.bookmarks)&&state.bookmarks?state.bookmarks:{};
state.version=1;
state.anon_id=state.anon_id||uuidV4();
state.created_at=state.created_at||nowIso();
state.updated_at=state.updated_at||state.created_at;
state.onboarded=!!state.onboarded;
state.profile=state.profile||{minutes:20,examDate:''};
state.answer_map=state.answer_map||legacyAnswers;
state.answers=Array.isArray(state.answers)?state.answers:[];
state.attempts=state.attempts||{};
state.confidence=state.confidence||{};
state.mastered=state.mastered||{};
state.review_map=state.review_map||legacyReview;
state.review=Array.isArray(state.review)?state.review:[];
state.errors=state.errors||{};
state.bookmark_map=state.bookmark_map||legacyBookmarks;
state.bookmarks=Array.isArray(state.bookmarks)?state.bookmarks:Object.entries(state.bookmark_map).filter(([,v])=>v).map(([id])=>id);
state.notes=state.notes||{};
state.sessions=state.sessions||{};
state.activity=state.activity||{};
state.diagnostic=state.diagnostic||{done:false,answers:{}};
state.theme=state.theme||'auto';
state.focus=!!state.focus;
state.settings=state.settings||{session_minutes:state.profile.minutes||20,exam_date:state.profile.examDate||null,dark:state.theme==='dark',focus:state.focus};
function recordAnswer(questionId,correct,confidence){state.answers.push({question_id:questionId,correct,confidence:confidenceName(confidence),answered_at:nowIso()})}
function syncReview(){state.review=Object.entries(state.review_map).map(([question_id,value])=>({question_id,due_at:new Date(value.next).toISOString(),interval_days:[1,3,7,14][value.stage]||14}))}
function syncBookmarks(){state.bookmarks=Object.entries(state.bookmark_map).filter(([,value])=>value).map(([id])=>id)}

let active={type:'session',id:1,ids:[],index:0,selected:null,confidence:null,shownLearn:false};
let diag={ids:[],index:0,selected:null,confidence:null};

function save(){state.updated_at=nowIso();state.settings={session_minutes:state.profile.minutes||20,exam_date:state.profile.examDate||null,dark:state.theme==='dark',focus:state.focus};syncReview();syncBookmarks();void saveState(state).catch(error=>console.error('State save failed',error))}
function today(){return new Date().toISOString().slice(0,10)}
function touch(){const d=today();state.activity[d]=(state.activity[d]||0)+1}
function qById(id){return QUESTIONS.find(q=>q.id===id)}
function questionReportUrl(id){
  const params=new URLSearchParams({
    template:'question-report.md',
    title:`Question report: ${id}`,
    body:`Question ID: ${id}\n\nDescribe the problem:\n`
  });
  return `https://github.com/oaabahussain/sdaia-ai-engineer/issues/new?${params.toString()}`;
}
function domainQs(d){return QUESTIONS.filter(q=>q.domain===d)}
function dueIds(){const n=Date.now();return Object.entries(state.review_map).filter(([id,v])=>v&&v.next<=n).map(([id])=>id)}
function errIds(){return Object.keys(state.errors).filter(id=>state.errors[id])}
function bookmarkCount(){return Object.values(state.bookmark_map).filter(Boolean).length}

function masteryFor(domain){
 const qs=domainQs(domain); if(!qs.length)return 0;
 let pts=0, possible=0;
 qs.forEach(q=>{
   possible+=1;
   if(state.mastered[q.id]) pts+=1;
   else if(state.answer_map[q.id]===true) pts+=0.75;
   else if(state.answer_map[q.id]===false) pts+=0;
 });
 return Math.round(pts/possible*100);
}
function readiness(){
 let total=0;
 Object.entries(WEIGHTS).forEach(([d,w])=>{total+=masteryFor(d)*(w/100)});
 if(!state.diagnostic.done) total*=0.9;
 return Math.round(total);
}
function errorPriority(id){
 const q=qById(id), c=state.confidence[id]||1, a=state.attempts[id]||1;
 return (c===3?3:c===2?2:1)+Math.min(3,a)+(WEIGHTS[q.domain]||10)/10;
}
function nextMission(){
 const due=dueIds();
 if(due.length)return {kind:'review',title:'مراجعة '+Math.min(10,due.length)+' أسئلة مستحقة',why:'لأن التوقيت الآن أهم من إضافة محتوى جديد.',ids:due.slice(0,10),minutes:state.profile.minutes};
 const candidates=SESSIONS.filter(s=>s.id<=13&&!state.sessions[s.id]);
 if(candidates.length){
   candidates.sort((a,b)=>{
     const pa=(WEIGHTS[a.domain]||0)*(1-masteryFor(a.domain)/100);
     const pb=(WEIGHTS[b.domain]||0)*(1-masteryFor(b.domain)/100);
     return pb-pa;
   });
   const s=candidates[0]; return {kind:'session',id:s.id,title:s.title,why:'اختيرت حسب وزن المجال × ضعفك الحالي.',ids:s.qs,minutes:s.minutes};
 }
 return {kind:'mock',id:15,title:'Weighted Mixed Mock',why:'أنهيت المحتوى الأساسي. الآن نختبر الاستدعاء المختلط.',ids:randomIds(25),minutes:30};
}
function randomIds(n,domain=null){
 let arr=domain?domainQs(domain).map(q=>q.id):QUESTIONS.map(q=>q.id);
 for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
 return arr.slice(0,n);
}
function schedule(id,correct){
 let r=state.review_map[id]||{stage:0};
 if(!correct)r.stage=0; else r.stage=Math.min(3,(r.stage||0)+1);
 const days=[1,3,7,14][r.stage]||14;
 r.next=Date.now()+days*86400000; state.review_map[id]=r;syncReview();
}
function classifyError(id,correct,conf){
 if(correct&&conf===1) state.errors[id]={type:'Lucky / low confidence',at:Date.now()};
 else if(!correct&&conf===3) state.errors[id]={type:'High-confidence misconception',at:Date.now()};
 else if(!correct) state.errors[id]={type:'Knowledge gap',at:Date.now()};
 else delete state.errors[id];
}

function go(id){
 document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.go===id));
 if(id==='home')renderHome();
 if(id==='review')renderReview();
 if(id==='library')renderLibrary();
 scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>go(b.dataset.go));

function applyTheme(){
 const dark=state.theme==='dark'||(state.theme==='auto'&&matchMedia('(prefers-color-scheme:dark)').matches);
 document.documentElement.toggleAttribute('data-theme',dark);
 document.getElementById('themeBtn').textContent=dark?'☀️':'🌙';
}
themeBtn.onclick=()=>{state.theme=document.documentElement.hasAttribute('data-theme')?'light':'dark';save();applyTheme()};
function applyFocus(){document.body.classList.toggle('focus',state.focus);focusHint.classList.toggle('on',state.focus);focusBtn.textContent=state.focus?'↩':'🎯'}
focusBtn.onclick=()=>{state.focus=!state.focus;save();applyFocus()};

enterBtn.onclick=()=>{if(!state.onboarded)go('onboarding'); else go('home')};
finishOnboard.onclick=()=>{
 state.profile.examDate=examDate.value;state.profile.minutes=+dailyMinutes.value;state.onboarded=true;save();
 if(startMode.value==='diagnostic'&&!state.diagnostic.done)go('diagnostic');else go('home');
};
startDiag.onclick=()=>{
 const ids=[];Object.keys(WEIGHTS).forEach(d=>ids.push(...randomIds(3,d)));
 diag={ids,index:0,selected:null,confidence:null};diagIntro.style.display='none';diagQuiz.style.display='block';renderDiag();
};

function renderDiag(){
 if(diag.index>=diag.ids.length){finishDiag();return}
 const q=qById(diag.ids[diag.index]);
 diag.selected=null;diag.confidence=null;
 diagQuiz.innerHTML=`<div class="quizHead"><span class="tiny">${q.domain}</span><b>${diag.index+1}/${diag.ids.length}</b></div>
 <div class="progress"><i style="width:${Math.round(diag.index/diag.ids.length*100)}%"></i></div>
 <div class="qcard"><div class="qtext">${q.question}</div><a class="reportLink" href="${questionReportUrl(q.id)}" target="_blank" rel="noopener">Report a question</a><div class="opts">${q.options.map((o,i)=>`<button class="opt" data-o="${i}">${o}</button>`).join('')}</div>
 <div class="conf"><button data-c="1">غير واثق</button><button data-c="2">متوسط</button><button data-c="3">واثق</button></div>
 <div class="feedback" id="dfb"></div><div class="actions"><button class="btn primary" id="dcheck">تحقق</button></div></div>`;
 diagQuiz.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{diag.selected=+b.dataset.o;diagQuiz.querySelectorAll('[data-o]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
 diagQuiz.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{diag.confidence=+b.dataset.c;diagQuiz.querySelectorAll('[data-c]').forEach(x=>x.classList.remove('on'));b.classList.add('on')});
 diagQuiz.querySelector('#dcheck').onclick=()=>{
   const dfbEl=diagQuiz.querySelector('#dfb');
   if(diag.selected===null||diag.confidence===null){dfbEl.textContent='اختر إجابة ومستوى ثقة.';dfbEl.classList.add('show');return}
   const ok=diag.selected===q.answer;
   state.diagnostic.answers[q.id]={ok,confidence:diag.confidence,domain:q.domain};
   state.answer_map[q.id]=ok;recordAnswer(q.id,ok,diag.confidence);state.confidence[q.id]=diag.confidence;state.attempts[q.id]=(state.attempts[q.id]||0)+1;state.mastered[q.id]=ok&&diag.confidence>=2;
   classifyError(q.id,ok,diag.confidence);schedule(q.id,ok);touch();save();diag.index++;renderDiag();
 };
}
function finishDiag(){state.diagnostic.done=true;save();diagQuiz.innerHTML=`<div class="panel" style="text-align:center"><div class="eyebrow">اكتمل التشخيص</div><div class="readiness">${readiness()}%</div><p>هذا baseline تحضيري. الخطة اليومية ستبدأ الآن بأعلى فجوة موزونة.</p><button class="btn primary" onclick="go('home')" style="margin-top:10px">افتح خطتي</button></div>`}

function renderHome(){
 const r=readiness();const readinessEl=document.getElementById('readiness');readinessEl.textContent=r+'%';readinessBar.style.width=r+'%';
 due.textContent=dueIds().length;errors.textContent=errIds().length;bookmarks.textContent=bookmarkCount();streak.textContent=calcStreak();
 renderHeat();renderDomains();renderSessions();
 const m=nextMission();missionTitle.textContent=m.title;missionWhy.textContent=m.why;missionChips.innerHTML=`<span class="chip">${m.minutes} دقيقة</span><span class="chip">${m.ids.length} سؤال</span><span class="chip">Adaptive</span>`;
 missionBtn.onclick=()=>startStudy(m);
}
function calcStreak(){
 let n=0,d=new Date();for(let i=0;i<60;i++){const k=d.toISOString().slice(0,10);if(state.activity[k])n++;else if(i===0){}else break;d.setDate(d.getDate()-1)}return n;
}
function renderHeat(){
 heat.innerHTML='';for(let i=34;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10),v=state.activity[k]||0;const el=document.createElement('div');el.className='day '+(v>=8?'l3':v>=4?'l2':v>=1?'l1':'');el.title=k+' · '+v;heat.appendChild(el)}
}
function renderDomains(){
 domainList.innerHTML='';Object.entries(WEIGHTS).sort((a,b)=>b[1]-a[1]).forEach(([d,w])=>{const m=masteryFor(d),div=document.createElement('div');div.className='domainRow';div.innerHTML=`<div class="domainTop"><b>${d}</b><span>${m}%</span></div><div class="progress mini"><i style="width:${m}%"></i></div><div class="meta"><span>Mastery</span><span>وزن ${w}%</span></div>`;domainList.appendChild(div)})
}
function renderSessions(){
 sessionList.innerHTML='';SESSIONS.forEach(s=>{const b=document.createElement('button');b.className='session '+(state.sessions[s.id]?'done':'');b.innerHTML=`<span class="num">${s.id}</span><span class="copy"><b>${s.title}</b><small>${s.domain} · ${s.minutes} دقيقة</small></span><span class="state">${state.sessions[s.id]?'✓':'ابدأ'}</span>`;b.onclick=()=>startStudy({kind:'session',id:s.id,title:s.title,ids:s.id===14?adaptiveWeakIds():s.id===15?randomIds(25):s.qs,minutes:s.minutes});sessionList.appendChild(b)})
}
function adaptiveWeakIds(){const ids=errIds().sort((a,b)=>errorPriority(b)-errorPriority(a));return ids.length?ids.slice(0,15):randomIds(15)}

function startStudy(m){
 active={type:m.kind,id:m.id||0,ids:m.ids&&m.ids.length?m.ids:randomIds(10),index:0,selected:null,confidence:null,shownLearn:false};go('study');renderStudy();
}
function renderStudy(){
 if(active.index>=active.ids.length){finishStudy();return}
 const studyConf=document.querySelector('#study .conf'); if(studyConf)studyConf.style.display='grid'; qnote.style.display='block';
 const q=qById(active.ids[active.index]);reportQuestionLink.href=questionReportUrl(q.id);active.selected=null;active.confidence=null;active.shownLearn=false;
 studyLabel.textContent=(active.id?'جلسة '+active.id:'مراجعة')+' · '+q.domain;studyProgress.textContent=(active.index+1)+' / '+active.ids.length;studyBar.style.width=Math.round(active.index/active.ids.length*100)+'%';
 qTopic.textContent=q.topic;qtext.textContent=q.question;opts.innerHTML='';
 q.options.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';b.textContent=o;b.onclick=()=>{active.selected=i;opts.querySelectorAll('.opt').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};opts.appendChild(b)});
 document.querySelectorAll('.conf button').forEach(b=>{b.classList.remove('on');b.onclick=()=>{active.confidence=+b.dataset.c;document.querySelectorAll('.conf button').forEach(x=>x.classList.remove('on'));b.classList.add('on')}})
 feedback.className='feedback';feedback.textContent='';checkBtn.style.display='block';nextBtn.style.display='none';
 bookmarkBtn.textContent=state.bookmark_map[q.id]?'★':'☆';bookmarkBtn.onclick=()=>{state.bookmark_map[q.id]=!state.bookmark_map[q.id];syncBookmarks();save();bookmarkBtn.textContent=state.bookmark_map[q.id]?'★':'☆'};
 qnote.value=state.notes[q.id]||'';qnote.onchange=()=>{state.notes[q.id]=qnote.value.trim();save()};
 const lc=LEARN[q.topic];learnArea.innerHTML=lc?`<details><summary>90 ثانية قبل السؤال — ${lc.title}</summary><div class="learnCard"><ul>${lc.bullets.map(x=>`<li>${x}</li>`).join('')}</ul><div class="mental">${lc.mental}</div></div></details>`:'';
}
checkBtn.onclick=()=>{
 const q=qById(active.ids[active.index]);if(active.selected===null||active.confidence===null){feedback.textContent='اختر إجابة ومستوى ثقة أولًا.';feedback.classList.add('show');return}
 state.attempts[q.id]=(state.attempts[q.id]||0)+1;const ok=active.selected===q.answer;const buttons=[...opts.children];
 if(ok){buttons[active.selected].classList.add('good');feedback.textContent='صحيح. '+q.explanation;state.answer_map[q.id]=true;recordAnswer(q.id,true,active.confidence);state.mastered[q.id]=true;state.confidence[q.id]=active.confidence;classifyError(q.id,true,active.confidence);schedule(q.id,true);checkBtn.style.display='none';nextBtn.style.display='block'}
 else {buttons[active.selected].classList.add('bad');state.answer_map[q.id]=false;recordAnswer(q.id,false,active.confidence);state.mastered[q.id]=false;state.confidence[q.id]=active.confidence;classifyError(q.id,false,active.confidence);
   if((state.attempts[q.id]||0)%2===1){feedback.textContent='ليست الصحيحة. جرّب مرة ثانية قبل كشف الحل.';active.selected=null}
   else{buttons[q.answer].classList.add('good');feedback.textContent='الحل: '+q.explanation;schedule(q.id,false);checkBtn.style.display='none';nextBtn.style.display='block'}
 }
 feedback.classList.add('show');touch();save();
}
nextBtn.onclick=()=>{active.index++;renderStudy()}
function finishStudy(){if(active.id)state.sessions[active.id]=true;save();learnArea.innerHTML='';qtext.textContent='✓ انتهت الجلسة. توقف هنا وخذ استراحة.';opts.innerHTML=`<button class="btn primary" onclick="go('home')">العودة لليوم</button>`;const studyConf=document.querySelector('#study .conf'); if(studyConf)studyConf.style.display='none';feedback.className='feedback';qnote.style.display='none';checkBtn.style.display='none';nextBtn.style.display='none';studyBar.style.width='100%';setTimeout(()=>{const c=document.querySelector('#study .conf');if(c)c.style.display='grid';qnote.style.display='block'},1000)}

function renderReview(){
 const es=errIds().sort((a,b)=>errorPriority(b)-errorPriority(a));errorList.innerHTML='';
 es.slice(0,20).forEach(id=>{const q=qById(id),e=state.errors[id],b=document.createElement('button');b.className='session';b.innerHTML=`<span class="num">!</span><span class="copy"><b>${e.type}</b><small>${q.topic} · ${q.question.slice(0,70)}...</small></span>`;b.onclick=()=>startStudy({kind:'review',title:'Error Bank',ids:[id],minutes:10});errorList.appendChild(b)});
 if(!es.length)errorList.innerHTML='<p class="tiny">لا توجد أخطاء مسجلة.</p>';
 const ds=dueIds();dueList.innerHTML='';ds.slice(0,20).forEach(id=>{const q=qById(id),b=document.createElement('button');b.className='session';b.innerHTML=`<span class="num">↻</span><span class="copy"><b>${q.topic}</b><small>${q.question.slice(0,72)}...</small></span>`;b.onclick=()=>startStudy({kind:'review',ids:[id],minutes:8});dueList.appendChild(b)});
 if(!ds.length)dueList.innerHTML='<p class="tiny">لا توجد مراجعات مستحقة الآن.</p>';
 reviewDueBtn.onclick=()=>startStudy({kind:'review',ids:ds.length?ds.slice(0,15):adaptiveWeakIds(),minutes:20});
}
function renderLibrary(){
 caseGrid.innerHTML='';CASES.forEach(c=>{const div=document.createElement('div');div.className='case';div.innerHTML=`<b>${c.title}</b><span class="tag">${c.domain}</span><p>${c.what}</p><p><strong>درس الاختبار:</strong> ${c.lesson}</p><div class="source">${c.source}</div>`;caseGrid.appendChild(div)});
}
searchBox.oninput=()=>{
 const term=searchBox.value.trim().toLowerCase();searchResults.innerHTML='';if(term.length<2)return;
 const hits=QUESTIONS.filter(q=>(q.question+' '+q.explanation+' '+q.topic+' '+q.domain).toLowerCase().includes(term)).slice(0,20);
 hits.forEach(q=>{const div=document.createElement('button');div.className='result';div.textContent=q.topic+' — '+q.question;div.onclick=()=>startStudy({kind:'search',ids:[q.id],minutes:8});searchResults.appendChild(div)});
 if(!hits.length)searchResults.innerHTML='<div class="tiny">لا توجد نتائج.</div>';
}

patterns.innerHTML=PATTERNS.map(p=>`<details><summary>${p[0]}</summary><p>${p[1]}</p></details>`).join('');

exportBtn.onclick=()=>{const a=document.createElement('a'),blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='sdaia-study-v3-progress.json';a.click();URL.revokeObjectURL(a.href)}
importFile.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();applyTheme();applyFocus();renderLibrary();renderHome();go('home')}catch(_){alert('ملف غير صالح')}};r.readAsText(f)}
resetBtn.onclick=async()=>{if(confirm('تصفير كل التقدم؟')){state={};await saveState(state);location.reload()}}

async function initializeStudyApp() {
  if(storageStatus)storageStatus.textContent='✓ التخزين المحلي متاح، مع fallback داخل الذاكرة عند تعذر التخزين الدائم';
  applyTheme();applyFocus();renderLibrary();
  if(state.onboarded){enterBtn.textContent='استأنف الخطة';}
}
window.go=go;
initializeStudyApp();

(function(){
  const banner = document.getElementById('installBanner');
  const title = document.getElementById('installTitle');
  const text = document.getElementById('installText');
  const dismiss = document.getElementById('installDismiss');

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function updateNetwork(){
    if(!banner) return;
    if(!navigator.onLine){
      banner.classList.add('show');
      title.innerHTML = '<span class="netDot off"></span>أنت الآن Offline';
      text.textContent = 'التطبيق سيستمر بالعمل من النسخة المخزنة على الجهاز.';
    } else if(isStandalone){
      banner.classList.remove('show');
    }
  }

  if(isIOS && !isStandalone && globalThis.__pwaInstallDismissed !== true){
    banner.classList.add('show');
    title.textContent = 'ثبّت التطبيق على iPhone';
    text.textContent = 'افتحه في Safari ثم اضغط مشاركة ↗ → Add to Home Screen.';
  }

  dismiss?.addEventListener('click', ()=>{
    banner.classList.remove('show');
    globalThis.__pwaInstallDismissed = true;
  });

  window.addEventListener('online', updateNetwork);
  window.addEventListener('offline', updateNetwork);
  updateNetwork();

  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('./sw.js', {scope:'./'}).catch(()=>{});
    });
  }

  if(navigator.storage && navigator.storage.persist){
    navigator.storage.persist().catch(()=>{});
  }
})();
