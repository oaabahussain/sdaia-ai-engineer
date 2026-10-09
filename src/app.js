import { registerServiceWorker } from './registerServiceWorker.js';
import { loadState, saveState, loadBank } from './storage/interface.js';
import { weightedAllocation, sampleWeightedExam, sampleSectionExam, buildOptionOrders, scoreExam } from './logic/exam.js';
import { expandConceptBank } from './logic/questionBank.js';
import { CORE_I18N, CORE_DEFAULT_LOCALE } from './presentation/coreI18n.js';
import { loadTrackPresentation, resolvePresentationLocale, getPresentationLocale, getDomainLabel } from './presentation/trackPresentation.js';
import { loadTrackRegistry, resolveActiveTrackId } from './tracks/registry.js';
import { readSavedTrackId, saveTrackId } from './tracks/selection.js';
import { cacheAssessmentSnapshotModuleForOffline, createBrowserAssessmentContext, rehydrateAssessmentFormSnapshot } from './assessment/assessmentSnapshot.js';
import { createEvidenceRecorder } from './evidence/recorder.js';
import { createIndexedDbEvidenceStore } from './evidence/indexedDbStore.js';
import { beginExamEvidence, presentExamItemEvidence, recordExamAnswerEvidence, recordExamConfidenceEvidence, submitExamEvidence } from './evidence/appBridge.js';

registerServiceWorker();



const $=id=>document.getElementById(id);
let BANK, PROFILE, QUESTIONS=[], WEIGHTS={}, state, lang='ar', activeExam=null;
let PRESENTATION=null,OBJECTIVE_CATALOG=null,EVIDENCE_RECORDER=null,K4_CONTROLLER=null;
let actionTail=Promise.resolve();
function trackState(){return state.tracks[BANK.track.id]}
function surfaceEvidenceError(error){console.error(error);const box=$('errorBox');if(box){box.textContent=error?.message||String(error);box.classList.add('show')}}
function runUiAction(action){const run=actionTail.catch(()=>{}).then(action);actionTail=run.catch(surfaceEvidenceError);return actionTail}
function evidenceContext(exam=activeExam,overrides={}){return{learner_id:state?.anon_id,locale:exam?.assessment_snapshot?.locale??presentationView().locale,objective_catalog:OBJECTIVE_CATALOG,evidence_runtime:exam?.evidence_runtime,...overrides}}
function evidenceEnabled(exam=activeExam){return Boolean(EVIDENCE_RECORDER&&OBJECTIVE_CATALOG&&exam?.assessment_snapshot&&exam?.evidence_runtime)}
async function ensureCurrentItemEvidence(){if(!evidenceEnabled())return null;const q=qById(activeExam.questionIds[activeExam.index]);if(!q)return null;const context=evidenceContext();const result=await presentExamItemEvidence(EVIDENCE_RECORDER,activeExam,q,context);activeExam.evidence_runtime=context.evidence_runtime;save();return result}

function t(key,...args){const v=CORE_I18N[lang]?.app?.[key];return typeof v==='function'?v(...args):(v??key)}
function presentationView(){let locale=CORE_I18N[lang]?lang:CORE_DEFAULT_LOCALE;if(PRESENTATION&&BANK?.track){try{locale=resolvePresentationLocale(lang,BANK.track,PRESENTATION)}catch(presentationError){console.warn('Presentation locale fallback',presentationError)}}const view=getPresentationLocale(PRESENTATION,locale);const fallbackName=BANK?.track?.id??'learning-platform';return{locale,view,displayName:view?.display_name??fallbackName,brand:view?.brand??fallbackName,hero:view?.hero??null}}
function applyTrackPresentation(){const p=presentationView();$('brandText').textContent=p.brand;$('heroEyebrow').textContent=p.hero?.eyebrow??'';$('heroTitle').textContent=p.hero?.title??p.displayName;$('heroText').textContent=p.hero?.description??'';document.title=`${p.displayName} · ${t('practiceLabel')}`;$('statusNotice').textContent=t('statusNotice',BANK.track.official_status,PROFILE.evidence_status)}
function domainLabel(domain){const p=presentationView();return getDomainLabel(PRESENTATION,p.locale,domain)}
function secureRng(){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}return Math.random()}
function save(){state.preferences.lang=lang;state.preferences.theme=document.documentElement.dataset.theme||'light';trackState().active_exam=activeExam;state.updated_at=new Date().toISOString();void saveState(state)}
function showScreen(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');scrollTo({top:0,behavior:'smooth'})}
function qById(id){return QUESTIONS.find(q=>q.id===id)}
function localizedQuestion(q){return lang==='ar'?q.question:q.question_en}
function localizedOptions(q){return lang==='ar'?q.options:q.options_en}
function localizedExplanation(q){return lang==='ar'?q.explanation:q.explanation_en}

function applyLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('langBtn').textContent=lang==='ar'?'EN':'العربية';document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;const v=CORE_I18N[lang]?.app?.[key];if(v&&typeof v!=='function')el.textContent=t(key)});applyTrackPresentation();renderHome();if($('exam').classList.contains('active'))renderExam();if($('results').classList.contains('active'))renderResults(lastResult);if(K4_CONTROLLER&&$('k4Practice').classList.contains('active'))K4_CONTROLLER.refreshLocale()}
function applyTheme(theme){document.documentElement.dataset.theme=theme;$('themeBtn').textContent=theme==='dark'?'🌙':'☀️';save()}

