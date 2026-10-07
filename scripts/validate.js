import fs from 'node:fs';import path from 'node:path';import process from 'node:process';import Ajv from 'ajv';import addFormats from 'ajv-formats';import { expandConceptBank } from '../src/logic/questionBank.js';import { weightedAllocation } from '../src/logic/exam.js';import { loadTrack, loadTrackRegistry, validateTrackRegistry } from './load_track.js';import { verifyCurrentImport } from './platform-kernel/import_current_bank.js';
const root=process.cwd();const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));const retired=['data/questions.json','data/sessions.json','data/weights.json','data/schema/question.schema.json','data/schema/session.schema.json','data/schema/bank.schema.json','data/schema/state.schema.json'];for(const file of retired){if(fs.existsSync(path.join(root,file)))throw new Error(`Retired active path still exists: ${file}`)}for(const file of ['data/legacy/static-bank-v1/questions.json','data/legacy/static-bank-v1/sessions.json']){if(!fs.existsSync(path.join(root,file)))throw new Error(`Missing legacy migration input: ${file}`)};const ajv=new Ajv({allErrors:true,strict:false});addFormats(ajv);const assertSchema=(s,v,l)=>{const fn=ajv.compile(s);if(!fn(v))throw new Error(`${l}: ${ajv.errorsText(fn.errors)}`)};
export function validatePresentationContract(manifest,examProfile,presentation){if(presentation.track_id!==manifest.id)throw new Error('presentation track mismatch');if(presentation.track_version!==manifest.version)throw new Error('presentation version mismatch');const manifestLocales=[...manifest.locales].sort();const presentationLocales=Object.keys(presentation.locales||{}).sort();if(JSON.stringify(manifestLocales)!==JSON.stringify(presentationLocales))throw new Error('presentation locale mismatch');if(!manifest.locales.includes(presentation.default_locale))throw new Error('presentation default locale mismatch');for(const locale of manifest.locales){for(const domain of Object.keys(examProfile.weights||{})){const label=presentation.locales?.[locale]?.domain_labels?.[domain];if(typeof label!=='string'||!label.trim())throw new Error(`presentation domain label missing: ${locale}:${domain}`)}}return true}
export function validateRegistryContract(rootDir, registry=loadTrackRegistry(rootDir)){validateTrackRegistry(registry);for(const entry of registry.tracks){const bundle=loadTrack(rootDir,entry.id);if(bundle.manifest.id!==entry.id)throw new Error(`Registry manifest id mismatch: ${entry.id}`);validatePresentationContract(bundle.manifest,bundle.examProfile,bundle.presentation)}return true}
const registry=loadTrackRegistry(root);validateRegistryContract(root,registry);const {manifest,presentation,examProfile,concepts,domains}=loadTrack(root,registry.default_track_id);assertSchema(read('data/schema/track-manifest.schema.json'),manifest,'manifest');assertSchema(read(manifest.capabilities?.includes('content-model-v2')?'data/schema/exam-profile-v2.schema.json':'data/schema/exam-profile.schema.json'),examProfile,'exam profile');if(domains)assertSchema(read('data/schema/domain-catalog-v2.schema.json'),domains,'domain catalog');assertSchema(read('data/schema/track-presentation.schema.json'),presentation,'presentation');if(examProfile.track_id!==manifest.id)throw new Error('exam profile track mismatch');validatePresentationContract(manifest,examProfile,presentation);if(!(manifest.core_contract.min<=2&&2<=manifest.core_contract.max))throw new Error('core contract excludes v2');
if(!Number.isInteger(examProfile.question_count)||examProfile.question_count<1)throw new Error('Invalid exam profile question_count');if(!Array.isArray(examProfile.section_sizes)||!examProfile.section_sizes.length||examProfile.section_sizes.some(x=>x!=='all'&&(!Number.isInteger(x)||x<1)))throw new Error('Invalid exam profile section_sizes');const weights=examProfile.weights;const questions=expandConceptBank(concepts,{trackId:manifest.id,domainCatalog:domains});if(!questions.length)throw new Error('Canonical track generated no questions');const ids=new Set(),prompts=new Set(),answerCounts=[0,0,0,0],domainCounts=Object.fromEntries(Object.keys(weights).map(d=>[d,0]));for(const q of questions){if(ids.has(q.id))throw new Error(`Duplicate id ${q.id}`);ids.add(q.id);const k=`${q.domain_id}|${q.question}|${q.question_en}`;if(prompts.has(k))throw new Error(`Duplicate prompt ${q.id}`);prompts.add(k);if(!(q.domain_id in domainCounts))throw new Error(`Unknown domain ${q.domain_id}`);if(!q.question||!q.question_en||q.options.length!==4||q.options_en.length!==4||q.answer<0||q.answer>3)throw new Error(`Invalid bilingual question ${q.id}`);domainCounts[q.domain_id]++;answerCounts[q.answer]++}for(const domain of Object.keys(weights)){if(!domainCounts[domain])throw new Error(`Weighted domain has no generated questions: ${domain}`)}const sum=Object.values(weights).reduce((s,n)=>s+Number(n),0);if(Math.abs(sum-100)>1e-9)throw new Error(`Weights sum ${sum}`);const allocation=weightedAllocation(weights,examProfile.question_count);if(Object.values(allocation).reduce((s,n)=>s+n,0)!==examProfile.question_count)throw new Error('Allocation mismatch');console.log(`generated questions: PASS (${questions.length})`);console.log(`domains: PASS ${JSON.stringify(domainCounts)}`);console.log(`answer positions: PASS ${answerCounts.join('/')}`);console.log(`weights: PASS (${sum.toFixed(1)})`);console.log(`weighted ${examProfile.question_count}: PASS ${JSON.stringify(allocation)}`);

