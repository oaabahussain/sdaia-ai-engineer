function deepFreeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const v of Object.values(value))deepFreeze(v);Object.freeze(value)}return value}

export function createAssessmentFormSnapshot(input){
 if(!input?.form_id||!input?.content_release_id)throw new Error('Assessment form identity is required');
 const ids=[...(input.item_version_ids||[])];
 if(!ids.length||new Set(ids).size!==ids.length)throw new Error('Assessment form requires unique item versions');
 return deepFreeze(structuredClone({...input,item_version_ids:ids}));
}

export function createBrowserAssessmentContext(input){
 const uiMode=input?.ui_mode;
 const evidenceMode=uiMode==='full'?'mock':uiMode;
 if(evidenceMode!=='mock'&&evidenceMode!=='section')throw new Error('Browser strict assessment mode must be full or section');
 const assessmentSnapshot=createAssessmentFormSnapshot({
  schema_version:1,
  form_id:input.form_id,
  content_release_id:input.content_release_id,
  exam_profile_id:input.exam_profile_id,
  exam_profile_version:String(input.exam_profile_version),
  scoring_policy_version:input.scoring_policy_ref,
  item_version_ids:input.item_version_ids,
  option_orders:input.option_orders,
  locale:input.locale,
  started_at:input.started_at
 });
 return deepFreeze({ui_mode:uiMode,evidence_mode:evidenceMode,assessment_snapshot:assessmentSnapshot});
}
