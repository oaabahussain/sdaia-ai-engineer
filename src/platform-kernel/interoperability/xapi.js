import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { assertLearningEventExchangePort, assertLearningEventExchangeResult } from './ports.js';

const DEFAULT_MAPPING = JSON.parse(readFileSync(new URL('../../../data/evidence/mappings/xapi-v1.json', import.meta.url), 'utf8'));
const STRICT_MODES = new Set(['section', 'mock']);
const ANSWERED = 'http://adlnet.gov/expapi/verbs/answered';

function clone(value){ return structuredClone(value); }
function nonEmpty(value){ return typeof value === 'string' && value.trim().length > 0; }
function uuid4(value){ return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
function obviousPii(value){
  if(!nonEmpty(value)) return true;
  return /@/.test(value) || /^\+?\d[\d\s().-]{6,}$/.test(value);
}
function iri(base,value){ return base + encodeURIComponent(value); }
function sourceId(value,index){ return nonEmpty(value?.id) ? value.id : `xapi:index:${index}`; }
function report(mapping, extras={}){
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
  if(obviousPii(event?.learner_id)) return null;
  return {
    objectType:'Agent',
    account:{homePage:mapping.actor_account_home_page,name:event.learner_id}
  };
}
function objectFor(event,mapping){
  if(nonEmpty(event?.item_version_id)){
    return {objectType:'Activity',id:iri(mapping.item_base_iri,event.item_version_id)};
  }
  return {objectType:'Activity',id:iri(mapping.activity_base_iri,event.activity_id)};
}
function baseStatement(event,mapping,verb){
  const statement={
    id:event.event_id,
    actor:actor(event,mapping),
    verb:{id:verb},
    object:objectFor(event,mapping),
    timestamp:event.occurred_at
  };
  if(nonEmpty(event.assessment_attempt_id)) statement.context={registration:event.assessment_attempt_id};
  return statement;
}
function exportOne(event,mapping){
  if(!event || typeof event !== 'object' || !uuid4(event.event_id)){
    return {kind:'reject',reason_code:'INVALID_EVENT_ID'};
  }
  if(!actor(event,mapping)) return {kind:'reject',reason_code:'PII_OR_INVALID_PSEUDONYM'};
  if(!nonEmpty(event.occurred_at)) return {kind:'reject',reason_code:'INVALID_REQUIRED_CONTEXT'};

  if(event.definition_id === 'learner.response.recorded@1'){
    const response=event.payload?.response;
    if(event.payload?.response_kind !== 'OPTION' || !Number.isSafeInteger(response?.option_index) || response.option_index < 0){
      return {kind:'omit',reason_code:'UNSUPPORTED_RESPONSE_KIND'};
    }
    const statement=baseStatement(event,mapping,mapping.verbs[event.definition_id]);
    statement.result={response:String(response.option_index)};
    return {kind:'map',value:statement};
  }

  if(event.definition_id === 'learner.response.evaluated@1'){
    const payload=event.payload ?? {};
    if(payload.evaluation_status !== 'GRADED' || typeof payload.correct !== 'boolean'){
      return {kind:'omit',reason_code:'UNSUPPORTED_EVALUATION_STATUS'};
    }
    const statement=baseStatement(event,mapping,payload.correct?mapping.verbs.evaluation_passed:mapping.verbs.evaluation_failed);
    statement.result={success:payload.correct};
    if(typeof payload.score === 'number' && Number.isFinite(payload.score)) statement.result.score={raw:payload.score};
    return {kind:'map',value:statement};
  }

  const verb=mapping.verbs[event.definition_id];
  if(!verb) return {kind:'omit',reason_code:'UNSUPPORTED_SEMANTICS'};
  const statement=baseStatement(event,mapping,verb);
  return {kind:'map',value:statement};
}

function actorLearner(statement,mapping){
  const actor=statement?.actor;
  if(actor?.objectType !== 'Agent' || !nonEmpty(actor?.account?.name) || !nonEmpty(actor?.account?.homePage)) return null;
  if(actor.account.homePage !== mapping.actor_account_home_page) return null;
  if(actor.mbox !== undefined || actor.name !== undefined || obviousPii(actor.account.name)) return null;
  return actor.account.name;
}
function requiredContext(context){
  const required=['learner_id','activity_id','track_id','content_release_id','mode','locale','item_interaction_id','item_version_id'];
  return context && required.every(key=>nonEmpty(context[key]));
}
function strictContext(context){
  if(!STRICT_MODES.has(context.mode)) return true;
  return nonEmpty(context.assessment_attempt_id)
    && nonEmpty(context.form_id)
    && Number.isSafeInteger(context.base_attempt_revision)
    && context.base_attempt_revision >= 0
    && Number.isSafeInteger(context.proposed_attempt_revision)
    && context.proposed_attempt_revision === context.base_attempt_revision + 1;
}
function answerIndex(statement){
  const raw=statement?.result?.response;
  if(typeof raw !== 'string' || !/^\d+$/.test(raw)) return null;
  const n=Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}
function importAnswered(statement, context, {mapping, crypto, importerOriginId, nextOriginSeq}){
  if(!requiredContext(context)) return {kind:'stage',reason_code:'MISSING_K3_CONTEXT'};
  if(!strictContext(context)) return {kind:'stage',reason_code:'MISSING_REVISION_CONTEXT'};
  const learner=actorLearner(statement,mapping);
  if(!learner || learner !== context.learner_id) return {kind:'reject',reason_code:'PII_OR_LEARNER_CONTEXT_MISMATCH'};
  const expectedObjectId=iri(mapping.item_base_iri,context.item_version_id);
  if(statement?.object?.objectType !== 'Activity' || statement.object.id !== expectedObjectId){
    return {kind:'reject',reason_code:'EXTERNAL_CONTEXT_MISMATCH'};
  }
  if(STRICT_MODES.has(context.mode) && statement?.context?.registration !== context.assessment_attempt_id){
    return {kind:'reject',reason_code:'EXTERNAL_CONTEXT_MISMATCH'};
  }
  if(nonEmpty(statement?.context?.registration) && nonEmpty(context.assessment_attempt_id) && statement.context.registration !== context.assessment_attempt_id){
    return {kind:'reject',reason_code:'EXTERNAL_CONTEXT_MISMATCH'};
  }
  if(!nonEmpty(statement.timestamp)) return {kind:'stage',reason_code:'MISSING_SOURCE_TIMESTAMP'};
  const optionIndex=answerIndex(statement);
  if(optionIndex === null) return {kind:'omit',reason_code:'UNSUPPORTED_RESPONSE_ENCODING'};
  if(!uuid4(importerOriginId) || typeof nextOriginSeq !== 'function') return {kind:'stage',reason_code:'MISSING_IMPORTER_CONTEXT'};
  const originSeq=nextOriginSeq();
  if(!Number.isSafeInteger(originSeq) || originSeq < 1) return {kind:'reject',reason_code:'INVALID_IMPORTER_SEQUENCE'};
  const eventId=crypto.randomUUID();
  if(!uuid4(eventId)) return {kind:'reject',reason_code:'INVALID_IMPORT_EVENT_ID'};
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
    occurred_at:statement.timestamp,
    payload:{response_version:1,response_kind:'OPTION',response:{option_index:optionIndex}},
    item_interaction_id:context.item_interaction_id,
    item_version_id:context.item_version_id
  };
  for(const key of ['question_family_id','objective_id','domain_id']){
    if(nonEmpty(context[key])) event[key]=context[key];
  }
  if(STRICT_MODES.has(context.mode)){
    event.assessment_attempt_id=context.assessment_attempt_id;
    event.form_id=context.form_id;
    event.base_attempt_revision=context.base_attempt_revision;
    event.proposed_attempt_revision=context.proposed_attempt_revision;
  } else if(nonEmpty(context.assessment_attempt_id)){
    event.assessment_attempt_id=context.assessment_attempt_id;
    if(nonEmpty(context.form_id)) event.form_id=context.form_id;
  }
  return {kind:'map',value:event};
}

