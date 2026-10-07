import { captureLocalEvidence } from './localCapture.js';

const STRICT_MODES = new Set(['section', 'mock']);

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function nowIso(clock) {
  const value = typeof clock === 'function' ? clock() : new Date();
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError('clock must return a valid date-time');
  return date.toISOString();
}

function requireString(value, label) {
  if (typeof value !== 'string' || !value) throw new TypeError(`${label} is required`);
  return value;
}

function requireUuid(value, label) {
  requireString(value, label);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new TypeError(`${label} must be a UUIDv4`);
  }
  return value;
}

function eventDefinition(runtimeContext, definitionId) {
  const definition = runtimeContext?.eventDefinitions?.find(
    (item) => `${item.event_name}@${item.event_version}` === definitionId
  );
  if (!definition) throw new Error(`Unknown evidence definition: ${definitionId}`);
  return definition;
}

function assertSnapshot(snapshot, { formId, contentReleaseId } = {}) {
  if (!snapshot || typeof snapshot !== 'object') throw new TypeError('frozen assessment snapshot is required');
  requireString(snapshot.form_id, 'assessment snapshot form_id');
  requireString(snapshot.content_release_id, 'assessment snapshot content_release_id');
  requireString(snapshot.exam_profile_id, 'assessment snapshot exam_profile_id');
  requireString(String(snapshot.exam_profile_version ?? ''), 'assessment snapshot exam_profile_version');
  requireString(snapshot.scoring_policy_version, 'assessment snapshot scoring_policy_version');
  if (!Array.isArray(snapshot.item_version_ids) || !snapshot.item_version_ids.length || new Set(snapshot.item_version_ids).size !== snapshot.item_version_ids.length) {
    throw new TypeError('frozen assessment snapshot requires unique item_version_ids');
  }
  if (formId !== undefined && formId !== snapshot.form_id) throw new Error('form_id disagrees with frozen assessment snapshot');
  if (contentReleaseId !== undefined && contentReleaseId !== snapshot.content_release_id) {
    throw new Error('content_release_id disagrees with frozen assessment snapshot');
  }
  return clone(snapshot);
}

function assertItemInSnapshot(activity, itemVersionId) {
  if (STRICT_MODES.has(activity.mode) && !activity.assessment_snapshot.item_version_ids.includes(itemVersionId)) {
    throw new Error('item_version_id is outside the frozen assessment form snapshot');
  }
}

function commonEnvelope(activity) {
  return {
    learner_id: activity.learner_id,
    activity_id: activity.activity_id,
    track_id: activity.track_id,
    content_release_id: activity.content_release_id,
    mode: activity.mode,
    locale: activity.locale,
    ...(activity.assessment_attempt_id ? { assessment_attempt_id: activity.assessment_attempt_id } : {}),
    ...(activity.form_id ? { form_id: activity.form_id } : {})
  };
}

