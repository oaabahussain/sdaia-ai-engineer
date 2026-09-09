function hashString(value){let h=2166136261>>>0;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function shuffle(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const TEMPLATES=[
 {ar:'أي وصف يطابق مفهوم «{term}» بشكل أدق؟',en:'Which description best matches “{term}”?',kind:'defs'},
 {ar:'ما المعنى العملي الأقرب لـ «{term}»؟',en:'What is the closest practical meaning of “{term}”?',kind:'defs'},
 {ar:'اختر التعريف الصحيح لـ «{term}».',en:'Choose the correct definition of “{term}”.',kind:'defs'},
 {ar:'في مراجعة تقنية، سُئلت عن «{term}». أي عبارة هي الأدق؟',en:'In a technical review, you are asked about “{term}”. Which statement is most accurate?',kind:'defs'},
 {ar:'المطلوب هو: {def_ar} ما المفهوم الأنسب؟',en:'The requirement is: {def_en} Which concept best fits?',kind:'terms'},
 {ar:'أي مصطلح يصف الحالة التالية؟ {def_ar}',en:'Which term describes the following? {def_en}',kind:'terms'},
 {ar:'فريق يريد تطبيق فكرة معناها: {def_ar} ماذا يختار؟',en:'A team wants to apply the idea meaning: {def_en} What should it choose?',kind:'terms'},
 {ar:'إذا كان الهدف هو «{def_ar}»، فأي مفهوم يجب أن تتذكره؟',en:'If the goal is “{def_en}”, which concept should you recall?',kind:'terms'},
];
function fmt(text,c){return text.replaceAll('{term}',c.term).replaceAll('{def_ar}',c.definition_ar).replaceAll('{def_en}',c.definition_en)}

export function expandConceptBank(conceptsByDomain){
 const questions=[];let qn=1;
 for(const [domain,concepts] of Object.entries(conceptsByDomain)){
  concepts.forEach((concept,ci)=>{
   TEMPLATES.forEach((tpl,ti)=>{
    const rng=mulberry32(hashString(`${domain}|${concept.term}|${ti}|20260909`));
    const others=shuffle(concepts.map((_,i)=>i).filter(i=>i!==ci),rng).slice(0,3);
    const source=shuffle([ci,...others],rng);const answer=source.indexOf(ci);
    const options=tpl.kind==='defs'?source.map(i=>concepts[i].definition_ar):source.map(i=>concepts[i].term);
    const options_en=tpl.kind==='defs'?source.map(i=>concepts[i].definition_en):source.map(i=>concepts[i].term);
    questions.push({id:`q${qn++}`,domain,topic:concept.term,question:fmt(tpl.ar,concept),question_en:fmt(tpl.en,concept),options,options_en,answer,explanation:`${concept.term}: ${concept.definition_ar}`,explanation_en:`${concept.term}: ${concept.definition_en}`,difficulty:['easy','medium','medium','hard'][(ci+ti)%4]});
   });
  });
 }
 return questions;
}
