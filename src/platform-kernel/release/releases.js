import { isTrustedActivationEvaluation } from './activationEvidence.js';
import crypto from 'node:crypto';
import { isEvaluatedActivationDecision } from './activationEvidence.js';
function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object'){return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}'}return JSON.stringify(value)}
export function contentHash(value){return crypto.createHash('sha256').update(canonical(value)).digest('hex')}
export function assertImmutableVersion(oldVersion,newVersion){if(oldVersion?.item_version_id!==newVersion?.item_version_id)return true;const oldHash=oldVersion.content_hash||contentHash(oldVersion.content);const newHash=newVersion.content_hash||contentHash(newVersion.content);if(oldHash!==newHash||contentHash(oldVersion.content)!==contentHash(newVersion.content))throw new Error('Released item version is immutable; create a new ItemVersion');return true}

function deepFreeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const v of Object.values(value))deepFreeze(v);Object.freeze(value)}return value}
export function createContentRelease(input){const allowedInitial=new Set(['DRAFT','DEV','REVIEW','QUARANTINED']);if(!allowedInitial.has(input?.status))throw new Error('Invalid initial release status; CANARY/ACTIVE require lifecycle transitions');const item_version_ids=[...new Set(input.item_version_ids||[])].sort();if(!item_version_ids.length)throw new Error('Content release requires item versions');const immutable={track_id:input.track_id,item_version_ids,source_policy_version:input.source_policy_version,quality_policy_version:input.quality_policy_version,review_policy_version:input.review_policy_version,exam_profile_id:input.exam_profile_id,exam_profile_version:input.exam_profile_version};const release={...structuredClone(input),item_version_ids,content_hash:contentHash(immutable)};return deepFreeze(release)}
const RELEASE_TRANSITIONS={DRAFT:{develop:'DEV'},DEV:{submit_review:'REVIEW'},REVIEW:{canary:'CANARY',quarantine:'QUARANTINED'},CANARY:{activate:'ACTIVE',quarantine:'QUARANTINED',retire:'RETIRED'},ACTIVE:{deprecate:'DEPRECATED',retire:'RETIRED',quarantine:'QUARANTINED'},DEPRECATED:{retire:'RETIRED'},QUARANTINED:{submit_review:'REVIEW'}};
function assertActivationEvidence(release,evidence,evaluation){
  if(release?.origin==='migrated-grandfathered'){
    if(!evidence)throw new Error('Activation evidence is required');
    return true;
  }
  if(!evidence||typeof evidence!=='object'||Array.isArray(evidence)){
    throw new Error('Structured ActivationEvidenceV1 is required for K2 activation');
  }
  if(
    evidence.schema_version!==1||
    typeof evidence.activation_evidence_id!=='string'||
    !evidence.activation_evidence_id||
    evidence.release_id!==release?.release_id
  ){
    throw new Error('Valid ActivationEvidenceV1 for this release is required');
  }
  if(!isEvaluatedActivationDecision(evaluation)){
    throw new Error('Trusted activation evaluation is required');
  }
  if(evidence.decision!==evaluation.decision){
    throw new Error('ActivationEvidenceV1 decision must match evaluated decision');
  }
  if(evaluation.decision!=='PROMOTE'){
    throw new Error('Evaluated activation decision must be PROMOTE');
  }
  return true;
}
export function transitionContentRelease(release,event,metadata={}){
  const next=RELEASE_TRANSITIONS[release?.status]?.[event];
  if(!next)throw new Error(`Invalid release transition: ${release?.status} --${event}--> ?`);
  if(event==='activate')assertActivationEvidence(release,metadata.activation_evidence,metadata.activation_evaluation);
  return deepFreeze({...structuredClone(release),status:next})
}
export function rollbackRelease(current,previous,reason,{actor='unknown',at=new Date().toISOString()}={}){if(!current?.release_id||!previous?.release_id||!reason)throw new Error('Rollback requires current, previous and reason');return deepFreeze({active_release:previous,rollback_event:{type:'release_rollback',from_release_id:current.release_id,to_release_id:previous.release_id,reason,actor,at}})}
