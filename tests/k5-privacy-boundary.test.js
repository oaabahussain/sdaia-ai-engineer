import test from 'node:test';
import assert from 'node:assert/strict';
import {readK5Source} from '../src/mastery/source.js';
import {validateK5Projection} from '../src/mastery/schema.js';
const EMPTY={
 schema_version:1,projection_type:'EvidenceSufficiencyProjectionV1',policy_id:'K5.EVIDENCE.v1',
 source_store_id:'local-store',through_store_seq:0,learner_id:'opaque-learner',
 identity_scope:'LOCAL_UNAUTHENTICATED',track_id:'sdaia-ai-engineer',content_release_id:'release',
 question_payload_sha256:'a'.repeat(64),catalog_version:'catalog-v1',
 catalog_canonical_sha256:'b'.repeat(64),objective_map_canonical_sha256:'c'.repeat(64),
 lineage_map_version:null,lineage_map_canonical_sha256:null,objective_map_version:'objectives-v1',
 identity_resolution_version:null,integrity_status:'COMPLETE',observation_status:'NO_OBSERVATIONS',
 estimation_status:'DISABLED_UNVALIDATED',
 reason_codes:['CALIBRATION_NOT_APPROVED','IDENTITY_UNVERIFIED','NO_EVIDENCE','NO_TRUSTED_EVALUATION'],
 observed_distinct_family_count:0,observed_distinct_interaction_count:0,observed_domain_count:0,
 objectives:[],mastery_estimate:null,readiness_estimate:null,readiness_probability:null,
 confidence_interval:null,model_validation_ref:null
};
const store={store_id:'store',getSourceHead:async()=>({store_id:'store',through_store_seq:0}),
 readRange:async()=>[]};
test('rejects direct PII learner IDs before reading K3 evidence',async()=>{
 for(const learnerId of ['example@example.com','+966555555555','192.168.0.1','2001:db8::1','::1','[2001:db8::5]','::ffff:192.0.2.42','fe80::1%eth0',' 2001:db8::1 ',' [2001:db8::1] ',' 192.168.0.1 ',' +966555555555 ',' example@example.com ','\u200b192.168.0.1\u200b','\u200b+966555555555\u200b','\u202e2001:db8::1\u202c','\u2066[2001:db8::1]\u2069','opaque\u200b-id','\u034f192.168.0.1\u034f','\ufe0f2001:db8::1\ufe0f','\u034f+966555555555\u034f','opaque\ufe0f-id','１９２．１６８．０．１','ｕｓｅｒ＠ｅｘａｍｐｌｅ．ｃｏｍ','＋９６６５５５５５５５５５','２００１：ｄｂ８：：１','＋٩٦٦٥٥٥٥٥٥٥٥','+۹۶۶۵۵۵۵۵۵۵۵','+९६६५५५५५५५५']){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
 }
});
test('strict public K5 projection cannot export direct PII as learner scope',()=>{
 for(const learner_id of ['example@example.com','+966555555555','192.168.0.1','2001:db8::1','::1','[2001:db8::5]','::ffff:192.0.2.42','fe80::1%eth0',' 2001:db8::1 ',' [2001:db8::1] ',' 192.168.0.1 ',' +966555555555 ',' example@example.com ','\u200b192.168.0.1\u200b','\u200b+966555555555\u200b','\u202e2001:db8::1\u202c','\u2066[2001:db8::1]\u2069','opaque\u200b-id','\u034f192.168.0.1\u034f','\ufe0f2001:db8::1\ufe0f','\u034f+966555555555\u034f','opaque\ufe0f-id','１９２．１６８．０．１','ｕｓｅｒ＠ｅｘａｍｐｌｅ．ｃｏｍ','＋９６６５５５５５５５５５','２００１：ｄｂ８：：１','＋٩٦٦٥٥٥٥٥٥٥٥','+۹۶۶۵۵۵۵۵۵۵۵','+९६६५५५५५५५५'])
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id}),/PII|pseudonym/i,learner_id);
});
test('opaque pseudonyms remain valid in the privacy contract',()=>{
 assert.equal(validateK5Projection(EMPTY),true);
});


