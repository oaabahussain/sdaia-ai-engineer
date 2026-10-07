import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { assertLearningEventExchangePort, assertLearningEventExchangeResult } from './ports.js';

const DEFAULT_MAPPING=JSON.parse(readFileSync(new URL('../../../data/evidence/mappings/caliper-v1.json',import.meta.url),'utf8'));
const STRICT_MODES=new Set(['section','mock']);

function clone(value){return structuredClone(value);}
function nonEmpty(value){return typeof value==='string'&&value.trim().length>0;}
function uuid4(value){return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);}
function obviousPii(value){return !nonEmpty(value)||/@/.test(value)||/^\+?\d[\d\s().-]{6,}$/.test(value);}
function iri(base,value){return base+encodeURIComponent(value);}
function report(mapping,extras={}){
  return {
    mapping_version:mapping.mapping_version,
    mapped_ids:[],
    omissions:[],
    rejections:[],
    provenance:{
      adapter_id:mapping.adapter_id,
      adapter_version:mapping.adapter_version,
      source_standard:mapping.standard,
      source_version:mapping.standard_version
    },
    ...extras
  };
}
function actor(event,mapping){
  if(obviousPii(event?.learner_id))return null;
  return {id:iri(mapping.bases.learner,event.learner_id),type:'Person'};
}
function attempt(event,mapping){
  if(!nonEmpty(event?.assessment_attempt_id))return null;
  return {id:iri(mapping.bases.attempt,event.assessment_attempt_id),type:'Attempt'};
}
function assessment(event,mapping){
  return {id:iri(mapping.bases.assessment,event.activity_id),type:'Assessment'};
}
function item(event,mapping){
  return {id:iri(mapping.bases.item,event.item_version_id),type:'AssessmentItem'};
}
function response(event,mapping){
  const payload=event?.payload;
  if(payload?.response_kind!=='OPTION'||!Number.isSafeInteger(payload?.response?.option_index)||payload.response.option_index<0)return null;
  return {
    id:iri(mapping.bases.response,event.event_id),
    type:'Response',
    value:String(payload.response.option_index)
  };
}
function exportOne(event,mapping){
  if(!event||typeof event!=='object'||!uuid4(event.event_id))return {kind:'reject',reason_code:'INVALID_EVENT_ID'};
  const who=actor(event,mapping);
  if(!who)return {kind:'reject',reason_code:'PII_OR_INVALID_PSEUDONYM'};
  if(!nonEmpty(event.occurred_at))return {kind:'reject',reason_code:'INVALID_REQUIRED_CONTEXT'};
  const rule=mapping.events[event.definition_id];
  if(!rule)return {kind:'omit',reason_code:'UNSUPPORTED_SEMANTICS'};
  const base={
    '@context':mapping.context,
    id:`urn:uuid:${event.event_id}`,
    type:rule.type,
    actor:who,
    action:rule.action,
    eventTime:event.occurred_at
  };
  if(rule.type==='AssessmentEvent'){
    base.object=assessment(event,mapping);
    const generated=attempt(event,mapping);
    if(!generated)return {kind:'reject',reason_code:'INVALID_REQUIRED_CONTEXT'};
    base.generated=generated;
    return {kind:'map',value:base};
  }
  if(!nonEmpty(event.item_version_id))return {kind:'reject',reason_code:'INVALID_REQUIRED_CONTEXT'};
  base.object=item(event,mapping);
  if(rule.action==='Skipped')return {kind:'map',value:base};
  if(rule.generated==='Attempt'){
    const generated=attempt(event,mapping);
    if(!generated)return {kind:'reject',reason_code:'INVALID_REQUIRED_CONTEXT'};
    base.generated=generated;
    return {kind:'map',value:base};
  }
  if(rule.generated==='Response'){
    const generated=response(event,mapping);
    const target=attempt(event,mapping);
    if(!generated)return {kind:'omit',reason_code:'UNSUPPORTED_RESPONSE_KIND'};
    if(!target)return {kind:'reject',reason_code:'INVALID_REQUIRED_CONTEXT'};
    base.generated=generated;
    base.target=target;
    return {kind:'map',value:base};
  }
  return {kind:'omit',reason_code:'UNSUPPORTED_SEMANTICS'};
}
function externalId(event,index){return nonEmpty(event?.id)?event.id:`caliper:index:${index}`;}
function actorLearner(event,mapping){
  if(event?.actor?.type!=='Person'||!nonEmpty(event?.actor?.id))return null;
  const prefix=mapping.bases.learner;
  if(!event.actor.id.startsWith(prefix))return null;
  let value;
  try{value=decodeURIComponent(event.actor.id.slice(prefix.length));}catch{return null;}
  return obviousPii(value)?null:value;
}
function requiredContext(context){
  return context&&['learner_id','activity_id','track_id','content_release_id','mode','locale','item_interaction_id','item_version_id']
    .every(key=>nonEmpty(context[key]));
}
function strictContext(context){
  if(!STRICT_MODES.has(context.mode))return true;
  return nonEmpty(context.assessment_attempt_id)
    && nonEmpty(context.form_id)
    && Number.isSafeInteger(context.base_attempt_revision)
    && context.base_attempt_revision>=0
    && Number.isSafeInteger(context.proposed_attempt_revision)
    && context.proposed_attempt_revision===context.base_attempt_revision+1;
}
function responseIndex(event){
  if(event?.type!=='AssessmentItemEvent'||event?.action!=='Completed'||event?.generated?.type!=='Response')return null;
  const raw=event.generated.value;
  if(typeof raw!=='string'||!/^\d+$/.test(raw))return null;
  const n=Number(raw);
  return Number.isSafeInteger(n)?n:null;
}
function importResponse(external,context,{mapping,crypto,importerOriginId,nextOriginSeq}){
  if(!requiredContext(context))return {kind:'stage',reason_code:'MISSING_K3_CONTEXT'};
  if(!strictContext(context))return {kind:'stage',reason_code:'MISSING_REVISION_CONTEXT'};
  const learner=actorLearner(external,mapping);
  if(!learner||learner!==context.learner_id)return {kind:'reject',reason_code:'PII_OR_LEARNER_CONTEXT_MISMATCH'};
  if(!nonEmpty(external.eventTime))return {kind:'stage',reason_code:'MISSING_SOURCE_TIMESTAMP'};
  const optionIndex=responseIndex(external);
  if(optionIndex===null)return {kind:'omit',reason_code:'UNSUPPORTED_SEMANTICS'};
  if(!uuid4(importerOriginId)||typeof nextOriginSeq!=='function')return {kind:'stage',reason_code:'MISSING_IMPORTER_CONTEXT'};
  const originSeq=nextOriginSeq();
  if(!Number.isSafeInteger(originSeq)||originSeq<1)return {kind:'reject',reason_code:'INVALID_IMPORTER_SEQUENCE'};
  const eventId=crypto.randomUUID();
  if(!uuid4(eventId))return {kind:'reject',reason_code:'INVALID_IMPORT_EVENT_ID'};
  const event={
    schema_version:2,
    event_id:eventId,
    definition_id:'learner.response.recorded@1',
    learner_id:context.learner_id,
    origin_id:importerOriginId,
    origin_seq:originSeq,
    activity_id:context.activity_id,
    track_id:context.track_id,
    content_release_id:context.content_release_id,
    mode:context.mode,
    locale:context.locale,
    occurred_at:external.eventTime,
    payload:{response_version:1,response_kind:'OPTION',response:{option_index:optionIndex}},
    item_interaction_id:context.item_interaction_id,
    item_version_id:context.item_version_id
  };
  for(const key of ['question_family_id','objective_id','domain_id'])if(nonEmpty(context[key]))event[key]=context[key];
  if(STRICT_MODES.has(context.mode)){
    event.assessment_attempt_id=context.assessment_attempt_id;
    event.form_id=context.form_id;
    event.base_attempt_revision=context.base_attempt_revision;
    event.proposed_attempt_revision=context.proposed_attempt_revision;
  }else if(nonEmpty(context.assessment_attempt_id)){
    event.assessment_attempt_id=context.assessment_attempt_id;
    if(nonEmpty(context.form_id))event.form_id=context.form_id;
  }
  return {kind:'map',value:event};
}

