const INTERVAL_DAYS = [1, 3, 7, 14];

export function nextReview(current, correct, nowMs = Date.now()) {
  const previousStage = Number.isInteger(current?.stage) ? current.stage : -1;
  const stage = correct ? Math.min(3, previousStage + 1) : 0;
  return { stage, next: nowMs + INTERVAL_DAYS[stage] * 86400000 };
}

export { INTERVAL_DAYS };
