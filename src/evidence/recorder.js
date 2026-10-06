import { captureLocalEvidence } from './localCapture.js';

const UUID_V4=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ASSESSMENT_MODES=new Set(['section','mock']);

function clone(value){return value===undefined?undefined:structuredClone(value)}
function deepFreeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    for(const child of Object.values(value))deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
function requiredString(value,name){
  if(typeof value!=='string'||!value.trim())throw new TypeError(`${name} is required`);
  return value;
}
function optionalString(value,name){
  if(value===undefined)return undefined;
  return requiredString(value,name);
}
function nowIso(clock){
  const value=typeof clock==='function'?clock():clock?.now?.();
  const resolved=value===undefined?new Date():value;
  if(resolved instanceof Date){
    if(Number.isNaN(resolved.getTime()))throw new TypeError('clock must return a valid date-time');
    return resolved.toISOString();
  }
  if(typeof resolved==='string'&&!Number.isNaN(Date.parse(resolved)))return resolved;
  throw new TypeError('clock must return a Date or date-time string');
}
function uuidV4(cryptoImpl){
  if(typeof cryptoImpl?.randomUUID!=='function')throw new TypeError('crypto.randomUUID is required');
  const value=cryptoImpl.randomUUID();
  if(typeof value!=='string'||!UUID_V4.test(value))throw new TypeError('crypto.randomUUID must return UUIDv4');
  return value;
}
function definition(runtimeContext,eventName){
  const found=runtimeContext?.eventDefinitions?.find(item=>item?.event_name===eventName&&item?.event_version===1);
  if(!found)throw new Error(`Missing K3 event definition: ${eventName}@1`);
  return found;
}
function mismatch(claimed,stable,name){
  if(claimed!==undefined&&claimed!==stable)throw new Error(`${name} does not match frozen activity context`);
}
function copyOptional(target,source,keys){
  for(const key of keys)if(source[key]!==undefined)target[key]=clone(source[key]);
  return target;
}

