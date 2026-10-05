function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function remapKeyedObject(value, map) {
  return Object.fromEntries(Object.entries(value || {}).map(([key, item]) => [map[key] || key, item]));
}

function remapActiveExam(exam, map, meta) {
  if (!exam) return null;
  return {
    ...exam,
    track_id: meta.trackId,
    track_version: meta.trackVersion,
    exam_profile_id: meta.examProfileId,
    exam_profile_version: meta.examProfileVersion,
    questionIds: (exam.questionIds || []).map((id) => map[id] || id),
    answers: remapKeyedObject(exam.answers, map),
    confidence: remapKeyedObject(exam.confidence, map),
    flags: remapKeyedObject(exam.flags, map),
    optionOrders: remapKeyedObject(exam.optionOrders, map)
  };
}

function transitionTracksOf(state) {
  const tracks = state?.legacy?.preserved?.k3_transition_tracks;
  return isObject(tracks) ? tracks : {};
}

function markLegacyActiveExam(exam) {
  return exam ? { ...exam, legacy_state_v2: true } : null;
}

function markLegacyHistory(history) {
  return Array.isArray(history) ? history.map((item) => ({ ...item, legacy_summary: true })) : [];
}

function preserveSubmittedLegacyHistory(history) {
  return Array.isArray(history)
    ? history.map((item) => (item?.legacy_summary === true || item?.attempt?.legacy_state_v2 === true
        ? { ...item, legacy_summary: true }
        : item))
    : [];
}

function transitionStateV2Track(state, { trackId, trackVersion }) {
  const transitionTracks = transitionTracksOf(state);
  if (transitionTracks[trackId] === true && state.tracks?.[trackId]) {
    const track = state.tracks[trackId];
    return {
      ...state,
      tracks: {
        ...(state.tracks || {}),
        [trackId]: { ...track, exam_history: preserveSubmittedLegacyHistory(track.exam_history) }
      }
    };
  }

  const existingTrack = state.tracks?.[trackId];
  const transitionedTrack = existingTrack
    ? {
        ...existingTrack,
        active_exam: markLegacyActiveExam(existingTrack.active_exam),
        exam_history: markLegacyHistory(existingTrack.exam_history)
      }
    : { track_version: trackVersion, active_exam: null, exam_history: [] };

  return {
    ...state,
    tracks: { ...(state.tracks || {}), [trackId]: transitionedTrack },
    legacy: {
      ...state.legacy,
      preserved: {
        ...(isObject(state.legacy?.preserved) ? state.legacy.preserved : {}),
        k3_transition_tracks: { ...transitionTracks, [trackId]: true }
      }
    }
  };
}

export function migrateState(raw, { anonId, questionIdMap = {}, trackId, trackVersion, examProfileId, examProfileVersion }) {
  if (raw?.version === 2) return transitionStateV2Track(raw, { trackId, trackVersion });

  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const exam = source.examV2 || {};
  const now = new Date().toISOString();
  const meta = { trackId, trackVersion, examProfileId, examProfileVersion };
  const preserved = Object.fromEntries(
    Object.entries(source).filter(([key]) => !['anon_id', 'created_at', 'updated_at', 'examV2'].includes(key))
  );

  return {
    version: 2,
    anon_id: source.anon_id || anonId,
    created_at: source.created_at || now,
    updated_at: source.updated_at || now,
    preferences: {
      lang: exam.lang === 'en' ? 'en' : 'ar',
      theme: exam.theme === 'dark' ? 'dark' : 'light'
    },
    tracks: {
      [trackId]: {
        track_version: trackVersion,
        active_exam: markLegacyActiveExam(remapActiveExam(exam.active, questionIdMap, meta)),
        exam_history: Array.isArray(exam.history)
          ? exam.history.map((item) => ({
              ...item,
              legacy_summary: true,
              track_id: trackId,
              track_version: trackVersion,
              exam_profile_id: examProfileId,
              exam_profile_version: examProfileVersion
            }))
          : []
      }
    },
    legacy: {
      source_version: source.version ?? 1,
      preserved: {
        ...preserved,
        k3_transition_tracks: { [trackId]: true }
      }
    }
  };
}