test('blocks Unicode-dash direct phone PII at BOTH K5 boundaries without rejecting opaque pseudonyms',async()=>{
 const phoneIds=[
  '+٩٦٦‐٥٥٥‐٥٥٥‐٥٥٥', // U+2010 HYPHEN
  '+٩٦٦‑٥٥٥‑٥٥٥‑٥٥٥', // U+2011 NON-BREAKING HYPHEN
  '+٩٦٦–٥٥٥–٥٥٥–٥٥٥', // U+2013 EN DASH
  '+٩٦٦—٥٥٥—٥٥٥—٥٥٥', // U+2014 EM DASH
  '+٩٦٦−٥٥٥−٥٥٥−٥٥٥', // U+2212 MINUS SIGN
  '+٩٦٦⁃٥٥٥⁃٥٥٥⁃٥٥٥', // U+2043 HYPHEN BULLET
  '+٩٦٦﹣٥٥٥﹣٥٥٥﹣٥٥٥', // U+FE63 SMALL HYPHEN-MINUS
  '+٩٦٦－٥٥٥－٥٥٥－٥٥٥', // U+FF0D FULLWIDTH HYPHEN-MINUS
  '٩٦٦‐٥٥٥‐٥٥٥‐٥٥٥', // no +; still direct phone PII
  '+۹۶۶-۵۵۵‐۵۵۵-۵۵۵'  // mixed script/separator
 ];
 for(const learnerId of phoneIds){
  await assert.rejects(
   readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',releaseId:'release',throughStoreSeq:0}),
   /PII|pseudonym/i,learnerId
  );
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),
   /PII|pseudonym/i,learnerId);
 }
 for(const learnerId of ['student‐alpha','learner−demo','batch‐2026‐cohort','9–alpha-id']){
  await assert.doesNotReject(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),learnerId);
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});

test('reject slash-separated phone identifiers at intake and projection',async()=>{
  for(const candidate of ['+٩٦٦／٥٥٥／٥٥٥／٥٥٥','+٩٦٦/٥٥٥/٥٥٥/٥٥٥','+٩٦٦٬٥٥٥٬٥٥٥٬٥٥٥']){
    await assert.rejects(readK5Source({store,learnerId:candidate,trackId:'sdaia-ai-engineer',releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i);
    assert.throws(()=>validateK5Projection({...EMPTY,learner_id:candidate}),/PII|pseudonym/i);
  }
  for(const candidate of ['study/group-2026','learner:demo-25']){
    assert.equal(validateK5Projection({...EMPTY,learner_id:candidate}),true);
  }
});

test('rejects combining-mark separated direct phone numbers at both boundaries',async()=>{
 for(const learnerId of ['+٩٦٦\u0301٥٥٥\u0301٥٥٥\u0301٥٥٥','+966\u0301555\u0301555\u0301555','+٩٦٦\u064e٥٥٥\u064e٥٥٥\u064e٥٥٥']){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),/PII|pseudonym/i,learnerId);
 }
 for(const learnerId of ['cohort\u0301alpha-2026','study\u0301/group']) {
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});

test('rejects Unicode decimal-digit IP addresses at both privacy boundaries',async()=>{
 const directIPs=['١.١.١.١','١٩٢.١٦٨.٠.١','٢٠٠١:db8::1','[٢٠٠١:db8::5]','::ffff:١٩٢.٠.٢.٤٢','2001:db8::١'];
 for(const learnerId of directIPs){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),/PII|pseudonym/i,learnerId);
 }
 for(const learnerId of ['cohort-١٢٣','study-٢٠٢٦-alpha','learner:demo-٣']){
  await assert.doesNotReject(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),learnerId);
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});

