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

for (const required of ['./tracks/registry.json','./src/tracks/registry.js','./src/tracks/selection.js']) if (!assets.includes(required)) throw new Error(`Registry bootstrap asset is not pre-cached: ${required}`);
const registry=JSON.parse(fs.readFileSync(path.join(root,'tracks/registry.json'),'utf8'));
const manifestAssets=registry.tracks.map(entry=>`./tracks/${entry.id}/manifest.json`);
for (const manifestAsset of manifestAssets) {
  if(!assets.includes(manifestAsset)) throw new Error(`Registry track manifest is not pre-cached: ${manifestAsset}`);
  const manifestPath = manifestAsset.replace(/^\.\//, '');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'));
  const presentationAsset = `./tracks/${manifest.id}/presentation.json`;
  if(manifest.capabilities?.includes('content-model-v2')){const domainAsset=`./tracks/${manifest.id}/domains.json`;if(!assets.includes(domainAsset))throw new Error(`Domain catalog is not pre-cached: ${domainAsset}`)}
  if (!assets.includes(presentationAsset)) throw new Error(`Track presentation is not pre-cached: ${presentationAsset}`);
  const profiles = manifest.exam_profiles.map(ref => ({
    ref,
    value: JSON.parse(fs.readFileSync(path.join(root, ref.replace(/^\.\//, '')), 'utf8')),
  }));
  const defaultProfile = profiles.find(item => item.value.id === manifest.default_exam_profile);
  if (!defaultProfile) throw new Error(`Missing default exam profile for ${manifest.id}`);
  const defaultAsset = `./${defaultProfile.ref.replace(/^\.\//, '')}`;
  if (!assets.includes(defaultAsset)) throw new Error(`Default exam profile is not pre-cached: ${defaultProfile.ref}`);
}

for (const asset of assets) {
  if (asset === './') continue;
  const target = path.join(root, asset.replace(/^\.\//, ''));
  if (!fs.existsSync(target)) throw new Error(`Missing precache asset: ${asset}`);
}
console.log(`service worker assets: PASS (${assets.length}) shell-only manifests=${manifestAssets.length}`);
