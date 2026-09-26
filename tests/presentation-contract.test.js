import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Ajv from 'ajv';

const readJson = p => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), 'utf8'));

test('TrackPresentationV1 schema accepts the minimal valid shape', () => {
  const schema = readJson('../data/schema/track-presentation.schema.json');
  const validate = new Ajv({allErrors:true,strict:false}).compile(schema);
  const doc = {
    schema_version: 1,
    track_id: 'example-track',
    track_version: '1',
    default_locale: 'ar',
    locales: {
      ar: {display_name:'Example',brand:'Example',hero:{eyebrow:'x',title:'y',description:'z'},domain_labels:{d:'مجال'}}
    }
  };
  assert.equal(validate(doc), true, JSON.stringify(validate.errors));
});

test('TrackPresentationV1 rejects missing hero fields and arbitrary contract fields', () => {
  const schema = readJson('../data/schema/track-presentation.schema.json');
  const validate = new Ajv({allErrors:true,strict:false}).compile(schema);
  const missingHero = {
    schema_version:1,track_id:'example-track',track_version:'1',default_locale:'ar',
    locales:{ar:{display_name:'Example',brand:'Example',hero:{eyebrow:'x',title:'y'},domain_labels:{d:'مجال'}}}
  };
  assert.equal(validate(missingHero), false);
  const extra = {
    schema_version:1,track_id:'example-track',track_version:'1',default_locale:'ar',extra:true,
    locales:{ar:{display_name:'Example',brand:'Example',hero:{eyebrow:'x',title:'y',description:'z'},domain_labels:{d:'مجال'}}}
  };
  assert.equal(validate(extra), false);
});

test('current SDAIA presentation validates and matches track identity', () => {
  const schema = readJson('../data/schema/track-presentation.schema.json');
  const validate = new Ajv({allErrors:true,strict:false}).compile(schema);
  const doc = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  assert.equal(validate(doc), true, JSON.stringify(validate.errors));
  assert.equal(doc.track_id, 'sdaia-ai-engineer');
  assert.equal(doc.track_version, '2026.09');
  assert.equal(doc.default_locale, 'ar');
  assert.deepEqual(Object.keys(doc.locales).sort(), ['ar','en']);
  assert.equal(Object.keys(doc.locales.ar.domain_labels).length, 7);
  assert.equal(Object.keys(doc.locales.en.domain_labels).length, 7);
});

test('presentation contract rejects track and version mismatch', async () => {
  const { validatePresentationContract } = await import('../scripts/validate.js');
  assert.equal(typeof validatePresentationContract, 'function');
  const manifest = readJson('../tracks/sdaia-ai-engineer/manifest.json');
  const profile = readJson('../tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json');
  const presentation = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  assert.throws(() => validatePresentationContract(manifest, profile, {...presentation,track_id:'wrong-track'}), /track mismatch/i);
  assert.throws(() => validatePresentationContract(manifest, profile, {...presentation,track_version:'wrong'}), /version mismatch/i);
});
