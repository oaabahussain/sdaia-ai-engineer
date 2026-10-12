const CORRECTION='learner.evidence.correction.recorded@1';
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const validId=x=>typeof x==='string'&&x.length>0;

// K5's first release has NO independently approved correction authenticator.
// Caller-supplied callbacks and nonempty authority_ref are not credentials.
export function classifyK5Corrections({events}={}) {
  if(!Array.isArray(events))throw new TypeError('verified event history required');
  const ordered=[...events].sort((a,b)=>(a.store_seq??0)-(b.store_seq??0)||cmp(a.event_id,b.event_id));
  const byId=new Map(),base=[];
  for(const event of ordered){
    if(!validId(event?.event_id)||byId.has(event.event_id))throw new Error('duplicate or invalid event identity');
    byId.set(event.event_id,event);
    if(event.definition_id!==CORRECTION)base.push(event);
  }
  const reasons=new Set(),affected=new Set(),
    corrections=ordered.filter(event=>event.definition_id===CORRECTION),
    targets=new Map(),edges=new Map();
  let sourceInvalid=false;
  for(const correction of corrections){
    const p=correction.payload??{},target=byId.get(p.target_event_id);
    reasons.add('CORRECTION_AUTHORITY_UNVERIFIED');
    if(!target||target.definition_id===CORRECTION){
      reasons.add('CORRECTION_UNRESOLVED');sourceInvalid=true;continue;
    }
    if(target.learner_id!==correction.learner_id){
      reasons.add('CORRECTION_CONFLICT');sourceInvalid=true;continue;
    }
    if(!validId(target.question_family_id)){
      reasons.add('UNKNOWN_FAMILY_MAPPING');sourceInvalid=true;continue;
    }
    affected.add(target.question_family_id);
    const group=targets.get(p.target_event_id)||[];
    group.push(correction);targets.set(p.target_event_id,group);
    if(p.action==='SUPERSEDE'){
      const replacement=byId.get(p.superseding_event_id);
      if(!replacement||replacement.definition_id===CORRECTION){
        reasons.add('CORRECTION_UNRESOLVED');sourceInvalid=true;continue;
      }
      if(replacement.learner_id!==correction.learner_id){
        reasons.add('CORRECTION_CONFLICT');sourceInvalid=true;continue;
      }
      if(!validId(replacement.question_family_id)){
        reasons.add('UNKNOWN_FAMILY_MAPPING');sourceInvalid=true;continue;
      }
      affected.add(replacement.question_family_id);
      edges.set(p.target_event_id,p.superseding_event_id);
    }else if(p.action!=='VOID'){
      reasons.add('CORRECTION_CONFLICT');
    }
  }
  for(const group of targets.values())if(group.length>1)reasons.add('CORRECTION_CONFLICT');
  for(const start of edges.keys()){
    const seen=new Set();let target=start;
    while(edges.has(target)){
      if(seen.has(target)){reasons.add('CORRECTION_CONFLICT');break;}
      seen.add(target);target=edges.get(target);
    }
  }
  const safeEvents=sourceInvalid?[]:base.filter(event=>!affected.has(event.question_family_id));
  const integrity_status=sourceInvalid?'SOURCE_INVALID':
    reasons.has('CORRECTION_CONFLICT')||reasons.has('CORRECTION_AUTHORITY_UNVERIFIED')?'CONFLICTED':
    reasons.size?'INCOMPLETE':'COMPLETE';
  return {safeEvents,quarantinedFamilies:[...affected].sort(cmp),sourceInvalid,
    reasons:[...reasons].sort(cmp),integrity_status};
}
