import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';
import { loadTrackRegistry } from '../scripts/load_track.js';

const schema = JSON.parse(fs.readFileSync(new URL('../data/schema/track-registry.schema.json', import.meta.url), 'utf8'));
const registry = JSON.parse(fs.readFileSync(new URL('../tracks/registry.json', import.meta.url), 'utf8'));
const validate = new Ajv({allErrors:true, strict:false}).compile(schema);

test('TrackRegistryV1 accepts the canonical minimal shape', () => {
  assert.equal(validate({schema_version:1, default_track_id:'sdaia-ai-engineer', tracks:[{id:'sdaia-ai-engineer'}]}), true);
});

test('TrackRegistryV1 rejects arbitrary fields', () => {
  assert.equal(validate({...registry, extra:true}), false);
  assert.equal(validate({...registry, tracks:[{id:'sdaia-ai-engineer', extra:true}]}), false);
});

test('production registry is the single current SDAIA track', () => {
  assert.equal(registry.schema_version, 1);
  assert.equal(registry.default_track_id, 'sdaia-ai-engineer');
  assert.deepEqual(registry.tracks, [{id:'sdaia-ai-engineer'}]);
});


test('tooling loads the canonical track registry', () => {
  const root = new URL('..', import.meta.url).pathname;
  assert.deepEqual(loadTrackRegistry(root), registry);
});


test('registry validation rejects a missing default and duplicate ids', async () => {
  const { validateTrackRegistry } = await import('../scripts/load_track.js');
  assert.throws(() => validateTrackRegistry({schema_version:1, default_track_id:'missing', tracks:[{id:'a'}]}), /default/i);
  assert.throws(() => validateTrackRegistry({schema_version:1, default_track_id:'a', tracks:[{id:'a'},{id:'a'}]}), /duplicate/i);
});


test('runtime registry resolver is generic and deterministic', async () => {
  const mod = await import('../src/tracks/registry.js');
  const fixture={schema_version:1,default_track_id:'a',tracks:[{id:'a'},{id:'b'}]};
  assert.equal(mod.resolveActiveTrackId({registry:fixture,requestedTrackId:'b',savedTrackId:'a'}),'b');
  assert.equal(mod.resolveActiveTrackId({registry:fixture,requestedTrackId:'missing',savedTrackId:'b'}),'b');
  assert.equal(mod.resolveActiveTrackId({registry:fixture,requestedTrackId:'missing',savedTrackId:'missing'}),'a');
  let seen=[]; const loaded=await mod.loadTrackRegistry(async p=>{seen.push(p);return fixture});
  assert.deepEqual(loaded,fixture);assert.deepEqual(seen,['./tracks/registry.json']);
});


test('track selection uses only the neutral preference key and tolerates storage failure', async () => {
  const mod=await import('../src/tracks/selection.js');
  assert.equal(mod.TRACK_SELECTION_KEY,'learning-platform.track-id.v1');
  const calls=[];const storage={getItem:k=>{calls.push(['get',k]);return 'x'},setItem:(k,v)=>calls.push(['set',k,v])};
  assert.equal(mod.readSavedTrackId(storage),'x');mod.saveTrackId('y',storage);
  assert.deepEqual(calls,[['get','learning-platform.track-id.v1'],['set','learning-platform.track-id.v1','y']]);
  assert.equal(mod.readSavedTrackId({getItem(){throw new Error('blocked')}}),null);
});


test('synthetic two-track fixture exercises generic resolver without entering production', async()=>{const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/track-registry-two-tracks.json',import.meta.url),'utf8'));assert.equal(validate(fixture),true,JSON.stringify(validate.errors));const {resolveActiveTrackId}=await import('../src/tracks/registry.js');assert.equal(resolveActiveTrackId({registry:fixture,requestedTrackId:'example-track'}),'example-track');assert.deepEqual(registry.tracks,[{id:'sdaia-ai-engineer'}]);for(const p of ['../.github/workflows/ci.yml','../.github/workflows/pages.yml'])assert.doesNotMatch(fs.readFileSync(new URL(p,import.meta.url),'utf8'),/tests\/fixtures/)});