function renderAllocation(){const allocation=weightedAllocation(WEIGHTS,PROFILE.question_count);$('allocation').innerHTML=Object.entries(allocation).map(([d,n])=>`<div class="allocRow"><div><b>${domainLabel(d)}</b><div class="bar"><i style="width:${WEIGHTS[d]}%"></i></div></div><span>${n} · ${WEIGHTS[d]}%</span></div>`).join('')}
function renderDomains(){const counts=Object.fromEntries(Object.keys(WEIGHTS).map(d=>[d,QUESTIONS.filter(q=>q.domain_id===d).length]));const preferred=PROFILE.section_sizes.includes(50)?50:PROFILE.section_sizes.find(x=>x!=='all');$('domainGrid').innerHTML=Object.entries(WEIGHTS).map(([d,w],i)=>`<div class="card domainCard"><div class="eyebrow">${String(i+1).padStart(2,'0')}</div><h3>${domainLabel(d)}</h3><div class="domainMeta"><span class="chip">${t('weight')} ${w}%</span><span class="chip">${t('bank')} ${counts[d]}</span></div><div class="domainActions"><select class="select sectionCount" data-domain="${d}">${PROFILE.section_sizes.map(size=>`<option value="${size}" ${size===preferred?'selected':''}>${size==='all'?`${t('all')} (${counts[d]})`:size}</option>`).join('')}</select><button class="btn primary startSection" data-domain="${d}">${t('start')}</button></div></div>`).join('');document.querySelectorAll('.startSection').forEach(btn=>btn.onclick=()=>runUiAction(()=>{const d=btn.dataset.domain;const sel=[...document.querySelectorAll('.sectionCount')].find(x=>x.dataset.domain===d);return startSection(d,sel.value)}))}
function renderHome(){if(!BANK)return;if(K4_CONTROLLER)void K4_CONTROLLER.renderHome().catch(surfaceEvidenceError);const domainCount=Object.keys(WEIGHTS).length;$('bankCount').textContent=QUESTIONS.length;$('domainCount').textContent=domainCount;$('fullExamCount').textContent=PROFILE.question_count;$('fullExamTitle').textContent=t('weightedExam',PROFILE.question_count);$('fullExamDesc').textContent=t('weightedDesc',domainCount);$('startFullBtn').textContent=t('startFull',PROFILE.question_count);renderAllocation();renderDomains();$('domainSummary').innerHTML=`<div class="stats"><div class="stat"><b>${QUESTIONS.length}</b><small>${t('questions')}</small></div><div class="stat"><b>${Object.keys(WEIGHTS).length}</b><small>${t('domains')}</small></div></div>`;const box=$('resumeBox');if(activeExam&&!activeExam.submitted){box.classList.add('show');$('resumeMeta').textContent=t('resumeText',activeExam.index+1,activeExam.questionIds.length)}else box.classList.remove('show')}

