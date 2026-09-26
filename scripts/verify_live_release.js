const rawBase = process.argv[2];
if (!rawBase) throw new Error('Usage: node scripts/verify_live_release.js <base-url>');
const base = rawBase.replace(/\/$/, '');

const response = async path => {
  const relative = path.replace(/^\.\//, '');
  const result = await fetch(`${base}/${relative}`, { cache: 'no-store' });
  if (!result.ok) throw new Error(`${path}: HTTP ${result.status}`);
  return result;
};
const getJson = async path => (await response(path)).json();

const manifest = await getJson('tracks/sdaia-ai-engineer/manifest.json');
const profiles = await Promise.all(manifest.exam_profiles.map(getJson));
const profile = profiles.find(item => item.id === manifest.default_exam_profile);
if (!profile) throw new Error(`Missing default profile ${manifest.default_exam_profile}`);
if (profile.track_id !== manifest.id) throw new Error('Default profile track mismatch');
if (!Number.isInteger(profile.question_count) || profile.question_count < 1) throw new Error('Invalid default profile question_count');

for (const path of manifest.content.concept_files) {
  const doc = await getJson(path);
  if (!doc.domain || !Array.isArray(doc.concepts) || !doc.concepts.length) throw new Error(`Invalid concept chunk: ${path}`);
}
await getJson(manifest.content.learn);
await getJson(manifest.content.cases);

const sw = await (await response('sw.js')).text();
if (sw.includes('./data/concepts/')) throw new Error('Live service worker pre-caches concept chunks');
if (!sw.includes("event.request.mode === 'navigate'")) throw new Error('Live service worker lacks navigation-only fallback');
if (!sw.includes('Response.error()')) throw new Error('Live service worker lacks non-navigation error fallback');

console.log(`live track manifest: PASS ${manifest.id}@${manifest.version}`);
console.log(`live default exam profile: PASS ${profile.id} questions=${profile.question_count}`);
console.log(`live content refs: PASS concept_chunks=${manifest.content.concept_files.length}`);
console.log('live service worker contract: PASS');
