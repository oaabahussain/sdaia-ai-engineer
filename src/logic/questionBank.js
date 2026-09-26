function hashString(value){let h=2166136261>>>0;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function shuffle(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const TEMPLATES=[
 {id:'definition.best-description',order:0,ar:'أي وصف يطابق مفهوم «{term}» بشكل أدق؟',en:'Which description best matches “{term}”?',kind:'defs'},
 {id:'definition.practical-meaning',order:1,ar:'ما المعنى العملي الأقرب لـ «{term}»؟',en:'What is the closest practical meaning of “{term}”?',kind:'defs'},
 {id:'definition.choose-correct',order:2,ar:'اختر التعريف الصحيح لـ «{term}».',en:'Choose the correct definition of “{term}”.',kind:'defs'},
 {id:'definition.technical-review',order:3,ar:'في مراجعة تقنية، سُئلت عن «{term}». أي عبارة هي الأدق؟',en:'In a technical review, you are asked about “{term}”. Which statement is most accurate?',kind:'defs'},
 {id:'reverse.requirement',order:4,ar:'المطلوب هو: {def_ar} ما المفهوم الأنسب؟',en:'The requirement is: {def_en} Which concept best fits?',kind:'terms'},
 {id:'reverse.describes-case',order:5,ar:'أي مصطلح يصف الحالة التالية؟ {def_ar}',en:'Which term describes the following? {def_en}',kind:'terms'},
 {id:'reverse.team-choice',order:6,ar:'فريق يريد تطبيق فكرة معناها: {def_ar} ماذا يختار؟',en:'A team wants to apply the idea meaning: {def_en} What should it choose?',kind:'terms'},
 {id:'reverse.recall-concept',order:7,ar:'إذا كان الهدف هو «{def_ar}»، فأي مفهوم يجب أن تتذكره؟',en:'If the goal is “{def_en}”, which concept should you recall?',kind:'terms'}
];
function fmt(text,c){return text.replaceAll('{term}',c.term).replaceAll('{def_ar}',c.definition_ar).replaceAll('{def_en}',c.definition_en)}
export function expandConceptBank(conceptsByDomain,{trackId}={}){
 if(typeof trackId!=='string'||!trackId)throw new Error('trackId is required to expand a question bank');
 const questions=[];
 for(const [domain,rawConcepts] of Object.entries(conceptsByDomain)){
  const concepts=[...rawConcepts].sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
  concepts.forEach((concept,ci)=>{TEMPLATES.forEach(tpl=>{const rng=mulberry32(hashString(`${domain}|${concept.term}|${tpl.order}|20260909`));const others=shuffle(concepts.map((_,i)=>i).filter(i=>i!==ci),rng).slice(0,3);const source=shuffle([ci,...others],rng);const answer=source.indexOf(ci);const options=tpl.kind==='defs'?source.map(i=>concepts[i].definition_ar):source.map(i=>concepts[i].term);const options_en=tpl.kind==='defs'?source.map(i=>concepts[i].definition_en):source.map(i=>concepts[i].term);const familyId=`${trackId}.${concept.id}.${tpl.id}`;questions.push({id:`${familyId}.v1`,family_id:familyId,track_id:trackId,domain,topic:concept.term,question:fmt(tpl.ar,concept),question_en:fmt(tpl.en,concept),options,options_en,answer,explanation:`${concept.term}: ${concept.definition_ar}`,explanation_en:`${concept.term}: ${concept.definition_en}`,difficulty:['easy','medium','medium','hard'][(ci+tpl.order)%4]})})})
 }
 return questions;
}
