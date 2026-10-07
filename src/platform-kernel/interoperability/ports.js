function need(o,n,label){if(!o||typeof o[n]!=='function')throw new Error(`${label} must implement ${n}()`);return o}
function nonEmptyString(value,label){if(typeof value!=='string'||!value.trim())throw new Error(`${label} is required`);return value}
function rows(value,label){if(!Array.isArray(value))throw new Error(`${label} must be an array`);return value}
function mappedRows(value){
  for(const row of rows(value,'mapped_ids')){
    nonEmptyString(row?.source_id,'mapped source_id');
    nonEmptyString(row?.target_id,'mapped target_id');
  }
}
function dispositionRows(value,label){
  for(const row of rows(value,label)){
    if(row?.source_id!==undefined)nonEmptyString(row.source_id,`${label} source_id`);
    nonEmptyString(row?.reason_code,`${label} reason_code`);
  }
}
function provenance(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('provenance is required');
  nonEmptyString(value.adapter_id,'provenance adapter_id');
  nonEmptyString(value.adapter_version,'provenance adapter_version');
  nonEmptyString(value.source_standard,'provenance source_standard');
  nonEmptyString(value.source_version,'provenance source_version');
}

export function assertAssessmentExchangePort(o){need(o,'exportAssessment','AssessmentExchangePort');need(o,'importAssessment','AssessmentExchangePort');return o}
export function assertCompetencyExchangePort(o){need(o,'exportCompetencies','CompetencyExchangePort');need(o,'importCompetencies','CompetencyExchangePort');return o}
export function assertLearningEventExchangePort(o){need(o,'exportEvents','LearningEventExchangePort');need(o,'importEvents','LearningEventExchangePort');return o}

export function assertLearningEventExchangeResult(result){
  if(!result||typeof result!=='object'||Array.isArray(result))throw new Error('LearningEventExchange result is required');
  nonEmptyString(result.mapping_version,'mapping_version');
  mappedRows(result.mapped_ids);
  dispositionRows(result.omissions,'omissions');
  dispositionRows(result.rejections,'rejections');
  provenance(result.provenance);
  return result;
}