async function createExam(mode,questions,domain=null){const id=`exam-${Date.now()}-${Math.floor(secureRng()*1e6)}`;const optionOrders=buildOptionOrders(questions,secureRng);const startedAt=new Date().toISOString();const assessmentContext=BANK.evidence?createBrowserAssessmentContext({form_id:`form:${id}`,ui_mode:mode,content_release_id:BANK.evidence.content_release_id,exam_profile_id:BANK.exam_profile.id,exam_profile_version:String(BANK.exam_profile.version),scoring_policy_ref:BANK.evidence.scoring_policy_ref,item_version_ids:questions.map(q=>q.id),option_orders:optionOrders,locale:presentationView().locale,started_at:startedAt}):null;activeExam={id,mode,domain,track_id:BANK.track.id,track_version:BANK.track.version,exam_profile_id:BANK.exam_profile.id,exam_profile_version:BANK.exam_profile.version,questionIds:questions.map(q=>q.id),index:0,answers:{},confidence:{},flags:{},optionOrders,started_at:startedAt,...(assessmentContext?{evidence_mode:assessmentContext.evidence_mode,assessment_snapshot:assessmentContext.assessment_snapshot}:{}),submitted:false};try{if(EVIDENCE_RECORDER&&assessmentContext){const context=evidenceContext(activeExam);const started=await beginExamEvidence(EVIDENCE_RECORDER,activeExam,context);activeExam.evidence_runtime=started.evidence_runtime}save();showScreen('exam');renderExam();await ensureCurrentItemEvidence()}catch(error){activeExam=null;throw error}}
async function startFull(){return createExam('full',sampleWeightedExam(QUESTIONS,WEIGHTS,PROFILE.question_count,secureRng))}
async function startSection(domain,count){return createExam('section',sampleSectionExam(QUESTIONS,domain,count,secureRng),domain)}

async function selectAnswer(canonicalIndex){const q=qById(activeExam.questionIds[activeExam.index]);const previous=activeExam.answers[q.id];if(evidenceEnabled()){await ensureCurrentItemEvidence();const context=evidenceContext(activeExam,{previous_answer:previous});await recordExamAnswerEvidence(EVIDENCE_RECORDER,activeExam,q,canonicalIndex,context);activeExam.evidence_runtime=context.evidence_runtime}activeExam.answers[q.id]=canonicalIndex;save();renderExam()}
async function setConfidence(value){const q=qById(activeExam.questionIds[activeExam.index]);const previous=activeExam.confidence[q.id];const next=value==='clear'||previous===value?undefined:value;if(evidenceEnabled()&&next!==undefined){await ensureCurrentItemEvidence();const context=evidenceContext(activeExam,{previous_confidence:previous});await recordExamConfidenceEvidence(EVIDENCE_RECORDER,activeExam,q,next,context);activeExam.evidence_runtime=context.evidence_runtime}if(value==='clear')delete activeExam.confidence[q.id];else if(previous===value)delete activeExam.confidence[q.id];else activeExam.confidence[q.id]=value;save();renderExam()}
async function move(delta){const next=Math.max(0,Math.min(activeExam.questionIds.length-1,activeExam.index+delta));activeExam.index=next;save();renderExam();scrollTo({top:0,behavior:'smooth'});await ensureCurrentItemEvidence()}
async function jump(i){activeExam.index=i;save();renderExam();scrollTo({top:0,behavior:'smooth'});await ensureCurrentItemEvidence()}
function toggleFlag(){const id=activeExam.questionIds[activeExam.index];activeExam.flags[id]=!activeExam.flags[id];if(!activeExam.flags[id])delete activeExam.flags[id];save();renderExam()}

