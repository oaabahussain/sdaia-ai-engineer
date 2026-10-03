import { resolveCurrentEvidence } from '../corrections.js';

function byStoreSeq(a,b){
  const as=Number.isInteger(a?.store_seq)?a.store_seq:Number.MAX_SAFE_INTEGER;
  const bs=Number.isInteger(b?.store_seq)?b.store_seq:Number.MAX_SAFE_INTEGER;
  if(as!==bs)return as-bs;
  return String(a?.event_id??'').localeCompare(String(b?.event_id??''));
}

function generatedAt(events){
  return events.map(e=>e.accepted_at??e.occurred_at).filter(v=>typeof v==='string'&&Number.isFinite(Date.parse(v))).sort().at(-1)??null;
}

function correctionReplacementMap(events,resolved){
  const blocked=new Set();
  for(const finding of [...resolved.unresolved,...resolved.conflicts]){
    if(finding.target_event_id)blocked.add(finding.target_event_id);
    for(const id of finding.event_ids??[])blocked.add(id);
  }
  const baseIds=new Set(events.filter(e=>e?.definition_id!=='learner.evidence.correction.recorded@1').map(e=>e.event_id));
  const map=new Map();
  for(const event of events.filter(e=>e?.definition_id==='learner.evidence.correction.recorded@1').sort(byStoreSeq)){
    const p=event.payload??{};
    if(!event.authority_ref||p.action!=='SUPERSEDE'||blocked.has(p.target_event_id))continue;
    if(baseIds.has(p.target_event_id)&&baseIds.has(p.superseding_event_id))map.set(p.target_event_id,p.superseding_event_id);
  }
  return map;
}

export function projectAttempt(events,{formSnapshot,throughStoreSeq,policyVersion}={}){
  if(!Array.isArray(events))throw new TypeError('events must be an array');
  if(!formSnapshot||!Array.isArray(formSnapshot.item_version_ids))throw new TypeError('formSnapshot.item_version_ids is required');
  if(!Number.isInteger(throughStoreSeq)||throughStoreSeq<0)throw new TypeError('throughStoreSeq must be a non-negative integer');
  if(typeof policyVersion!=='string'||!policyVersion)throw new TypeError('policyVersion is required');

  const window=events.filter(e=>Number.isInteger(e?.store_seq)&&e.store_seq<=throughStoreSeq).sort(byStoreSeq);
  const resolved=resolveCurrentEvidence(window);
  const active=resolved.activeEvents.sort(byStoreSeq);
  const activeById=new Map(active.map(e=>[e.event_id,e]));
  const replacements=correctionReplacementMap(window,resolved);
  const responses=window.filter(e=>e?.definition_id==='learner.response.recorded@1').sort(byStoreSeq);
  const resolutions=window.filter(e=>e?.definition_id==='learner.assessment.mutation.resolved@1').sort(byStoreSeq);
  const resolutionByCandidate=new Map();
  for(const r of resolutions){
    const id=r?.payload?.candidate_event_id;
    if(id)resolutionByCandidate.set(id,r);
  }

  const responseHistory=responses.map(response=>{
    const resolution=resolutionByCandidate.get(response.event_id)??null;
    return {
      response_event_id:response.event_id,
      item_version_id:response.item_version_id??null,
      resolution_event_id:resolution?.event_id??null,
      decision:resolution?.payload?.decision??'UNRESOLVED',
      authoritative_revision:resolution?.payload?.authoritative_revision_after??null
    };
  });

  const current=new Map();
  for(const history of responseHistory){
    if(history.decision!=='APPLIED'||!Number.isInteger(history.authoritative_revision))continue;
    let effectiveId=history.response_event_id;
    if(!activeById.has(effectiveId)&&replacements.has(effectiveId))effectiveId=replacements.get(effectiveId);
    const response=activeById.get(effectiveId);
    if(!response||response.definition_id!=='learner.response.recorded@1'||!response.item_version_id)continue;
    const previous=current.get(response.item_version_id);
    if(!previous||history.authoritative_revision>previous.authoritative_revision){
      current.set(response.item_version_id,{
        response_event_id:response.event_id,
        source_response_event_id:history.response_event_id,
        resolution_event_id:history.resolution_event_id,
        authoritative_revision:history.authoritative_revision,
        evaluation_event_ids:[]
      });
    }
  }

  const evaluations=active.filter(e=>e.definition_id==='learner.response.evaluated@1').sort(byStoreSeq);
  for(const entry of current.values()){
    entry.evaluation_event_ids=evaluations
      .filter(e=>e?.payload?.response_event_id===entry.response_event_id||e?.payload?.response_event_id===entry.source_response_event_id)
      .map(e=>e.event_id);
  }

  const submitted=[...active].reverse().find(e=>e.definition_id==='learner.assessment.submitted@1')??null;
  const currentResponses=Object.fromEntries([...current.entries()].sort(([a],[b])=>a.localeCompare(b)));
  const unanswered=submitted
    ? formSnapshot.item_version_ids.filter(id=>!Object.hasOwn(currentResponses,id))
    : [];

  const maxRevision=responseHistory.reduce((max,item)=>Number.isInteger(item.authoritative_revision)?Math.max(max,item.authoritative_revision):max,0);
  const first=active[0]??window.find(e=>e?.definition_id!=='learner.evidence.correction.recorded@1')??null;
  return {
    projection_type:'AttemptProjectionV1',
    schema_version:1,
    source_store_id:first?.store_id??null,
    through_store_seq:throughStoreSeq,
    policy_version:policyVersion,
    generated_at:generatedAt(window),
    assessment_attempt_id:first?.assessment_attempt_id??null,
    form_snapshot:structuredClone(formSnapshot),
    authoritative_revision:maxRevision,
    current_responses:currentResponses,
    response_history:responseHistory,
    stale_mutations:responseHistory.filter(x=>x.decision==='STALE').map(x=>({response_event_id:x.response_event_id,resolution_event_id:x.resolution_event_id})),
    evaluation_event_ids:evaluations.map(e=>e.event_id),
    submitted_event_id:submitted?.event_id??null,
    unanswered_item_version_ids:unanswered,
    integrity_status:resolved.conflicts.length?'CONFLICTED':resolved.unresolved.length?'INCOMPLETE':'COMPLETE',
    unresolved:resolved.unresolved,
    conflicts:resolved.conflicts
  };
}
