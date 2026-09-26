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

const manifestAssets = assets.filter(asset => /^\.\/tracks\/[^/]+\/manifest\.json$/.test(asset));
if (!manifestAssets.length) throw new Error('No canonical track manifest is pre-cached');

for (const manifestAsset of manifestAssets) {
  const manifestPath = manifestAsset.replace(/^\.\//, '');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'));
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
