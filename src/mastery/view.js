import {assertK5VerifiedProjection} from './projection.js';
const STRINGS={
 ar:{
   heading:'النشاط المسجل',
   empty:'لا يوجد نشاط تدريب عام مسجل في هذا الإصدار.',
   observed:n=>'تم تسجيل نشاط على '+n+' من عائلات الأسئلة العامة.',
   unknown:'لا يمكن تأكيد إجمالي النشاط بسبب نقص ربط المحتوى.',
   blocked:'لا يمكن التحقق من النشاط المسجل حاليًا. يمكنك مواصلة التدريب العام.',
   explanation:'تقديرات الإتقان والجاهزية الرقمية غير متاحة لعدم توفر تقييم مستقل موثوق ومعايرة مثبتة.'
 },
 en:{
   heading:'Recorded activity',
   empty:'No public practice activity has been recorded for this release.',
   observed:n=>'Recorded activity across '+n+' public question families.',
   unknown:'The activity total cannot be confirmed because content mapping is incomplete.',
   blocked:'Recorded activity is currently unavailable for verification. Public practice is still available.',
   explanation:'Numerical mastery and readiness estimates are not available without independent trusted assessment and validated calibration.'
 }
};
export function renderK5Summary({projection,locale='ar'}={}) {
  assertK5VerifiedProjection(projection);
  const lang=locale==='en'?'en':'ar',labels=STRINGS[lang];
  const status=projection.observation_status;
  const count=['NO_OBSERVATIONS','OBSERVATIONS_PRESENT'].includes(status)?
    projection.observed_distinct_family_count:null;
  const body=status==='NO_OBSERVATIONS'?labels.empty:
    status==='OBSERVATIONS_PRESENT'?labels.observed(count):
    status==='INSUFFICIENT_EVIDENCE'?labels.unknown:labels.blocked;
  return Object.freeze({
    heading:labels.heading,body,explanation:labels.explanation,
    count,status,direction:lang==='ar'?'rtl':'ltr'
  });
}
