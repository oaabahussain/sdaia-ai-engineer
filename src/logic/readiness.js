import { masteryForDomain } from './mastery.js';

export function calculateReadiness(weights, questions, state) {
  const weighted = Object.entries(weights).reduce(
    (total, [domain, weight]) => total + masteryForDomain(domain, questions, state) * (weight / 100),
    0,
  );
  return Math.round(weighted * (state.diagnostic?.done ? 1 : 0.9));
}
