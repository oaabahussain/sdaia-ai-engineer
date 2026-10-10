// Non-strict public one-question adapter. K3 recorder remains the only evidence writer.
const RUNS=new WeakMap();
function accepted(result,label){
  if(!result?.receipt || !['ACCEPTED','DUPLICATE'].includes(result.receipt.disposition))
    throw new Error(label+' requires a durable accepted receipt');
  return result;
}
function validCandidate(candidate,trackId,releaseId,objectives){
  if(!candidate || candidate.action_type!=='PRACTICE_ONE' ||
     candidate.route_mode!=='practice' || candidate.track_id!==trackId ||
     candidate.release_id!==releaseId ||
     typeof candidate.question_family_id!=='string' ||
     candidate.item_version_id!==candidate.question_family_id+'.v1' ||
     !candidate.question_family_id.startsWith(trackId+'.') ||
     !objectives || objectives.track_id!==trackId || !Array.isArray(objectives.objectives))
    throw new TypeError('K4 public practice candidate identity is invalid');
  const objective=objectives.objectives.find(o=>o.objective_id===candidate.objective_id);
  if(!objective || objective.track_id!==trackId || objective.domain_id!==candidate.domain_id ||
     !Array.isArray(objective.concept_ids) ||
     !objective.concept_ids.some(c=>candidate.question_family_id.startsWith(trackId+'.'+c+'.')))
    throw new TypeError('K4 practice objective is not governed');
}
export function createPracticeSession({recorder,learnerId,trackId,releaseId,locale,candidate,objectives}={}){
  if(!recorder || !['startActivity','presentItem','recordResponse'].every(m=>typeof recorder[m]==='function') ||
     typeof learnerId!=='string'||!learnerId ||
     typeof releaseId!=='string'||!releaseId ||
     !['ar','en'].includes(locale))
    throw new TypeError('K4 practice requires recorder, identity and supported locale');
  validCandidate(candidate,trackId,releaseId,objectives);
  const session={
    schema_version:1,session_type:'PracticeSessionV1',mode:'practice',
    learner_id:learnerId,track_id:trackId,content_release_id:releaseId,locale,
    candidate:structuredClone(candidate),activity_id:null,item_interaction_id:null,
    start_receipt:null,presentation_receipt:null,response_receipt:null
  };
  RUNS.set(session,{present:null,answer:null,responseIndex:null});
  return session;
}
export async function presentPracticeItem({recorder,session,expectedSourceHead,expectedPreferencesRevision}={}){
  const run=RUNS.get(session);
  if(!run || !recorder?.startActivity || !recorder?.presentItem)throw new TypeError('K4 practice session invalid');
  if(session.presentation_receipt)return session.presentation_receipt;
  if(run.present)return run.present;
  run.present=(async()=>{
    if(expectedSourceHead!==undefined){
      if(typeof recorder.startPracticeItem!=='function')
        throw new Error('K4 guarded practice requires atomic presentation');
      const c=session.candidate;
      const pair=await recorder.startPracticeItem({
        learner_id:session.learner_id,track_id:session.track_id,
        content_release_id:session.content_release_id,mode:'practice',
        locale:session.locale,source:'browser',
        question_family_id:c.question_family_id,item_version_id:c.item_version_id,
        objective_id:c.objective_id,domain_id:c.domain_id,
        expectedSourceHead,expectedPreferencesRevision
      });
      // Both receipts were committed atomically. Never mark either durable
      // if their shared transaction aborted.
      const started=accepted(pair?.started,'K4 atomic activity start');
      const shown=accepted(pair?.presented,'K4 atomic item presentation');
      session.start_receipt=started;
      session.activity_id=started.event.activity_id;
      session.presentation_receipt=shown;
      session.item_interaction_id=shown.event.item_interaction_id;
      return shown;
    }
    if(!session.start_receipt){
      const started=accepted(await recorder.startActivity({
        learner_id:session.learner_id,track_id:session.track_id,
        content_release_id:session.content_release_id,mode:'practice',
        locale:session.locale,source:'browser',...(expectedSourceHead===undefined?{}:{expectedSourceHead})
      }),'K4 activity start');
      if(typeof started.event?.activity_id!=='string')throw new Error('K4 activity ID missing');
      session.start_receipt=started;session.activity_id=started.event.activity_id;
    }
    const c=session.candidate;
    const shown=accepted(await recorder.presentItem({
      activity_id:session.activity_id,question_family_id:c.question_family_id,
      item_version_id:c.item_version_id,objective_id:c.objective_id,
      domain_id:c.domain_id
    }),'K4 item presentation');
    if(typeof shown.event?.item_interaction_id!=='string')throw new Error('K4 interaction ID missing');
    session.item_interaction_id=shown.event.item_interaction_id;
    session.presentation_receipt=shown;
    return shown;
  })();
  try{return await run.present}finally{run.present=null}
}
export async function recordPracticeResponse({recorder,session,optionIndex}={}){
  const run=RUNS.get(session);
  if(!run||!recorder?.recordResponse)throw new TypeError('K4 practice session invalid');
  if(!session.presentation_receipt)throw new Error('K4 item must be presented before response');
  if(!Number.isSafeInteger(optionIndex)||optionIndex<0||optionIndex>3)
    throw new RangeError('K4 canonical response option invalid');
  if(session.response_receipt){
    if(run.responseIndex!==optionIndex)throw new Error('K4 practice response already recorded');
    return session.response_receipt;
  }
  if(run.answer){
    if(run.responseIndex!==optionIndex)throw new Error('K4 concurrent response mismatch');
    return run.answer;
  }
  run.responseIndex=optionIndex;
  run.answer=(async()=>{
    const recorded=accepted(await recorder.recordResponse({
      activity_id:session.activity_id,item_interaction_id:session.item_interaction_id,
      response:{response_version:1,response_kind:'OPTION',response:{option_index:optionIndex}}
    }),'K4 response');
    session.response_receipt=recorded;
    return recorded;
  })();
  try{return await run.answer}finally{run.answer=null;if(!session.response_receipt)run.responseIndex=null}
}
