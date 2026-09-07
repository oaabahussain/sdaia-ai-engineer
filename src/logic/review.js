export function nextReview(stage = 0, correct = false, now = Date.now()) {
  const nextStage = correct ? Math.min(3, stage + 1) : 0;
  const intervalDays = [1, 3, 7, 14][nextStage] ?? 14;
  return { stage: nextStage, intervalDays, next: now + intervalDays * 86400000 };
}
