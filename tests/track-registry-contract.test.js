import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

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
