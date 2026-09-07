import { masteryForDomain } from './mastery.js';

export function rankSessions(sessions, weights, questions, state) {
  return [...sessions].sort((left, right) => {
    const leftPriority = (weights[left.domain] || 0) * (1 - masteryForDomain(left.domain, questions, state) / 100);
    const rightPriority = (weights[right.domain] || 0) * (1 - masteryForDomain(right.domain, questions, state) / 100);
    return rightPriority - leftPriority;
  });
}
