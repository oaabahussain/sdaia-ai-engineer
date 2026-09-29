const rawBase = process.argv[2];
if (!rawBase) throw new Error('Usage: node scripts/verify_live_release.js <base-url>');
const base = rawBase.replace(/\/$/, '');

const response = async path => {
  const relative = path.replace(/^\.\//, '');
  const result = await fetch(`${base}/${relative}`, {cache:'no-store'});
  if (!result.ok) throw new Error(`${path}: HTTP ${result.status}`);
  return result;
};
const getJson = async path => (await response(path)).json();

const registry = await getJson('tracks/registry.json');
if (
  registry?.schema_version !== 1 ||
  !Array.isArray(registry.tracks) ||
  !registry.tracks.length
) throw new Error('Invalid live track registry');

const ids = registry.tracks.map(x => x.id);
if (
  new Set(ids).size !== ids.length ||
  !ids.includes(registry.default_track_id)
) throw new Error('Invalid live track registry invariants');

for (const entry of registry.tracks) {
  const manifest = await getJson(`tracks/${entry.id}/manifest.json`);
  if (manifest.id !== entry.id) throw new Error('Manifest track mismatch');

  const presentation = await getJson(`tracks/${entry.id}/presentation.json`);
  const contentV2 = manifest.capabilities?.includes('content-model-v2');
  const evidenceV2 = manifest.capabilities?.includes('learner-evidence-v2');
  const domains = contentV2
    ? await getJson(`tracks/${entry.id}/domains.json`)
    : null;

  if (
    presentation.track_id !== manifest.id ||
    presentation.track_version !== manifest.version
  ) throw new Error('Presentation identity mismatch');

  const profiles = await Promise.all(manifest.exam_profiles.map(getJson));
  const profile = profiles.find(x => x.id === manifest.default_exam_profile);
  if (!profile || profile.track_id !== manifest.id) {
    throw new Error('Invalid default profile');
  }

  for (const p of manifest.content.concept_files) {
    const doc = await getJson(p);
    if (
      !(contentV2 ? doc.domain_id : doc.domain) ||
      !Array.isArray(doc.concepts) ||
      !doc.concepts.length
    ) throw new Error(`Invalid concept chunk: ${p}`);
  }
  await getJson(manifest.content.learn);
  await getJson(manifest.content.cases);

  if (evidenceV2) {
    if (typeof manifest.evidence !== 'string' || !manifest.evidence) {
      throw new Error('Missing learner evidence runtime context');
    }
    const evidence = await getJson(manifest.evidence);
    if (
      evidence?.schema_version !== 1 ||
      typeof evidence.content_release_id !== 'string' ||
      !/^[0-9a-f]{64}$/.test(evidence.question_payload_sha256 || '') ||
      typeof evidence.scoring_policy_path !== 'string' ||
      typeof evidence.scoring_policy_ref !== 'string' ||
      typeof evidence.event_definitions_ref !== 'string'
    ) throw new Error('Invalid live learner evidence runtime context');

    const scoring = await getJson(evidence.scoring_policy_path);
    if (scoring.id !== evidence.scoring_policy_ref) {
      throw new Error('Live scoring policy reference mismatch');
    }

    const definitions = await getJson(evidence.event_definitions_ref);
    if (!Array.isArray(definitions) || !definitions.length) {
      throw new Error('Invalid live learner evidence definitions');
    }
    for (const definition of definitions) {
      if (
        definition.plane !== 'LEARNER_EVIDENCE' ||
        typeof definition.payload_schema_ref !== 'string'
      ) throw new Error('Invalid live learner evidence definition');
      await getJson(definition.payload_schema_ref);
    }

    console.log(
      `live learner evidence context: PASS ${manifest.id} release=${evidence.content_release_id} definitions=${definitions.length} contract=v4`
    );
  }

  if (contentV2) {
    console.log(
      `live content model: PASS ${manifest.id}@${manifest.version} domains=${domains.domains.length} contract=v${evidenceV2 ? 4 : 3}`
    );
  }
}

const sw = await (await response('sw.js')).text();
if (sw.includes('./data/concepts/')) {
  throw new Error('Live service worker pre-caches concept chunks');
}
if (!sw.includes("event.request.mode === 'navigate'")) {
  throw new Error('Live service worker lacks navigation-only fallback');
}
if (!sw.includes('Response.error()')) {
  throw new Error('Live service worker lacks non-navigation error fallback');
}

console.log(
  `live track registry: PASS tracks=${registry.tracks.length} default=${registry.default_track_id}`
);
console.log('live service worker contract: PASS');