const factoryRoot=path.join(root,'data','factory');
const factorySchemas={
 objective:ajv.compile(read('data/schema/learning-objective-v1.schema.json')),
 source:ajv.compile(read('data/schema/evidence-source-v1.schema.json')),
 family:ajv.compile(read('data/schema/question-family-v2.schema.json')),
 item:ajv.compile(read('data/schema/item-version-v1.schema.json')),
 provenance:ajv.compile(read('data/schema/provenance-record-v1.schema.json')),
 release:ajv.compile(read('data/schema/content-release-manifest-v1.schema.json')),
 sourcePolicy:ajv.compile(read('data/schema/source-policy-v1.schema.json')),
 qualityPolicy:ajv.compile(read('data/schema/quality-policy-v1.schema.json')),
 reviewPolicy:ajv.compile(read('data/schema/review-policy-v1.schema.json'))
};
const assertCompiled=(fn,value,label)=>{if(!fn(value))throw new Error(`${label}: ${ajv.errorsText(fn.errors)}`)};
for(const [name,key] of [['default-source-policy.json','sourcePolicy'],['default-quality-policy.json','qualityPolicy'],['default-review-policy.json','reviewPolicy']])assertCompiled(factorySchemas[key],read('data/factory/policies/'+name),'factory policy '+name);
const objectivesDoc=read('data/factory/knowledge/objectives.json');if(!Array.isArray(objectivesDoc.objectives)||objectivesDoc.objectives.length!==140)throw new Error('Factory objective migration count mismatch');for(const o of objectivesDoc.objectives)assertCompiled(factorySchemas.objective,o,'factory objective '+o.objective_id);
const sourcesDoc=read('data/factory/sources/approved-sources.json');if(!Array.isArray(sourcesDoc.sources))throw new Error('Factory source registry invalid');for(const s of sourcesDoc.sources)assertCompiled(factorySchemas.source,s,'factory source '+s.source_id);
const releaseDoc=read('data/factory/releases/sdaia-bootstrap-v1.manifest.json');assertCompiled(factorySchemas.release,releaseDoc,'factory bootstrap release');
const rows=fs.readFileSync(path.join(factoryRoot,'releases','sdaia-bootstrap-v1.items.ndjson'),'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);if(rows.length!==1120)throw new Error('Factory item migration count mismatch');for(const row of rows){assertCompiled(factorySchemas.family,row.family,'factory family '+row.family?.family_id);assertCompiled(factorySchemas.item,row.item,'factory item '+row.item?.item_version_id)}
const migrationDoc=read('data/factory/migrations/sdaia-current-bank-v1.json');if(migrationDoc.origin!=='migrated-grandfathered'||migrationDoc.quality_reports_created!==0)throw new Error('Factory migration provenance is not honest');if(!Array.isArray(migrationDoc.provenance_records)||migrationDoc.provenance_records.length!==1120)throw new Error('Factory migration provenance count mismatch');for(const p of migrationDoc.provenance_records)assertCompiled(factorySchemas.provenance,p,'factory provenance '+p.record_id);
const factoryVerification=verifyCurrentImport(root,factoryRoot);console.log(`factory governance: PASS items=${factoryVerification.items} objectives=${factoryVerification.objectives} release=${factoryVerification.release_id}`);


const K2_GOVERNANCE_SCHEMA_MAP=Object.freeze({
  expansion:'expansion-plan-v1.schema.json',
  tranche:'tranche-plan-v1.schema.json',
  activation:'activation-evidence-v1.schema.json',
  improvement:'improvement-finding-v1.schema.json',
  experiments:'experiment-record-v1.schema.json',
  'event-definitions':'event-definition-v1.schema.json',
  'provider-routing':'provider-routing-policy-v1.schema.json',
  'review-calibration':'review-calibration-policy-v1.schema.json',
  'dedup-calibration':'dedup-calibration-policy-v1.schema.json',
  'canary-policy':'canary-policy-v1.schema.json'
});

export function validateK2GovernanceArtifacts(artifactRoot, schemaRoot=artifactRoot){
  const base=path.join(artifactRoot,'data','factory','k2');
  const schemaBase=path.join(schemaRoot,'data','schema');
  for(const [kind,schemaName] of Object.entries(K2_GOVERNANCE_SCHEMA_MAP)){
    const dir=path.join(base,kind);
    if(!fs.existsSync(dir))continue;
    const schema=JSON.parse(fs.readFileSync(path.join(schemaBase,schemaName),'utf8'));
    const validate=ajv.compile(schema);
    for(const name of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){
      const file=path.join(dir,name);
      let value;
      try{value=JSON.parse(fs.readFileSync(file,'utf8'))}catch(error){throw new Error(`K2 ${kind} ${name}: invalid JSON: ${error.message}`)}
      if(!validate(value))throw new Error(`K2 ${kind} ${name}: ${ajv.errorsText(validate.errors)}`);
    }
  }
  return true;
}

validateK2GovernanceArtifacts(root,root);
console.log('k2 governance artifacts: PASS');


const K3_RELEASE_SCHEMA_FILES=Object.freeze([
  'learner-evidence-event-v2.schema.json',
  'event-definition-v2.schema.json',
  'evidence-storage-receipt-v1.schema.json',
  'evidence-batch-result-v1.schema.json',
  'evidence-outbox-record-v1.schema.json',
  'evidence-export-record-v1.schema.json',
  'activity-projection-v1.schema.json',
  'attempt-projection-v1.schema.json',
  'assessment-form-snapshot-v1.schema.json',
  'runtime-evidence-context-v1.schema.json',
  'learner-identity-link-record-v1.schema.json'
]);

function readK3Json(rootDir,relative,label=relative){
  const file=path.join(rootDir,relative);
  if(!fs.existsSync(file))throw new Error(`Missing K3 release artifact: ${relative}`);
  try{return JSON.parse(fs.readFileSync(file,'utf8'))}
  catch(error){throw new Error(`${label}: invalid JSON: ${error.message}`)}
}

export function validateK3ReleaseArtifacts(artifactRoot=root,schemaRoot=artifactRoot){
  const localAjv=new Ajv({allErrors:true,strict:false});
  addFormats(localAjv);

  for(const name of K3_RELEASE_SCHEMA_FILES){
    const schema=readK3Json(schemaRoot,`data/schema/${name}`,`K3 schema ${name}`);
    try{localAjv.compile(schema)}
    catch(error){throw new Error(`K3 schema ${name}: ${error.message}`)}
  }

  const definitionSchema=readK3Json(schemaRoot,'data/schema/event-definition-v2.schema.json');
  const validateDefinition=localAjv.compile(definitionSchema);
  const definitions=readK3Json(artifactRoot,'data/evidence/event-definitions-v1.json','K3 event definitions');
  if(!Array.isArray(definitions)||!definitions.length)throw new Error('K3 event definitions must be a non-empty array');

  for(const definition of definitions){
    if(!validateDefinition(definition)){
      throw new Error(`K3 event definition ${definition?.event_name??'unknown'}: ${localAjv.errorsText(validateDefinition.errors)}`);
    }
    if(definition.plane!=='LEARNER_EVIDENCE')throw new Error('K3 event definition must remain on LEARNER_EVIDENCE plane');
    const ref=definition.payload_schema_ref;
    if(typeof ref!=='string'||!ref)throw new Error('K3 event definition payload schema reference is required');
    const payloadSchema=readK3Json(artifactRoot,ref,`K3 payload schema ${ref}`);
    try{localAjv.compile(payloadSchema)}
    catch(error){throw new Error(`K3 payload schema ${ref}: ${error.message}`)}
  }

  const runtimeSchema=readK3Json(schemaRoot,'data/schema/runtime-evidence-context-v1.schema.json');
  const validateRuntime=localAjv.compile(runtimeSchema);
  const runtime=readK3Json(artifactRoot,'data/evidence/sdaia-ai-engineer.runtime-v1.json','K3 runtime evidence context');
  if(!validateRuntime(runtime))throw new Error(`K3 runtime evidence context: ${localAjv.errorsText(validateRuntime.errors)}`);

  const scoring=readK3Json(artifactRoot,'data/evidence/sdaia-ai-engineer.scoring-v1.json','K3 scoring policy');
  if(scoring.id!==runtime.scoring_policy_ref)throw new Error('K3 scoring policy reference mismatch');

  for(const [label,relative,mappingVersion,standard,standardVersion] of [
    ['xAPI','data/evidence/mappings/xapi-v1.json','xapi-k3.v1','xAPI','2.0'],
    ['Caliper','data/evidence/mappings/caliper-v1.json','caliper-k3.v1','Caliper','1.2']
  ]){
    const mapping=readK3Json(artifactRoot,relative,`${label} mapping`);
    if(
      mapping.schema_version!==1||
      mapping.mapping_version!==mappingVersion||
      mapping.standard!==standard||
      mapping.standard_version!==standardVersion||
      typeof mapping.adapter_id!=='string'||!mapping.adapter_id||
      typeof mapping.adapter_version!=='string'||!mapping.adapter_version
    )throw new Error(`${label} mapping version/governance mismatch`);
  }
  return true;
}

validateK3ReleaseArtifacts(root,root);
console.log('k3 release artifacts: PASS');