export function createEvidenceRecorder({ store, outbox = null, runtimeContext, clock, crypto = globalThis.crypto } = {}) {
  if (!store || typeof store.captureLocal !== 'function') throw new TypeError('store.captureLocal is required');
  if (!runtimeContext?.track || !runtimeContext?.evidence || !Array.isArray(runtimeContext?.eventDefinitions)) {
    throw new TypeError('runtimeContext track, evidence, and eventDefinitions are required');
  }
  if (!crypto || typeof crypto.randomUUID !== 'function') throw new TypeError('crypto.randomUUID is required');

  const activities = new Map();
  const interactions = new Map();
  const localAttemptRevisions = new Map();
  const localRevisionTails = new Map();
  const uuid = (label) => requireUuid(crypto.randomUUID(), label);

  function hydrateActivity(input) {
    const supplied = input?.activity_context;
    if (!supplied) return activities.get(input?.activity_id);
    const activityId = requireUuid(input.activity_id ?? supplied.activity_id, 'activity_id');
    if (supplied.activity_id && supplied.activity_id !== activityId) throw new Error('activity context identity mismatch');
    const mode = requireString(supplied.mode, 'activity mode');
    const strict = STRICT_MODES.has(mode);
    const snapshot = strict ? assertSnapshot(supplied.assessment_snapshot, {
      formId: supplied.form_id,
      contentReleaseId: supplied.content_release_id
    }) : null;
    const activity = {
      learner_id: requireString(supplied.learner_id, 'learner_id'),
      activity_id: activityId,
      track_id: requireString(supplied.track_id, 'track_id'),
      content_release_id: requireString(supplied.content_release_id, 'content_release_id'),
      mode,
      locale: requireString(supplied.locale, 'locale'),
      ...(strict ? {
        assessment_attempt_id: requireUuid(supplied.assessment_attempt_id, 'assessment_attempt_id'),
        form_id: snapshot.form_id,
        assessment_snapshot: snapshot,
        attempt_revision: Number.isSafeInteger(supplied.attempt_revision) ? supplied.attempt_revision : 0
      } : {})
    };
    if (activity.track_id !== runtimeContext.track.id) throw new Error('activity track does not match runtime track');
    if (activity.content_release_id !== runtimeContext.evidence.content_release_id) throw new Error('activity release does not match runtime release');
    activities.set(activity.activity_id, activity);
    if (strict && !localAttemptRevisions.has(activity.assessment_attempt_id)) {
      localAttemptRevisions.set(activity.assessment_attempt_id, activity.attempt_revision);
    }
    return activity;
  }

  function requireActivity(input) {
    const activity = hydrateActivity(input);
    if (!activity) throw new Error('unknown activity_id; resume requires activity_context');
    return activity;
  }

  function hydrateInteraction(input, activity) {
    let interaction = interactions.get(input?.item_interaction_id);
    const supplied = input?.item_context;
    if (!interaction && supplied) {
      const itemVersionId = requireString(supplied.item_version_id, 'item_version_id');
      assertItemInSnapshot(activity, itemVersionId);
      interaction = {
        item_interaction_id: requireUuid(input.item_interaction_id ?? supplied.item_interaction_id, 'item_interaction_id'),
        question_family_id: requireString(supplied.question_family_id, 'question_family_id'),
        item_version_id: itemVersionId,
        objective_id: requireString(supplied.objective_id, 'objective_id'),
        domain_id: requireString(supplied.domain_id, 'domain_id')
      };
      interactions.set(interaction.item_interaction_id, interaction);
    }
    return interaction;
  }

  function requireInteraction(input, activity) {
    const interaction = hydrateInteraction(input, activity);
    if (!interaction) throw new Error('unknown item_interaction_id; resume requires item_context');
    assertItemInSnapshot(activity, interaction.item_version_id);
    return interaction;
  }

  async function capture(definitionId, eventInput) {
    return captureLocalEvidence({
      store,
      outbox,
      eventInput: { ...eventInput, occurred_at: eventInput.occurred_at ?? nowIso(clock) },
      definition: eventDefinition(runtimeContext, definitionId),
      runtimeContext
    });
  }

  async function captureStrictResponse(activity, eventInput, baseRevision, proposedRevision) {
    if (!Number.isSafeInteger(baseRevision) || baseRevision < 0) throw new TypeError('base_attempt_revision must be a non-negative integer');
    if (!Number.isSafeInteger(proposedRevision) || proposedRevision !== baseRevision + 1) {
      throw new TypeError('proposed_attempt_revision must equal base_attempt_revision + 1');
    }
    const input = {
      ...eventInput,
      definition_id: 'learner.response.recorded@1',
      base_attempt_revision: baseRevision,
      proposed_attempt_revision: proposedRevision,
      occurred_at: eventInput.occurred_at ?? nowIso(clock)
    };
    if (typeof store.captureLocalStrict === 'function') {
      const result = await store.captureLocalStrict({
        outbox,
        eventInput: input,
        runtimeContext,
        assessmentAttemptId: activity.assessment_attempt_id,
        baseAttemptRevision: baseRevision,
        proposedAttemptRevision: proposedRevision
      });
      if (!result?.receipt || !['ACCEPTED', 'DUPLICATE'].includes(result.receipt.disposition)) {
        throw new Error(`Local evidence was not durably recorded: ${result?.receipt?.disposition ?? 'NO_RECEIPT'}`);
      }
      localAttemptRevisions.set(activity.assessment_attempt_id, proposedRevision);
      activity.attempt_revision = proposedRevision;
      return result;
    }

    const attemptId = activity.assessment_attempt_id;
    const previous = localRevisionTails.get(attemptId) ?? Promise.resolve();
    const job = previous.catch(() => {}).then(async () => {
      const current = localAttemptRevisions.get(attemptId) ?? activity.attempt_revision ?? 0;
      if (current !== baseRevision) throw new Error(`stale assessment attempt revision: expected ${current}, received ${baseRevision}`);
      const result = await capture('learner.response.recorded@1', input);
      localAttemptRevisions.set(attemptId, proposedRevision);
      activity.attempt_revision = proposedRevision;
      return result;
    });
    localRevisionTails.set(attemptId, job.then(() => undefined, () => undefined));
    return job;
  }

  async function startActivity(input = {}) {
    const mode = requireString(input.mode, 'mode');
    const strict = STRICT_MODES.has(mode);
    const trackId = input.track_id ?? runtimeContext.track.id;
    const releaseId = input.content_release_id ?? runtimeContext.evidence.content_release_id;
    if (trackId !== runtimeContext.track.id) throw new Error('track_id does not match runtime track');
    if (releaseId !== runtimeContext.evidence.content_release_id) throw new Error('content_release_id does not match runtime release');
    const snapshot = strict ? assertSnapshot(input.assessment_snapshot, { formId: input.form_id, contentReleaseId: releaseId }) : null;
    const activity = {
      learner_id: requireString(input.learner_id, 'learner_id'),
      activity_id: input.activity_id ? requireUuid(input.activity_id, 'activity_id') : uuid('activity_id'),
      track_id: trackId,
      content_release_id: releaseId,
      mode,
      locale: requireString(input.locale ?? snapshot?.locale, 'locale'),
      ...(strict ? {
        assessment_attempt_id: input.assessment_attempt_id ? requireUuid(input.assessment_attempt_id, 'assessment_attempt_id') : uuid('assessment_attempt_id'),
        form_id: snapshot.form_id,
        assessment_snapshot: snapshot,
        attempt_revision: Number.isSafeInteger(input.attempt_revision) ? input.attempt_revision : 0
      } : {})
    };
    const payload = input.source === undefined ? {} : { source: requireString(input.source, 'source') };
    const result = await capture('learner.activity.started@1', { ...commonEnvelope(activity), payload });
    activities.set(activity.activity_id, activity);
    if (strict) localAttemptRevisions.set(activity.assessment_attempt_id, activity.attempt_revision);
    return result;
  }

  async function presentItem(input = {}) {
    const activity = requireActivity(input);
    const itemVersionId = requireString(input.item_version_id, 'item_version_id');
    assertItemInSnapshot(activity, itemVersionId);
    const interaction = {
      item_interaction_id: input.item_interaction_id ? requireUuid(input.item_interaction_id, 'item_interaction_id') : uuid('item_interaction_id'),
      question_family_id: requireString(input.question_family_id, 'question_family_id'),
      item_version_id: itemVersionId,
      objective_id: requireString(input.objective_id, 'objective_id'),
      domain_id: requireString(input.domain_id, 'domain_id')
    };
    const result = await capture('learner.item.presented@1', {
      ...commonEnvelope(activity),
      ...interaction,
      payload: {}
    });
    interactions.set(interaction.item_interaction_id, interaction);
    return result;
  }

  async function recordResponse(input = {}) {
    const activity = requireActivity(input);
    const interaction = requireInteraction(input, activity);
    const eventInput = { ...commonEnvelope(activity), ...interaction, payload: clone(input.response) };
    if (STRICT_MODES.has(activity.mode)) {
      return captureStrictResponse(activity, eventInput, input.base_attempt_revision, input.proposed_attempt_revision);
    }
    return capture('learner.response.recorded@1', eventInput);
  }

  async function recordConfidence(input = {}) {
    const activity = requireActivity(input);
    const interaction = requireInteraction(input, activity);
    return capture('learner.confidence.recorded@1', {
      ...commonEnvelope(activity), ...interaction,
      payload: { confidence: requireString(input.confidence, 'confidence') }
    });
  }

  async function requestHint(input = {}) {
    const activity = requireActivity(input);
    const interaction = requireInteraction(input, activity);
    return capture('learner.hint.requested@1', {
      ...commonEnvelope(activity), ...interaction,
      payload: input.hint_ref === undefined ? {} : { hint_ref: requireString(input.hint_ref, 'hint_ref') }
    });
  }

  async function openExplanation(input = {}) {
    const activity = requireActivity(input);
    const interaction = requireInteraction(input, activity);
    return capture('learner.explanation.opened@1', {
      ...commonEnvelope(activity), ...interaction,
      payload: input.explanation_ref === undefined ? {} : { explanation_ref: requireString(input.explanation_ref, 'explanation_ref') }
    });
  }

  async function submitAssessment(input = {}) {
    const activity = requireActivity(input);
    if (!STRICT_MODES.has(activity.mode)) throw new Error('assessment submission requires a strict section/mock activity');
    const snapshot = activity.assessment_snapshot;
    return capture('learner.assessment.submitted@1', {
      ...commonEnvelope(activity),
      payload: {
        exam_profile_ref: `${snapshot.exam_profile_id}@${snapshot.exam_profile_version}`,
        scoring_policy_ref: snapshot.scoring_policy_version
      }
    });
  }

  async function recordEvaluation(_input = {}) {
    throw new Error('Trusted SYSTEM producer authority is required for learner.response.evaluated@1');
  }

  return {
    startActivity,
    presentItem,
    recordResponse,
    recordConfidence,
    requestHint,
    openExplanation,
    submitAssessment,
    recordEvaluation
  };
}
