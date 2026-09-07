export function rankSessions(sessions, weights, mastery) {
  return [...sessions].sort((a, b) => (weights[b.domain] ?? 0) * (1 - mastery(b.domain) / 100) - (weights[a.domain] ?? 0) * (1 - mastery(a.domain) / 100));
}
