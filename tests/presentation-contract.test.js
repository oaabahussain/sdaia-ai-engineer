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