function renderExam(){if(!activeExam)return;const q=qById(activeExam.questionIds[activeExam.index]);if(!q)return;const total=activeExam.questionIds.length;const answered=Object.keys(activeExam.answers).length;$('examModeLabel').textContent=activeExam.mode==='full'?t('fullMode'):t('sectionMode');$('examDomainChip').textContent=activeExam.mode==='full'?`${Object.keys(WEIGHTS).length} ${t('domains')}`:domainLabel(activeExam.domain);$('answeredChip').textContent=`${t('answered')} ${answered}/${total}`;$('examProgress').style.width=`${(activeExam.index+1)/total*100}%`;$('qTopic').textContent=`${domainLabel(q.domain_id)} · ${q.topic}`;$('qText').textContent=localizedQuestion(q);$('questionCounter').textContent=`${activeExam.index+1} ${t('of')} ${total}`;const localized=localizedOptions(q);const order=activeExam.optionOrders[q.id]||[0,1,2,3];$('options').innerHTML=order.map((canonical,display)=>`<button class="option ${Number(activeExam.answers[q.id])===canonical?'selected':''}" data-answer="${canonical}" aria-pressed="${Number(activeExam.answers[q.id])===canonical}"><span class="letter">${String.fromCharCode(65+display)}</span><span>${localized[canonical]}</span></button>`).join('');document.querySelectorAll('.option').forEach(b=>b.onclick=()=>runUiAction(()=>selectAnswer(Number(b.dataset.answer))));document.querySelectorAll('.confBtn').forEach(b=>b.classList.toggle('on',b.dataset.confidence!=='clear'&&activeExam.confidence[q.id]===b.dataset.confidence));$('flagBtn').textContent=activeExam.flags[q.id]?t('unflag'):t('flag');$('prevBtn').disabled=activeExam.index===0;$('nextBtn').disabled=activeExam.index===total-1;$('palette').innerHTML=activeExam.questionIds.map((id,i)=>`<button class="qjump ${i===activeExam.index?'current':''} ${activeExam.answers[id]!==undefined?'answered':''} ${activeExam.flags[id]?'flagged':''}" data-index="${i}" aria-label="${i+1}">${i+1}</button>`).join('');document.querySelectorAll('.qjump').forEach(b=>b.onclick=()=>jump(Number(b.dataset.index)))}

let lastResult=null;
async function submitExam(){if(!activeExam)return;if(!confirm(t('confirmSubmit')))return;const qs=activeExam.questionIds.map(qById).filter(Boolean);const result=scoreExam(qs,activeExam.answers);if(evidenceEnabled()){const context=evidenceContext();await submitExamEvidence(EVIDENCE_RECORDER,activeExam,result,qs,context);activeExam.evidence_runtime=context.evidence_runtime}activeExam.submitted=true;activeExam.submitted_at=new Date().toISOString();trackState().exam_history.unshift({attempt:{...structuredClone(activeExam),submitted:true,submitted_at:activeExam.submitted_at},result});trackState().exam_history=trackState().exam_history.slice(0,20);lastResult={result,exam:structuredClone(activeExam),questions:qs};activeExam=null;save();showScreen('results');renderResults(lastResult)}
function renderResults(payload){if(!payload)return;const {result,exam,questions}=payload;$('scorePct').textContent=`${result.percent}%`;$('scoreLabel').textContent=t('scoreText',result.correct,result.total);$('correctKpi').textContent=result.correct;$('wrongKpi').textContent=result.answered-result.correct;$('unansweredKpi').textContent=result.unanswered;const confUsed=Object.keys(exam.confidence||{}).length;$('confidenceKpi').textContent=`${Math.round(confUsed/result.total*100)}%`;$('resultBreakdown').innerHTML=Object.entries(result.perDomain).map(([d,v])=>{const pct=v.total?Math.round(v.correct/v.total*1000)/10:0;return `<div><div class="allocRow"><b>${domainLabel(d)}</b><span>${v.correct}/${v.total} · ${pct}%</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`}).join('');$('reviewList').innerHTML=questions.map((q,i)=>{const a=exam.answers[q.id];const opts=localizedOptions(q);const answerText=a===undefined?t('notAnswered'):opts[a];const good=Number(a)===q.answer;return `<div class="reviewItem"><div class="qTopic">${i+1}. ${domainLabel(q.domain_id)} · ${q.topic}</div><b>${localizedQuestion(q)}</b><div class="${good?'answerGood':'answerBad'}"><strong>${t('yourAnswer')}:</strong> ${answerText}</div>${good?'':`<div class="answerGood"><strong>${t('correctAnswer')}:</strong> ${opts[q.answer]}</div>`}<div class="muted">${localizedExplanation(q)}</div></div>`}).join('')}

function resetToHome(){showScreen('home');renderHome()}

