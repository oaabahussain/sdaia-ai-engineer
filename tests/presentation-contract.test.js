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

test('presentation contract requires exact manifest locale coverage and valid default', async () => {
  const { validatePresentationContract } = await import('../scripts/validate.js');
  const manifest = readJson('../tracks/sdaia-ai-engineer/manifest.json');
  const profile = readJson('../tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json');
  const presentation = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  const missingEn = structuredClone(presentation); delete missingEn.locales.en;
  assert.throws(() => validatePresentationContract(manifest, profile, missingEn), /locale/i);
  const extraFr = structuredClone(presentation); extraFr.locales.fr=structuredClone(extraFr.locales.en);
  assert.throws(() => validatePresentationContract(manifest, profile, extraFr), /locale/i);
  assert.throws(() => validatePresentationContract(manifest, profile, {...presentation,default_locale:'fr'}), /default locale/i);
});

test('presentation contract requires every exam domain label in every locale', async () => {
  const { validatePresentationContract } = await import('../scripts/validate.js');
  const manifest = readJson('../tracks/sdaia-ai-engineer/manifest.json');
  const profile = readJson('../tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json');
  const presentation = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  const domain = Object.keys(profile.weights)[0];
  const missingAr = structuredClone(presentation); delete missingAr.locales.ar.domain_labels[domain];
  assert.throws(() => validatePresentationContract(manifest, profile, missingAr), /domain label/i);
  const missingEn = structuredClone(presentation); delete missingEn.locales.en.domain_labels[domain];
  assert.throws(() => validatePresentationContract(manifest, profile, missingEn), /domain label/i);
});

test('runtime presentation loader fetches the canonical track path', async () => {
  const { loadTrackPresentation } = await import('../src/presentation/trackPresentation.js');
  const manifest = readJson('../tracks/sdaia-ai-engineer/manifest.json');
  const presentation = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  const calls=[];
  const result=await loadTrackPresentation(async path=>{calls.push(path);return presentation},manifest);
  assert.deepEqual(calls,[`./tracks/${manifest.id}/presentation.json`]);
  assert.equal(result,presentation);
});

test('runtime presentation loader rejects incompatible track identity and version', async () => {
  const { loadTrackPresentation } = await import('../src/presentation/trackPresentation.js');
  const manifest = readJson('../tracks/sdaia-ai-engineer/manifest.json');
  const presentation = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  await assert.rejects(() => loadTrackPresentation(async()=>({...presentation,track_id:'wrong-track'}),manifest), /track mismatch/i);
  await assert.rejects(() => loadTrackPresentation(async()=>({...presentation,track_version:'wrong'}),manifest), /version mismatch/i);
});

test('presentation locale resolver uses only core-manifest-presentation intersection', async () => {
  const { resolvePresentationLocale } = await import('../src/presentation/trackPresentation.js');
  const manifest = readJson('../tracks/sdaia-ai-engineer/manifest.json');
  const presentation = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  assert.equal(resolvePresentationLocale('en',manifest,presentation),'en');
  assert.equal(resolvePresentationLocale('fr',manifest,presentation),'ar');
  assert.equal(resolvePresentationLocale('fr',manifest,{...presentation,default_locale:'en'}),'en');
  const noCommonManifest={...manifest,locales:['fr']};
  const frLocale=structuredClone(presentation.locales.en);
  const noCommonPresentation={...presentation,default_locale:'fr',locales:{fr:frLocale}};
  assert.throws(()=>resolvePresentationLocale('fr',noCommonManifest,noCommonPresentation),/common locale/i);
});

test('presentation accessors return locale data and safe domain fallbacks', async () => {
  const { getPresentationLocale, getDomainLabel } = await import('../src/presentation/trackPresentation.js');
  const presentation = readJson('../tracks/sdaia-ai-engineer/presentation.json');
  assert.equal(getPresentationLocale(presentation,'ar'), presentation.locales.ar);
  assert.equal(getPresentationLocale(presentation,'fr'), null);
  assert.equal(getDomainLabel(presentation,'ar','MLOps / LLMOps'),'عمليات تعلم الآلة والنماذج اللغوية');
  assert.equal(getDomainLabel(presentation,'ar','Unknown Domain'),'Unknown Domain');
  assert.equal(getDomainLabel(null,'ar','Unknown Domain'),'Unknown Domain');
});
