function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function evaluateProvider(provider, goldSet, policy = {}) {
  if (!provider || typeof provider.generate !== 'function') {
    throw new Error('Provider must implement generate()');
  }
  if (!Array.isArray(goldSet) || !goldSet.length) {
    throw new Error('Gold set is required');
  }

  let correct = 0;
  let source = 0;
  let ar = 0;
  let en = 0;
  let dist = 0;
  let format = 0;
  let totalLatency = 0;

  for (const row of goldSet) {
    const started = Date.now();
    const out = await provider.generate(row.input);
    totalLatency += Date.now() - started;

    if (eq(out.answer, row.expected.answer)) correct++;
    if (
      !row.expected.source_ref ||
      (out.source_refs || []).includes(row.expected.source_ref)
    ) source++;
    if (typeof out.ar === 'string' && out.ar.trim()) ar++;
    if (typeof out.en === 'string' && out.en.trim()) en++;
    if (Array.isArray(out.distractors) && out.distractors.length >= 3) dist++;
    if (out.format_ok !== false) format++;
  }

  const n = goldSet.length;
  const metrics = {
    correctness: correct / n,
    source_fidelity: source / n,
    arabic_quality: ar / n,
    english_quality: en / n,
    distractor_quality: dist / n,
    format_compliance: format / n,
    latency_ms: totalLatency / n,
    cost: 0
  };
  const thresholds = policy.thresholds || {};
  const failed = Object.entries(thresholds)
    .some(([key, value]) => (metrics[key] ?? 0) < value);

  return {
    schema_version: 1,
    evaluation_id: `evaluation:${provider.name ?? 'provider'}:${n}`,
    provider: provider.name ?? 'provider',
    model: provider.model ?? null,
    policy_version: policy.policy_version ?? 'unversioned',
    metrics,
    decision: failed ? 'FAIL' : 'PASS',
    created_at: policy.created_at ?? '1970-01-01T00:00:00Z'
  };
}

export async function evaluateProviderV2(provider, goldSet, policy = {}) {
  if (!provider || typeof provider.generate !== 'function') {
    throw new Error('Provider must implement generate()');
  }
  if (!Array.isArray(goldSet) || !goldSet.length) {
    throw new Error('Gold set is required');
  }

  const counts = {
    correctness: 0,
    source_fidelity: 0,
    evidence_fidelity: 0,
    hallucination_free: 0,
    arabic_quality: 0,
    english_quality: 0,
    bilingual_equivalence: 0,
    ambiguity_control: 0,
    cognitive_alignment: 0,
    distractor_quality: 0,
    format_compliance: 0
  };
  let totalLatency = 0;

  for (const row of goldSet) {
    const started = Date.now();
    const out = await provider.generate(row.input);
    totalLatency += Date.now() - started;

    if (eq(out.answer, row.expected.answer)) counts.correctness++;
    if (
      !row.expected.source_ref ||
      (out.source_refs || []).includes(row.expected.source_ref)
    ) counts.source_fidelity++;
    if (
      !row.expected.source_ref ||
      (out.evidence_refs || []).includes(row.expected.source_ref)
    ) counts.evidence_fidelity++;
    if (
      Array.isArray(out.unsupported_claims) &&
      out.unsupported_claims.length === 0
    ) counts.hallucination_free++;
    if (typeof out.ar === 'string' && out.ar.trim()) counts.arabic_quality++;
    if (typeof out.en === 'string' && out.en.trim()) counts.english_quality++;
    if (out.bilingual_equivalent === true) counts.bilingual_equivalence++;
    if (
      Array.isArray(out.ambiguity_flags) &&
      out.ambiguity_flags.length === 0
    ) counts.ambiguity_control++;
    if (
      !row.expected.cognitive_level ||
      out.cognitive_level === row.expected.cognitive_level
    ) counts.cognitive_alignment++;
    if (
      Array.isArray(out.distractors) &&
      out.distractors.length >= 3
    ) counts.distractor_quality++;
    if (out.format_ok !== false) counts.format_compliance++;
  }

  const n = goldSet.length;
  const metrics = Object.fromEntries(
    Object.entries(counts).map(([key, value]) => [key, value / n])
  );
  metrics.latency_ms = totalLatency / n;
  metrics.cost = 0;

  const thresholds = policy.thresholds || {};
  const failed = Object.entries(thresholds)
    .some(([key, value]) => (metrics[key] ?? 0) < value);

  return {
    schema_version: 2,
    evaluation_profile: 'k2',
    evaluation_id: `evaluation:k2:${provider.name ?? 'provider'}:${n}`,
    provider: provider.name ?? 'provider',
    model: provider.model ?? null,
    policy_version: policy.policy_version ?? 'unversioned',
    metrics,
    decision: failed ? 'FAIL' : 'PASS',
    created_at: policy.created_at ?? '1970-01-01T00:00:00Z'
  };
}
