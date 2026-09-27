export const FACTORY_STATES=Object.freeze(['DRAFT','GENERATED','CRITIQUED','VALIDATED','DEDUPED','EVIDENCE_CHECKED','DISTRACTOR_CHECKED','BILINGUAL_CHECKED','ACCESSIBILITY_CHECKED','REVIEW_PENDING','APPROVED','CANARY','ACTIVE','OBSERVING','REVISION_REQUIRED','RECALIBRATION_PENDING','DEPRECATED','RETIRED','QUARANTINED']);
export const FACTORY_EVENTS=Object.freeze(['generate','critique','validate','deduplicate','check_evidence','check_distractors','check_bilingual','check_accessibility','request_review','approve','canary','activate','observe','require_revision','request_recalibration','deprecate','retire','quarantine']);
const T={
 DRAFT:{generate:'GENERATED'},
 GENERATED:{critique:'CRITIQUED',quarantine:'QUARANTINED'},
 CRITIQUED:{validate:'VALIDATED',quarantine:'QUARANTINED'},
 VALIDATED:{deduplicate:'DEDUPED',quarantine:'QUARANTINED'},
 DEDUPED:{check_evidence:'EVIDENCE_CHECKED',quarantine:'QUARANTINED'},
 EVIDENCE_CHECKED:{check_distractors:'DISTRACTOR_CHECKED',quarantine:'QUARANTINED'},
 DISTRACTOR_CHECKED:{check_bilingual:'BILINGUAL_CHECKED',quarantine:'QUARANTINED'},
 BILINGUAL_CHECKED:{check_accessibility:'ACCESSIBILITY_CHECKED',quarantine:'QUARANTINED'},
 ACCESSIBILITY_CHECKED:{request_review:'REVIEW_PENDING',quarantine:'QUARANTINED'},
 REVIEW_PENDING:{approve:'APPROVED',quarantine:'QUARANTINED',require_revision:'REVISION_REQUIRED'},
 APPROVED:{canary:'CANARY',quarantine:'QUARANTINED'},
 CANARY:{activate:'ACTIVE',quarantine:'QUARANTINED',retire:'RETIRED'},
 ACTIVE:{observe:'OBSERVING',deprecate:'DEPRECATED',retire:'RETIRED',quarantine:'QUARANTINED'},
 OBSERVING:{require_revision:'REVISION_REQUIRED',request_recalibration:'RECALIBRATION_PENDING',deprecate:'DEPRECATED',retire:'RETIRED',quarantine:'QUARANTINED'},
 REVISION_REQUIRED:{quarantine:'QUARANTINED'},
 RECALIBRATION_PENDING:{quarantine:'QUARANTINED'},
 DEPRECATED:{retire:'RETIRED',quarantine:'QUARANTINED'},
 QUARANTINED:{request_review:'REVIEW_PENDING'}
};
export function canTransitionFactoryState(current,event){return Boolean(T[current]?.[event])}
export function transitionFactoryState(current,event){const next=T[current]?.[event];if(!next)throw new Error(`Invalid factory transition: ${current} --${event}--> ?`);return next}