$('langBtn').onclick=()=>{lang=lang==='ar'?'en':'ar';save();applyLanguage()};$('themeBtn').onclick=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');$('homeBtn').onclick=resetToHome;$('startFullBtn').onclick=()=>runUiAction(startFull);$('resumeBtn').onclick=()=>runUiAction(async()=>{if(activeExam){showScreen('exam');renderExam();await ensureCurrentItemEvidence()}});$('prevBtn').onclick=()=>runUiAction(()=>move(-1));$('nextBtn').onclick=()=>runUiAction(()=>move(1));$('flagBtn').onclick=toggleFlag;$('submitBtn').onclick=()=>runUiAction(submitExam);$('newExamBtn').onclick=resetToHome;document.querySelectorAll('.confBtn').forEach(b=>b.onclick=()=>runUiAction(()=>setConfidence(b.dataset.confidence)));
window.addEventListener('keydown',e=>{if(!$('exam').classList.contains('active')||!activeExam)return;if(['1','2','3','4'].includes(e.key)){const q=qById(activeExam.questionIds[activeExam.index]);const order=activeExam.optionOrders[q.id]||[0,1,2,3];runUiAction(()=>selectAnswer(order[Number(e.key)-1]))}else if(e.key==='ArrowRight')runUiAction(()=>move(lang==='ar'?-1:1));else if(e.key==='ArrowLeft')runUiAction(()=>move(lang==='ar'?1:-1))});

