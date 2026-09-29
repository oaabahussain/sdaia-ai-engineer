import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || '.';
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const match = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
if (!match) throw new Error('ASSETS missing');
const assets = [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]);

if (assets.some(asset => asset.includes('/data/concepts/'))) {
  throw new Error('Concept-bank chunks must not be pre-cached');
}

for (const required of [
  './tracks/registry.json',
  './src/tracks/registry.js',
  './src/tracks/selection.js'
]) {
  if (!assets.includes(required)) {
    throw new Error(`Registry bootstrap asset is not pre-cached: ${required}`);
  }
}

const registry = JSON.parse(
  fs.readFileSync(path.join(root, 'tracks/registry.json'), 'utf8')
);
const manifestAssets = registry.tracks.map(
  entry => `./tracks/${entry.id}/manifest.json`
);
let evidenceContextCount = 0;

for (const manifestAsset of manifestAssets) {
  if (!assets.includes(manifestAsset)) {
    throw new Error(`Registry track manifest is not pre-cached: ${manifestAsset}`);
  }

  const manifestPath = manifestAsset.replace(/^\.\//, '');
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, manifestPath), 'utf8')
  );
  const presentationAsset = `./tracks/${manifest.id}/presentation.json`;

  if (manifest.capabilities?.includes('content-model-v2')) {
    const domainAsset = `./tracks/${manifest.id}/domains.json`;
    if (!assets.includes(domainAsset)) {
      throw new Error(`Domain catalog is not pre-cached: ${domainAsset}`);
    }
  }

  if (!assets.includes(presentationAsset)) {
    throw new Error(`Track presentation is not pre-cached: ${presentationAsset}`);
  }

  if (manifest.capabilities?.includes('learner-evidence-v2')) {
    if (typeof manifest.evidence !== 'string' || !manifest.evidence) {
      throw new Error(`Missing learner evidence context for ${manifest.id}`);
    }
    const evidenceAsset = `./${manifest.evidence.replace(/^\.\//, '')}`;
    if (!assets.includes(evidenceAsset)) {
      throw new Error(
        `Learner evidence runtime context is not pre-cached: ${evidenceAsset}`
      );
    }
    const evidenceContext = JSON.parse(
      fs.readFileSync(path.join(root, manifest.evidence.replace(/^\.\//, '')), 'utf8')
    );
    for (const ref of [
      evidenceContext.scoring_policy_path,
      evidenceContext.event_definitions_ref
    ]) {
      if (typeof ref !== 'string' || !ref) {
        throw new Error(`Invalid learner evidence runtime reference for ${manifest.id}`);
      }
      const asset = `./${ref.replace(/^\.\//, '')}`;
      if (!assets.includes(asset)) {
        throw new Error(`K3 runtime evidence asset is not pre-cached: ${asset}`);
      }
    }
    const definitions = JSON.parse(
      fs.readFileSync(
        path.join(root, evidenceContext.event_definitions_ref.replace(/^\.\//, '')),
        'utf8'
      )
    );
    if (!Array.isArray(definitions) || !definitions.length) {
      throw new Error(`Invalid learner evidence definitions for ${manifest.id}`);
    }
    for (const definition of definitions) {
      const payloadPath = definition.payload_schema_ref?.replace(/^\.\//, '');
      if (!payloadPath || !fs.existsSync(path.join(root, payloadPath))) {
        throw new Error(`Missing public K3 payload schema: ${definition.payload_schema_ref}`);
      }
    }
    evidenceContextCount += 1;
  }

  const profiles = manifest.exam_profiles.map(ref => ({
    ref,
    value: JSON.parse(
      fs.readFileSync(path.join(root, ref.replace(/^\.\//, '')), 'utf8')
    ),
  }));
  const defaultProfile = profiles.find(
    item => item.value.id === manifest.default_exam_profile
  );
  if (!defaultProfile) {
    throw new Error(`Missing default exam profile for ${manifest.id}`);
  }
  const defaultAsset = `./${defaultProfile.ref.replace(/^\.\//, '')}`;
  if (!assets.includes(defaultAsset)) {
    throw new Error(
      `Default exam profile is not pre-cached: ${defaultProfile.ref}`
    );
  }
}

for (const asset of assets) {
  if (asset === './') continue;
  const target = path.join(root, asset.replace(/^\.\//, ''));
  if (!fs.existsSync(target)) throw new Error(`Missing precache asset: ${asset}`);
}

console.log(
  `service worker assets: PASS (${assets.length}) shell-only manifests=${manifestAssets.length} evidence-contexts=${evidenceContextCount}`
);
