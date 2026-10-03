const CORRECTION_DEFINITION = 'learner.evidence.correction.recorded@1';

function isCorrection(event) {
  return event?.definition_id === CORRECTION_DEFINITION;
}

function eventOrder(a, b) {
  const aSeq = Number.isInteger(a?.store_seq) ? a.store_seq : Number.MAX_SAFE_INTEGER;
  const bSeq = Number.isInteger(b?.store_seq) ? b.store_seq : Number.MAX_SAFE_INTEGER;
  if (aSeq !== bSeq) return aSeq - bSeq;
  return String(a?.event_id ?? '').localeCompare(String(b?.event_id ?? ''));
}

function findingOrder(a, b) {
  const aKey = String(a.correction_event_id ?? a.correction_event_ids?.[0] ?? a.event_ids?.[0] ?? '');
  const bKey = String(b.correction_event_id ?? b.correction_event_ids?.[0] ?? b.event_ids?.[0] ?? '');
  if (aKey !== bKey) return aKey.localeCompare(bKey);
  return String(a.code).localeCompare(String(b.code));
}

function canonicalIds(values) {
  return [...new Set(values)].sort();
}

function cycleKey(eventIds) {
  return canonicalIds(eventIds).join('|');
}

export function resolveCurrentEvidence(events) {
  if (!Array.isArray(events)) throw new TypeError('events must be an array');

  const baseEvents = events.filter((event) => !isCorrection(event));
  const byId = new Map();
  for (const event of baseEvents) {
    if (!event || typeof event.event_id !== 'string' || !event.event_id) {
      throw new TypeError('every evidence event must have event_id');
    }
    if (byId.has(event.event_id)) throw new Error(`Duplicate evidence event_id: ${event.event_id}`);
    byId.set(event.event_id, event);
  }

  const unresolved = [];
  const conflicts = [];
  const validCorrections = [];

  for (const correction of events.filter(isCorrection).sort(eventOrder)) {
    const payload = correction?.payload ?? {};
    const targetId = payload.target_event_id;

    if (typeof correction.authority_ref !== 'string' || !correction.authority_ref) {
      conflicts.push({
        code: 'UNAUTHORIZED_CORRECTION',
        correction_event_id: correction.event_id,
        target_event_id: targetId
      });
      continue;
    }

    if (!byId.has(targetId)) {
      unresolved.push({
        code: 'MISSING_TARGET',
        correction_event_id: correction.event_id,
        target_event_id: targetId
      });
      continue;
    }

    if (payload.action === 'SUPERSEDE') {
      const supersedingId = payload.superseding_event_id;
      if (!byId.has(supersedingId)) {
        unresolved.push({
          code: 'MISSING_SUPERSEDING_EVENT',
          correction_event_id: correction.event_id,
          target_event_id: targetId,
          superseding_event_id: supersedingId
        });
        continue;
      }
    } else if (payload.action !== 'VOID') {
      conflicts.push({
        code: 'INVALID_CORRECTION_ACTION',
        correction_event_id: correction.event_id,
        target_event_id: targetId
      });
      continue;
    }

    validCorrections.push(correction);
  }

  const byTarget = new Map();
  for (const correction of validCorrections) {
    const targetId = correction.payload.target_event_id;
    const group = byTarget.get(targetId) ?? [];
    group.push(correction);
    byTarget.set(targetId, group);
  }

  const competingTargets = new Set();
  const singleCorrections = [];
  for (const [targetId, group] of [...byTarget.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (group.length > 1) {
      competingTargets.add(targetId);
      conflicts.push({
        code: 'COMPETING_CORRECTIONS',
        target_event_id: targetId,
        correction_event_ids: canonicalIds(group.map((item) => item.event_id))
      });
    } else {
      singleCorrections.push(group[0]);
    }
  }

  const edges = new Map();
  for (const correction of singleCorrections) {
    if (correction.payload.action !== 'SUPERSEDE') continue;
    edges.set(correction.payload.target_event_id, {
      to: correction.payload.superseding_event_id,
      correction
    });
  }

  const cycleTargets = new Set();
  const seenCycles = new Set();
  for (const start of [...edges.keys()].sort()) {
    const path = [];
    const position = new Map();
    let current = start;

    while (edges.has(current)) {
      if (position.has(current)) {
        const begin = position.get(current);
        const cycleEvents = path.slice(begin);
        const key = cycleKey(cycleEvents);
        if (!seenCycles.has(key)) {
          seenCycles.add(key);
          const correctionIds = cycleEvents.map((eventId) => edges.get(eventId).correction.event_id);
          conflicts.push({
            code: 'SUPERSESSION_CYCLE',
            event_ids: canonicalIds(cycleEvents),
            correction_event_ids: canonicalIds(correctionIds)
          });
        }
        for (const eventId of cycleEvents) cycleTargets.add(eventId);
        break;
      }
      position.set(current, path.length);
      path.push(current);
      current = edges.get(current).to;
    }
  }

  const inactive = new Set();
  for (const correction of singleCorrections.sort(eventOrder)) {
    const targetId = correction.payload.target_event_id;
    const supersedingId = correction.payload.superseding_event_id;
    if (competingTargets.has(targetId)) continue;
    if (cycleTargets.has(targetId) || (supersedingId && cycleTargets.has(supersedingId))) continue;

    if (correction.payload.action === 'VOID') {
      inactive.add(targetId);
    } else if (correction.payload.action === 'SUPERSEDE') {
      inactive.add(targetId);
    }
  }

  return {
    activeEvents: baseEvents.filter((event) => !inactive.has(event.event_id)).sort(eventOrder),
    unresolved: unresolved.sort(findingOrder),
    conflicts: conflicts.sort(findingOrder)
  };
}
