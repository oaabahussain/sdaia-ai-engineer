import { validateRulePolicy } from './policy.js';

const ISO=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;

export function assertInstant(value){
  if(typeof value!=='string')throw new TypeError('K4 timestamp must be an ISO 8601 instant');
  const m=ISO.exec(value);
  if(!m)throw new TypeError('K4 timestamp must include UTC offset');
  const [,year,month,day,hour,minute,second,,zone]=m;
  const y=Number(year),mo=Number(month),d=Number(day),
    h=Number(hour),min=Number(minute),sec=Number(second);
  const off=zone==='Z'?0:Number(zone.slice(1,3))*60+Number(zone.slice(4,6));
  const limit=[mo>=1&&mo<=12,d>=1&&d<=31,h<=23,min<=59,sec<=59,off<=23*60+59];
  if(limit.some(x=>!x))throw new RangeError('Invalid K4 ISO 8601 instant');
  const dayCheck=new Date(Date.UTC(y,mo-1,d,0,0,0));
  if(dayCheck.getUTCFullYear()!==y||dayCheck.getUTCMonth()+1!==mo||
     dayCheck.getUTCDate()!==d)
    throw new RangeError('Invalid K4 calendar date');
  const epoch=Date.parse(value);
  if(!Number.isFinite(epoch))throw new RangeError('Unparseable K4 instant');
  return epoch;
}

export function computeDueAt({
  lastExposureAt,lastTrustedGradeAt,gradeEvidence,correct,nowIso,policy
}={}) {
  validateRulePolicy(policy);
  const now=assertInstant(nowIso);
  if(gradeEvidence==='NONE')return null;
  let basis,delay;
  if(gradeEvidence==='EXPOSURE_ONLY'){
    if(lastExposureAt==null)return null;
    try{basis=assertInstant(lastExposureAt)}catch{return null}
    delay=policy.first_review_delay_hours;
  } else if(gradeEvidence==='TRUSTED_GRADED'){
    if(typeof correct!=='boolean'||lastTrustedGradeAt==null)return null;
    try{basis=assertInstant(lastTrustedGradeAt)}catch{return null}
    delay=correct?policy.trusted_correct_delay_hours:policy.trusted_incorrect_delay_hours;
  } else throw new TypeError('Unknown K4 evidence grade');
  if(basis>now)return null;
  const until=basis+Math.min(delay,policy.max_review_delay_hours)*3_600_000;
  if(!Number.isFinite(until))return null;
  return new Date(until).toISOString();
}