async function init(){try{await cacheAssessmentSnapshotModuleForOffline();
  const fetchJson=async url=>{const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw new Error(`Failed to load ${url}: ${response.status}`);return response.json()};
  const registry=await loadTrackRegistry(fetchJson);
  const selectedTrackId=resolveActiveTrackId({registry,savedTrackId:readSavedTrackId()});
  saveTrackId(selectedTrackId);
  BANK=await loadBank(selectedTrackId);
  try{PRESENTATION=await loadTrackPresentation(fetchJson,BANK.track)}catch(presentationError){console.warn('Track presentation unavailable',presentationError);PRESENTATION=null}
  PROFILE=BANK.exam_profile;
  if(!PROFILE)throw new Error('Missing exam profile');
  QUESTIONS=expandConceptBank(BANK.concepts||{},{trackId:BANK.track.id});
  WEIGHTS=PROFILE.weights;
  if(QUESTIONS.length<PROFILE.question_count)throw new Error(t('errorBank'));
  const mapResponse=await fetch('./data/migrations/sdaia-generated-v2-question-ids.json',{cache:'no-cache'});
  if(!mapResponse.ok)throw new Error('Failed to load question ID migration map');
  const questionIdMap=await mapResponse.json();
  state=await loadState({questionIdMap,trackId:BANK.track.id,trackVersion:BANK.track.version,examProfileId:BANK.exam_profile.id,examProfileVersion:BANK.exam_profile.version});
  lang=state.preferences.lang==='en'?'en':'ar';
  activeExam=trackState().active_exam&&!trackState().active_exam.submitted?trackState().active_exam:null;
  if(activeExam?.assessment_snapshot)activeExam.assessment_snapshot=rehydrateAssessmentFormSnapshot(activeExam.assessment_snapshot);
  if(BANK.evidence){
   const [eventDefinitions,objectiveCatalog]=await Promise.all([
    fetchJson(`./${BANK.evidence.event_definitions_ref}`),
    fetchJson('./data/evidence/sdaia-ai-engineer.objectives-v1.json')
   ]);
   OBJECTIVE_CATALOG=objectiveCatalog;
   const evidenceStore=createIndexedDbEvidenceStore({dbName:`learning-platform.evidence.v1.${BANK.track.id}`,storeId:`browser-evidence:${BANK.track.id}`,indexedDB:globalThis.indexedDB});
   EVIDENCE_RECORDER=createEvidenceRecorder({store:evidenceStore,outbox:evidenceStore.outbox,runtimeContext:{track:BANK.track,evidence:BANK.evidence,eventDefinitions}});
   try {
     // Optional K4 route: preserve the old K3 offline shell until approved
     // K4 modules are precached as part of the separate Pages parity task.
     const [pLib,cLib,sLib,prLib,rLib,prefLib,sessionLib,uiLib]=await Promise.all([
       import('./recommendations/policy.js'),
       import('./recommendations/publicCatalog.js'),
       import('./recommendations/sourceReader.js'),
       import('./recommendations/projection.js'),
       import('./recommendations/ranker.js'),
       import('./recommendations/preferencesStore.js'),
       import('./recommendations/practiceSession.js'),
       import('./recommendations/browserController.js')
     ]);
     const {validateRulePolicy}=pLib;
     const {validatePublicCatalog}=cLib;
     const {readK4Evidence}=sLib;
     const {computeScheduleProjection}=prLib;
     const {recommendNextAction}=rLib;
     const {createSchedulingPreferencesStore}=prefLib;
     const {createPracticeSession,presentPracticeItem,recordPracticeResponse}=sessionLib;
     const {createK4BrowserController}=uiLib;
     const [catalogRaw,policyRaw]=await Promise.all([
       fetchJson('./data/recommendations/k4-public-catalog-v1.json'),
       fetchJson('./data/recommendations/k4-rule-policy-v1.json')
     ]);
     const publicCatalog=validatePublicCatalog({
       catalog:catalogRaw,trackManifest:BANK.track,evidenceContext:BANK.evidence,
       publicQuestions:QUESTIONS.map(q=>({id:q.id,family_id:q.family_id,domain_id:q.domain_id})),
       objectives:OBJECTIVE_CATALOG
     });
     const rulePolicy=validateRulePolicy(policyRaw);
     const prefStore=createSchedulingPreferencesStore({
       indexedDB:globalThis.indexedDB,dbName:'learning-platform.k4.preferences.v1.'+BANK.track.id
     });
     const localPreferences=()=>({learner_id:state.anon_id,version:1,revision:0,
       snoozed_families:[],dismissed_families:[],preferred_domain_id:null});
     K4_CONTROLLER=createK4BrowserController({
       document,
       clock:()=>new Date().toISOString(),
       localize:key=>t(key),
       locale:()=>lang,
       onViewChange:id=>showScreen(id),
       preferencesStore:prefStore,
       learnerId:state.anon_id,
       loadRecommendation:async({nowIso,excludeFamilyId=null})=>{
         if(activeExam&&!activeExam.submitted)
           return {recommendation:{status:'NO_ELIGIBLE_ACTION'},question:null};
         const head=await evidenceStore.getSourceHead();
         const read=await readK4Evidence({
           store:evidenceStore,learnerId:state.anon_id,trackId:BANK.track.id,
           releaseId:BANK.evidence.content_release_id,throughStoreSeq:head.through_store_seq
         });
         const projection=computeScheduleProjection({
           learnerId:state.anon_id,sourceStoreId:read.source_store_id,
           throughStoreSeq:read.through_store_seq,events:read.events,
           activeReleaseId:BANK.evidence.content_release_id,policy:rulePolicy,
           nowIso,acceptedContentCatalog:publicCatalog
         });
         let preferences=localPreferences();
         try{preferences=(await prefStore.read(state.anon_id)).preferences}
         catch(error){console.warn('K4 local preference storage unavailable',error)}
         if(excludeFamilyId){
           preferences.dismissed_families=preferences.dismissed_families
             .filter(entry=>entry.question_family_id!==excludeFamilyId);
           preferences.dismissed_families.push({
             question_family_id:excludeFamilyId,
             until_at:new Date(Date.parse(nowIso)+60*1000).toISOString()
           });
         }
         const recommendation=recommendNextAction({
           scheduleProjection:projection,catalog:publicCatalog,policy:rulePolicy,
           nowIso,preferences
         });
         const question=recommendation.status==='ACTION'?
           qById(recommendation.action.item_version_id):null;
         return {recommendation,question};
       },
       startSession:async({recommendation,locale})=>{
         const session=createPracticeSession({
           recorder:EVIDENCE_RECORDER,learnerId:state.anon_id,
           trackId:BANK.track.id,releaseId:BANK.evidence.content_release_id,
           locale,candidate:recommendation.action,objectives:OBJECTIVE_CATALOG
         });
         await presentPracticeItem({recorder:EVIDENCE_RECORDER,session});
         return session;
       },
       respond:({session,optionIndex})=>recordPracticeResponse({
         recorder:EVIDENCE_RECORDER,session,optionIndex
       })
     });
   } catch(k4Error) {
     console.warn('K4 recommendation interface unavailable',k4Error);
     $('k4HomeCard').textContent=t('k4Unavailable');
   }
  }
  document.documentElement.dataset.theme=state.preferences.theme==='dark'?'dark':'light';
  $('themeBtn').textContent=document.documentElement.dataset.theme==='dark'?'🌙':'☀️';
  applyLanguage();
  renderHome();
 }catch(error){console.error(error);$('errorBox').textContent=error.message||String(error);$('errorBox').classList.add('show')}
}
init();
