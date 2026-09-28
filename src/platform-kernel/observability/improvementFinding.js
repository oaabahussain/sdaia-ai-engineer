import { isValidatedEvent } from './eventRegistry.js';

function deepFreeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    for(const nested of Object.values(value))deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

export function createImprovementFinding(input={}){
  if(!isValidatedEvent(input.signal))throw new Error('Validated signal is required');
  if(input.hypothesis?.causal!==false)throw new Error('Improvement finding hypothesis cannot assert causal truth');
  if(!Array.isArray(input.evidenceRefs)||input.evidenceRefs.length===0)throw new Error('Evidence refs are required');
  if(!input.scope?.kind||!input.scope?.ref)throw new Error('Finding scope is required');

  return deepFreeze({
    schema_version:1,
    finding_id:input.findingId,
    observed_signal:{
      signal_type:input.signalType,
      signal_ref:input.signal.definition_id,
      summary:input.summary
    },
    evidence_refs:[...input.evidenceRefs],
    scope:structuredClone(input.scope),
    uncertainty:structuredClone(input.uncertainty),
    hypothesis:structuredClone(input.hypothesis),
    counter_evidence:[...(input.counterEvidence??[])],
    recommended_investigation:input.recommendedInvestigation,
    recommended_experiment:input.recommendedExperiment??null,
    expected_impact:input.expectedImpact,
    owner:input.owner,
    status:'CANDIDATE',
    created_at:input.createdAt
  });
}