export function createXapiAdapter({mapping=DEFAULT_MAPPING,crypto={randomUUID}}={}){
  const governed=clone(mapping);
  if(governed?.mapping_version !== 'xapi-k3.v1' || governed?.standard !== 'xAPI' || governed?.standard_version !== '2.0'){
    throw new TypeError('Unsupported xAPI mapping artifact');
  }
  const adapter={
    exportEvents(events=[]){
      if(!Array.isArray(events)) throw new TypeError('events must be an array');
      const out=report(governed,{statements:[]});
      events.forEach((event,index)=>{
        const result=exportOne(event,governed);
        const id=nonEmpty(event?.event_id)?event.event_id:`event:index:${index}`;
        if(result.kind==='map'){
          out.statements.push(result.value);
          out.mapped_ids.push({source_id:id,target_id:result.value.id});
        }else{
          out[result.kind==='reject'?'rejections':'omissions'].push({source_id:id,reason_code:result.reason_code});
        }
      });
      return assertLearningEventExchangeResult(out);
    },
    importEvents(statements=[],options={}){
      if(!Array.isArray(statements)) throw new TypeError('statements must be an array');
      const out=report(governed,{events:[],staged:[]});
      statements.forEach((statement,index)=>{
        const id=sourceId(statement,index);
        const context=options.contextByExternalId?.[id];
        if(!context){
          out.staged.push({source_id:id,reason_code:'MISSING_K3_CONTEXT'});
          return;
        }
        if(statement?.verb?.id !== ANSWERED){
          out.omissions.push({source_id:id,reason_code:'UNSUPPORTED_SEMANTICS'});
          return;
        }
        const result=importAnswered(statement,context,{
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
            source_occurred_at:statement.timestamp,
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