export function createCaliperAdapter({mapping=DEFAULT_MAPPING,crypto={randomUUID}}={}){
  const governed=clone(mapping);
  if(governed?.mapping_version!=='caliper-k3.v1'||governed?.standard!=='Caliper'||governed?.standard_version!=='1.2'){
    throw new TypeError('Unsupported Caliper mapping artifact');
  }
  const adapter={
    exportEvents(events=[]){
      if(!Array.isArray(events))throw new TypeError('events must be an array');
      const out=report(governed,{events:[]});
      events.forEach((event,index)=>{
        const result=exportOne(event,governed);
        const id=nonEmpty(event?.event_id)?event.event_id:`event:index:${index}`;
        if(result.kind==='map'){
          out.events.push(result.value);
          out.mapped_ids.push({source_id:id,target_id:result.value.id});
        }else{
          out[result.kind==='reject'?'rejections':'omissions'].push({source_id:id,reason_code:result.reason_code});
        }
      });
      return assertLearningEventExchangeResult(out);
    },
    importEvents(events=[],options={}){
      if(!Array.isArray(events))throw new TypeError('events must be an array');
      const out=report(governed,{events:[],staged:[]});
      events.forEach((external,index)=>{
        const id=externalId(external,index);
        const context=options.contextByExternalId?.[id];
        if(!context){
          out.staged.push({source_id:id,reason_code:'MISSING_K3_CONTEXT'});
          return;
        }
        const result=importResponse(external,context,{
          mapping:governed,
          crypto,
          importerOriginId:options.importerOriginId,
          nextOriginSeq:options.nextOriginSeq
        });
        if(result.kind==='map'){
          out.events.push(result.value);
          out.mapped_ids.push({
            source_id:id,
            target_id:result.value.event_id,
            source_occurred_at:external.eventTime,
            importer_order_only:true
          });
        }else if(result.kind==='stage'){
          out.staged.push({source_id:id,reason_code:result.reason_code});
        }else{
          out[result.kind==='reject'?'rejections':'omissions'].push({source_id:id,reason_code:result.reason_code});
        }
      });
      return assertLearningEventExchangeResult(out);
    }
  };
  return assertLearningEventExchangePort(adapter);
}
