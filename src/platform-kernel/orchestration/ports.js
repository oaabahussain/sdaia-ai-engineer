function need(o,n,label){if(!o||typeof o[n]!=='function')throw new Error(`${label} must implement ${n}()`);return o}
export function assertRunnerPort(o){for(const n of ['runCandidate','resumeRun','retryStage','cancelRun'])need(o,n,'RunnerPort');return o}
export function assertContentStore(o){for(const n of ['get','put','list'])need(o,n,'ContentStorePort');return o}
export function assertJobStore(o){for(const n of ['create','get','updateStatus','recordStageOutput'])need(o,n,'JobStorePort');return o}
export function assertEventStore(o){for(const n of ['append','list'])need(o,n,'EventStorePort');return o}
export function assertReviewPort(o){for(const n of ['appendDecision','getLatestDecision','listDecisions'])need(o,n,'ReviewPort');return o}
