import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || '.';
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const match = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
if (!match) throw new Error('ASSETS missing');
const assets = [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
for (const asset of assets) {
  if (asset === './') continue;
  const target = path.join(root, asset.replace(/^\.\//, ''));
  if (!fs.existsSync(target)) throw new Error(`Missing precache asset: ${asset}`);
}
console.log(`service worker assets: PASS (${assets.length})`);