export function createEvidenceRecorder({
  store,
  outbox,
  runtimeContext,
  clock=()=>new Date(),
  crypto=globalThis.crypto
}={}){
  if(!store||typeof store.captureLocal!=='function')throw new TypeError('EvidenceStore atomic captureLocal is required');
  if(!runtimeContext||typeof runtimeContext!=='object')throw new TypeError('runtimeContext is required');

  const activities=new Map();
  const interactions=new Map();

  async function capture(eventName,eventInput){
    return captureLocalEvidence({
      store,
      outbox,
      eventInput:{...eventInput,occurred_at:nowIso(clock)},
      definition:definition(runtimeContext,eventName),
      runtimeContext
    });
  }

  function normalizeSnapshot(input,mode,locale,releaseId){
    const raw=input.assessment_snapshot;
    if(!raw){
      if(ASSESSMENT_MODES.has(mode))throw new Error('Assessment mode requires frozen assessment_snapshot');
      return undefined;
    }
    const snapshot=deepFreeze(clone(raw));
    requiredString(snapshot.form_id,'assessment_snapshot.form_id');
    requiredString(snapshot.content_release_id,'assessment_snapshot.content_release_id');
    requiredString(snapshot.exam_profile_id,'assessment_snapshot.exam_profile_id');
    requiredString(snapshot.exam_profile_version,'assessment_snapshot.exam_profile_version');
    requiredString(snapshot.scoring_policy_version,'assessment_snapshot.scoring_policy_version');
    if(snapshot.content_release_id!==releaseId)throw new Error('Assessment snapshot content release mismatch');
    if(snapshot.locale!==undefined&&snapshot.locale!==locale)throw new Error('Assessment snapshot locale mismatch');
    return snapshot;
  }

  function commonFromInput(input,{generateActivity=false}={}){
    if(!input||typeof input!=='object')throw new TypeError('event context is required');
    const learner_id=requiredString(input.learner_id,'learner_id');
    const track_id=requiredString(input.track_id??runtimeContext.track?.id,'track_id');
    const mode=requiredString(input.mode,'mode');
    const locale=requiredString(input.locale,'locale');
    const releaseCandidate=input.content_release_id??input.assessment_snapshot?.content_release_id??runtimeContext.evidence?.content_release_id;
    const content_release_id=requiredString(releaseCandidate,'content_release_id');
    const activity_id=input.activity_id??(generateActivity?uuidV4(crypto):undefined);
    requiredString(activity_id,'activity_id');
    const assessment_snapshot=normalizeSnapshot(input,mode,locale,content_release_id);

    let assessment_attempt_id=input.assessment_attempt_id;
    let form_id=input.form_id??assessment_snapshot?.form_id;
    if(ASSESSMENT_MODES.has(mode)){
      assessment_attempt_id=assessment_attempt_id??(generateActivity?uuidV4(crypto):undefined);
      requiredString(assessment_attempt_id,'assessment_attempt_id');
      form_id=requiredString(form_id,'form_id');
    }

    return deepFreeze({
      learner_id,activity_id,track_id,content_release_id,mode,locale,
      ...(assessment_attempt_id?{assessment_attempt_id}:{}),
      ...(form_id?{form_id}:{}),
      ...(assessment_snapshot?{
        assessment_snapshot,
        exam_profile_ref:`${assessment_snapshot.exam_profile_id}@${assessment_snapshot.exam_profile_version}`,
        scoring_policy_ref:assessment_snapshot.scoring_policy_version
      }:{})
    });
  }

  function resolveActivity(input){
    const id=requiredString(input?.activity_id,'activity_id');
    const existing=activities.get(id);
    if(existing){
      for(const key of ['learner_id','track_id','content_release_id','mode','locale','assessment_attempt_id','form_id']){
        mismatch(input[key],existing[key],key);
      }
      if(input.assessment_snapshot){
        mismatch(input.assessment_snapshot.content_release_id,existing.content_release_id,'content_release_id');
        mismatch(input.assessment_snapshot.form_id,existing.form_id,'form_id');
        mismatch(input.assessment_snapshot.exam_profile_id,existing.exam_profile_ref,'exam_profile_ref');
        mismatch(input.assessment_snapshot.scoring_policy_version,existing.scoring_policy_ref,'scoring_policy_ref');
      }
      return existing;
    }
    if(input?.activity_context){
      const restored=commonFromInput({...input.activity_context,activity_id:id},{generateActivity:false});
      activities.set(id,restored);
      return restored;
    }
    throw new Error('Unknown activity_id; resume requires explicit activity_context');
  }

  function baseEvent(activity){
    const out={
      learner_id:activity.learner_id,
      activity_id:activity.activity_id,
      track_id:activity.track_id,
      content_release_id:activity.content_release_id,
      mode:activity.mode,
      locale:activity.locale
    };
    if(activity.assessment_attempt_id)out.assessment_attempt_id=activity.assessment_attempt_id;
    if(activity.form_id)out.form_id=activity.form_id;
    return out;
  }

  function resolveInteraction(input,activity){
    const id=requiredString(input?.item_interaction_id,'item_interaction_id');
    const existing=interactions.get(id);
    if(existing){
      if(existing.activity_id!==activity.activity_id)throw new Error('item_interaction_id belongs to another activity');
      mismatch(input.item_version_id,existing.item_version_id,'item_version_id');
      return existing;
    }
    if(input?.item_context){
      const restored=deepFreeze({
        activity_id:activity.activity_id,
        item_interaction_id:id,
        question_family_id:requiredString(input.item_context.question_family_id,'question_family_id'),
        item_version_id:requiredString(input.item_context.item_version_id,'item_version_id'),
        objective_id:requiredString(input.item_context.objective_id,'objective_id'),
        domain_id:requiredString(input.item_context.domain_id,'domain_id')
      });
      interactions.set(id,restored);
      return restored;
    }
    throw new Error('Unknown item_interaction_id; resume requires explicit item_context');
  }

  function itemEvent(activity,interaction){
    return {
      ...baseEvent(activity),
      item_interaction_id:interaction.item_interaction_id,
      question_family_id:interaction.question_family_id,
      item_version_id:interaction.item_version_id,
      objective_id:interaction.objective_id,
      domain_id:interaction.domain_id
    };
  }

  async function startActivity(input){
    const activity=commonFromInput(input,{generateActivity:true});
    if(activities.has(activity.activity_id))throw new Error('activity_id is already active');
    const payload=input.source===undefined?{}:{source:requiredString(input.source,'source')};
    const result=await capture('learner.activity.started',{...baseEvent(activity),payload});
    activities.set(activity.activity_id,activity);
    return result;
  }

  async function presentItem(input){
    const activity=resolveActivity(input);
    const item_interaction_id=input.item_interaction_id??uuidV4(crypto);
    if(interactions.has(item_interaction_id))throw new Error('item_interaction_id is already recorded');
    const interaction=deepFreeze({
      activity_id:activity.activity_id,
      item_interaction_id,
      question_family_id:requiredString(input.question_family_id,'question_family_id'),
      item_version_id:requiredString(input.item_version_id,'item_version_id'),
      objective_id:requiredString(input.objective_id,'objective_id'),
      domain_id:requiredString(input.domain_id,'domain_id')
    });
    const eventInput=copyOptional({...itemEvent(activity,interaction),payload:{}},input,['elapsed_ms']);
    const result=await capture('learner.item.presented',eventInput);
    interactions.set(item_interaction_id,interaction);
    return result;
  }

  async function recordResponse(input){
    const activity=resolveActivity(input);
    const interaction=resolveInteraction(input,activity);
    if(!input.response||typeof input.response!=='object')throw new TypeError('response is required');
    if(ASSESSMENT_MODES.has(activity.mode)){
      const base=input.base_attempt_revision;
      const proposed=input.proposed_attempt_revision;
      if(!Number.isInteger(base)||base<0||!Number.isInteger(proposed)||proposed!==base+1){
        throw new Error('Strict assessment response requires base_attempt_revision and proposed_attempt_revision = base_attempt_revision + 1');
      }
    }
    const eventInput=copyOptional(
      {...itemEvent(activity,interaction),payload:clone(input.response)},
      input,
      ['elapsed_ms','base_attempt_revision','proposed_attempt_revision']
    );
    return capture('learner.response.recorded',eventInput);
  }

  async function recordConfidence(input){
    const activity=resolveActivity(input);
    const interaction=resolveInteraction(input,activity);
    const eventInput=copyOptional(
      {...itemEvent(activity,interaction),payload:{confidence:requiredString(input.confidence,'confidence')}},
      input,
      ['elapsed_ms','base_attempt_revision','proposed_attempt_revision']
    );
    return capture('learner.confidence.recorded',eventInput);
  }

  async function requestHint(input){
    const activity=resolveActivity(input);
    const interaction=resolveInteraction(input,activity);
    const payload=input.hint_ref===undefined?{}:{hint_ref:requiredString(input.hint_ref,'hint_ref')};
    return capture('learner.hint.requested',copyOptional({...itemEvent(activity,interaction),payload},input,['elapsed_ms']));
  }

  async function openExplanation(input){
    const activity=resolveActivity(input);
    const interaction=resolveInteraction(input,activity);
    const payload=input.explanation_ref===undefined?{}:{explanation_ref:requiredString(input.explanation_ref,'explanation_ref')};
    return capture('learner.explanation.opened',copyOptional({...itemEvent(activity,interaction),payload},input,['elapsed_ms']));
  }

  async function submitAssessment(input){
    const activity=resolveActivity(input);
    if(!activity.assessment_attempt_id||!activity.form_id||!activity.exam_profile_ref||!activity.scoring_policy_ref){
      throw new Error('Assessment submission requires frozen assessment context');
    }
    mismatch(input.exam_profile_ref,activity.exam_profile_ref,'exam_profile_ref');
    mismatch(input.scoring_policy_ref,activity.scoring_policy_ref,'scoring_policy_ref');
    return capture('learner.assessment.submitted',{
      ...baseEvent(activity),
      payload:{
        exam_profile_ref:activity.exam_profile_ref,
        scoring_policy_ref:activity.scoring_policy_ref
      }
    });
  }

  async function recordEvaluation(){
    throw new Error('Trusted SYSTEM producer authority is required for learner.response.evaluated@1');
  }

  return Object.freeze({
    startActivity,
    presentItem,
    recordResponse,
    recordConfidence,
    requestHint,
    openExplanation,
    submitAssessment,
    recordEvaluation
  });
}
