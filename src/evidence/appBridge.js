function evidenceMode(exam) {
  return exam?.evidence_mode ?? (exam?.mode === 'full' ? 'mock' : exam?.mode);
}

function requireRuntime(context) {
  const runtime = context?.evidence_runtime;
  if (!runtime?.activity_id || !runtime?.assessment_attempt_id || !Number.isSafeInteger(runtime?.attempt_revision)) {
    throw new Error('evidence_runtime is required for this assessment interaction');
  }
  runtime.interactions ??= {};
  return runtime;
}

function conceptMatches(question, exam, conceptId) {
  const prefix = `${exam.track_id}.${conceptId}.`;
  return typeof question?.family_id === 'string' && question.family_id.startsWith(prefix);
}

function resolveObjective(question, exam, catalog) {
  if (!catalog || catalog.track_id !== exam.track_id || !Array.isArray(catalog.objectives)) {
    throw new Error('canonical objective registry is required');
  }
  const matches = catalog.objectives.filter((objective) =>
    objective?.track_id === exam.track_id &&
    objective?.domain_id === question?.domain_id &&
    Array.isArray(objective?.concept_ids) &&
    objective.concept_ids.some((conceptId) => conceptMatches(question, exam, conceptId))
  );
  if (matches.length !== 1) {
    throw new Error(`objective linkage must resolve exactly once for item_version_id ${question?.id ?? 'unknown'}`);
  }
  return matches[0].objective_id;
}

function activityContext(exam, context) {
  const runtime = requireRuntime(context);
  const snapshot = exam?.assessment_snapshot;
  if (!snapshot) throw new Error('assessment_snapshot is required');
  return {
    learner_id: context.learner_id,
    activity_id: runtime.activity_id,
    track_id: exam.track_id,
    content_release_id: snapshot.content_release_id,
    mode: evidenceMode(exam),
    locale: snapshot.locale,
    assessment_attempt_id: runtime.assessment_attempt_id,
    form_id: snapshot.form_id,
    attempt_revision: runtime.attempt_revision,
    assessment_snapshot: snapshot
  };
}

function itemContext(question, exam, context) {
  return {
    question_family_id: question.family_id,
    item_version_id: question.id,
    objective_id: resolveObjective(question, exam, context.objective_catalog),
    domain_id: question.domain_id
  };
}

export async function beginExamEvidence(recorder, exam, context = {}) {
  if (!recorder?.startActivity) throw new TypeError('evidence recorder is required');
  if (context.evidence_runtime?.activity_id) {
    const runtime = requireRuntime(context);
    return { resumed: true, event: { activity_id: runtime.activity_id, assessment_attempt_id: runtime.assessment_attempt_id }, evidence_runtime: runtime };
  }
  const snapshot = exam?.assessment_snapshot;
  if (!snapshot) throw new Error('assessment_snapshot is required');
  const result = await recorder.startActivity({
    learner_id: context.learner_id,
    mode: evidenceMode(exam),
    locale: snapshot.locale,
    assessment_snapshot: snapshot,
    source: 'browser'
  });
  const runtime = { activity_id: result.event.activity_id, assessment_attempt_id: result.event.assessment_attempt_id, attempt_revision: 0, interactions: {} };
  context.evidence_runtime = runtime;
  return { ...result, evidence_runtime: runtime };
}

export async function presentExamItemEvidence(recorder, exam, question, context = {}) {
  if (!recorder?.presentItem) throw new TypeError('evidence recorder is required');
  const runtime = requireRuntime(context);
  const existing = runtime.interactions[question.id];
  if (existing?.presented) return { resumed: true, event: { item_interaction_id: existing.item_interaction_id } };
  const item = itemContext(question, exam, context);
  const result = await recorder.presentItem({ activity_id: runtime.activity_id, activity_context: activityContext(exam, context), ...item });
  runtime.interactions[question.id] = { item_interaction_id: result.event.item_interaction_id, presented: true };
  return result;
}

export async function recordExamAnswerEvidence(recorder, exam, question, answer, context = {}) {
  if (!recorder?.recordResponse) throw new TypeError('evidence recorder is required');
  if (context.previous_answer === answer) return null;
  if (!Number.isSafeInteger(answer) || answer < 0) throw new TypeError('canonical answer index is required');
  const runtime = requireRuntime(context);
  const interaction = runtime.interactions[question.id];
  if (!interaction?.presented || !interaction.item_interaction_id) throw new Error('item must be presented before a response can be recorded');
  const base = runtime.attempt_revision;
  const result = await recorder.recordResponse({
    activity_id: runtime.activity_id,
    activity_context: activityContext(exam, context),
    item_interaction_id: interaction.item_interaction_id,
    item_context: itemContext(question, exam, context),
    response: { response_version: 1, response_kind: 'OPTION', response: { option_index: answer } },
    base_attempt_revision: base,
    proposed_attempt_revision: base + 1
  });
  runtime.attempt_revision = base + 1;
  interaction.last_response_event_id = result.event?.event_id ?? null;
  return result;
}

export async function recordExamConfidenceEvidence(recorder, exam, question, confidence, context = {}) {
  if (!recorder?.recordConfidence) throw new TypeError('evidence recorder is required');
  if (context.previous_confidence === confidence) return null;
  if (!['low','medium','high'].includes(confidence)) return null;
  const runtime = requireRuntime(context);
  const interaction = runtime.interactions[question.id];
  if (!interaction?.presented || !interaction.item_interaction_id) throw new Error('item must be presented before confidence can be recorded');
  return recorder.recordConfidence({
    activity_id: runtime.activity_id,
    activity_context: activityContext(exam, context),
    item_interaction_id: interaction.item_interaction_id,
    item_context: itemContext(question, exam, context),
    confidence
  });
}

export async function submitExamEvidence(recorder, exam, _result, _questions, context = {}) {
  if (!recorder?.submitAssessment) throw new TypeError('evidence recorder is required');
  const runtime = requireRuntime(context);
  return recorder.submitAssessment({ activity_id: runtime.activity_id, activity_context: activityContext(exam, context) });
}
