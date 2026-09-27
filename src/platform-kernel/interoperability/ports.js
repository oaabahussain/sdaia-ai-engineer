function need(o,n,label){if(!o||typeof o[n]!=='function')throw new Error(`${label} must implement ${n}()`);return o}
export function assertAssessmentExchangePort(o){need(o,'exportAssessment','AssessmentExchangePort');need(o,'importAssessment','AssessmentExchangePort');return o}
export function assertCompetencyExchangePort(o){need(o,'exportCompetencies','CompetencyExchangePort');need(o,'importCompetencies','CompetencyExchangePort');return o}
export function assertLearningEventExchangePort(o){need(o,'exportEvents','LearningEventExchangePort');need(o,'importEvents','LearningEventExchangePort');return o}