test('rejects combining-mark obfuscated IPv4 and IPv6 at both privacy boundaries',async()=>{
 const directIPs=[
  '1\u0301.1\u0301.1\u0301.1',
  '2001\u0301:db8::1',
  '٢٠٠١\u0301:db8::1',
  '١\u064e٩\u064e٢.١\u064e٦\u064e٨.٠.١',
  '[2001\u0301:db8::5]',
  '::ffff:١\u0309٩٢.٠.٢.٤٢'
 ];
 for(const learnerId of directIPs){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),/PII|pseudonym/i,learnerId);
 }
 for(const learnerId of ['cohort\u0301alpha-2026','study\u0301/group','student-٢٠٢٦\u064e-alpha']){
  await assert.doesNotReject(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),learnerId);
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});

test('rejects composed and decomposed IPv6 hex marks at intake and projection',async()=>{
 const directIPs=[
  '2001:db8::fe\u0301',
  '2001:db8::f\u00e9',
  '[2001:db8::fe\u0301]',
  '::ffff:192.0.2.4\u0301',
  '2001:db8::a\u0301',
  '2001:db8::\u00e1',
  '٢٠٠١:db8::fe\u0301'
 ];
 for(const learnerId of directIPs){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),/PII|pseudonym/i,learnerId);
 }
 for(const learnerId of ['cohort-f\u00e9-2026','student-a\u0301lpha','study-\u00e9-group']){
  await assert.doesNotReject(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),learnerId);
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});

test('rejects URL and authority wrapped IP principals at both boundaries',async()=>{
 const bad=[
  'http://192.168.0.1',
  'https://192.168.0.1:443/profile',
  'http://[2001:db8::1]',
  'https://[2001:db8::1]:443/profile',
  '[2001:db8::1]:443',
  '192.168.0.1:8080',
  'http://١٩٢.١٦٨.٠.١',
  'http://[2001:db8::fe\u0301]',
  '//[2001:db8::5]:443'
 ];
 for(const learnerId of bad){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),/PII|pseudonym/i,learnerId);
 }
 for(const learnerId of ['study/group','cohort-2026','https://example.org/cohort','learner:demo-25']){
  await assert.doesNotReject(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),learnerId);
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});

test('rejects special-scheme URL IP hosts without double slashes at both K5 boundaries',async()=>{
 const directIPs=[
  'http:192.168.0.1',
  'https:/192.168.0.1',
  'http:\\192.168.0.1',
  'http:\\\\192.168.0.1',
  'ftp:192.168.0.1',
  'ws:192.168.0.1',
  'wss:/[2001:db8::1]',
  'https:/[2001:db8::1]',
  'http:١٩٢.١٦٨.٠.١',
  'http:%31%39%32.168.0.1'
 ];
 for(const learnerId of directIPs){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),/PII|pseudonym/i,learnerId);
 }
 for(const learnerId of [
  'http:cohort-alpha','https:/example.org/cohort','study:alpha-2026',
  'learner/demo-2026','ftp:cohort-2026'
 ]){
  await assert.doesNotReject(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),learnerId);
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});

test('rejects bracketed IPv6 learner IDs with malformed ports at K3 and K5',async()=>{
 const hiddenIps=[
  '[2001:db8::1]:65536',
  '[2001:db8::1]:abc',
  '[2001:db8::1]:999999',
  'https://[2001:db8::1]:65536/profile',
  '//[2001:db8::1]:abc',
  'http:[2001:db8::1]:abc',
  'wss:/[2001:db8::1]:invalid',
  '[::ffff:192.0.2.42]:unavailable',
  '[٢٠٠١:db8::١]:invalid',
  '[fe80::1%eth0]:bad'
 ];
 for(const learnerId of hiddenIps){
  await assert.rejects(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),/PII|pseudonym/i,learnerId);
  assert.throws(()=>validateK5Projection({...EMPTY,learner_id:learnerId}),/PII|pseudonym/i,learnerId);
 }
 for(const learnerId of ['[cohort-alpha]:invalid','[topic:alpha]:bad','learner-[batch]:not-a-port']){
  await assert.doesNotReject(readK5Source({store,learnerId,trackId:'sdaia-ai-engineer',
   releaseId:'release',throughStoreSeq:0}),learnerId);
  assert.equal(validateK5Projection({...EMPTY,learner_id:learnerId}),true,learnerId);
 }
});
