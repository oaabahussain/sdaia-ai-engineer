export function masteryForDomain(domain, questions, state) {
  const qs = questions.filter((q) => q.domain === domain);
  if (!qs.length) return 0;
  const points = qs.reduce((sum, q) => sum + (state.mastered?.[q.id] ? 1 : state.answers?.[q.id] === true ? 0.75 : 0), 0);
  return Math.round((points / qs.length) * 100);
}
