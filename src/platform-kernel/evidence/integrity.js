import { canonicalizeJson } from '../../../evidence/jcs.js';

const severityRank={ERROR:0,WARNING:1,INFO:2};
function finding(code,severity,extra={}){return {code,severity,...extra}}
function order(a,b){
  const sr=(severityRank[a.severity]??9)-(severityRank[b.severity]??9);if(sr)return sr;
  const c=a.code.localeCompare(b.code);if(c)return c;
  const ak=JSON.stringify(a.event_ids??[a.event_id??'']);const bk=JSON.stringify(b.event_ids??[b.event_id??'']);return ak.localeCompare(bk);
}
export function inspectEvidenceIntegrity(events,context={}){
  if(!Array.isArray(events))throw new TypeError('events must be an array');
  const known=new Set(context.knownDefinitionIds??[]);
  const findings=[];
  const eventBodies=new Map();
  const originSeq=new Map();
  const ids=new Set(events.filter(Boolean).map(e=>e.event_id).filter(Boolean));

  for(const event of events){
    if(!event||typeof event!=='object'){findings.push(finding('INVALID_EVENT','ERROR'));continue}
    if(event.schema_version!==2)findings.push(finding('UNSUPPORTED_EVENT_SCHEMA','ERROR',{event_id:event.event_id??null}));
    if(known.size&&(!known.has(event.definition_id)))findings.push(finding('UNKNOWN_EVENT_DEFINITION','ERROR',{event_id:event.event_id??null,definition_id:event.definition_id??null}));

    if(typeof event.event_id==='string'){
      const body=canonicalizeJson(event);
      const previous=eventBodies.get(event.event_id);
      if(previous!==undefined&&previous!==body)findings.push(finding('EVENT_ID_CONFLICT','ERROR',{event_ids:[event.event_id]}));
      else if(previous===undefined)eventBodies.set(event.event_id,body);
    }

    if(typeof event.origin_id==='string'&&Number.isInteger(event.origin_seq)){
      const key=`${event.origin_id}:${event.origin_seq}`;
      const previous=originSeq.get(key);
      if(previous&&previous!==event.event_id)findings.push(finding('ORIGIN_SEQ_CONFLICT','ERROR',{event_ids:[previous,event.event_id].sort(),origin_id:event.origin_id,origin_seq:event.origin_seq}));
      else if(!previous)originSeq.set(key,event.event_id);
    }

    if(event.definition_id==='learner.evidence.correction.recorded@1'){
      const target=event?.payload?.target_event_id;
      if(typeof target==='string'&&!ids.has(target))findings.push(finding('UNRESOLVED_CORRECTION_TARGET','ERROR',{event_id:event.event_id,target_event_id:target}));
    }
    if(event.definition_id==='learner.response.evaluated@1'){
      const target=event?.payload?.response_event_id;
      if(typeof target==='string'&&!ids.has(target))findings.push(finding('UNRESOLVED_EVALUATION_TARGET','ERROR',{event_id:event.event_id,target_event_id:target}));
    }
    if(event.definition_id==='learner.assessment.mutation.resolved@1'&&event?.payload?.decision==='STALE'){
      findings.push(finding('STALE_ASSESSMENT_MUTATION','WARNING',{event_id:event.event_id}));
    }

    if(typeof event.occurred_at==='string'&&typeof event.accepted_at==='string'){
      const occurred=Date.parse(event.occurred_at),accepted=Date.parse(event.accepted_at);
      if(Number.isFinite(occurred)&&Number.isFinite(accepted)&&occurred>accepted)findings.push(finding('CLOCK_DIVERGENCE','WARNING',{event_id:event.event_id}));
    }
  }

  if(Number.isInteger(context.previousProjectionWatermark)&&Number.isInteger(context.currentProjectionWatermark)&&context.currentProjectionWatermark<context.previousProjectionWatermark){
    findings.push(finding('PROJECTION_WATERMARK_REGRESSION','ERROR',{previous_watermark:context.previousProjectionWatermark,current_watermark:context.currentProjectionWatermark}));
  }
  return findings.sort(order);
}
