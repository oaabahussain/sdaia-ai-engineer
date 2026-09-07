export function weightedReadiness(weights, masteryByDomain, diagnosticDone = true) {
  let total = Object.entries(weights).reduce((sum, [domain, weight]) => sum + (masteryByDomain(domain) * weight / 100), 0);
  if (!diagnosticDone) total *= 0.9;
  return Math.round(total);
}
