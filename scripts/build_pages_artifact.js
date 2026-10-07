import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const output = resolve(process.argv[2] || join(repoRoot, '_site'));

if (output === repoRoot) throw new Error('Refusing to build Pages artifact over repository root');

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

const copyFile = (relative) => {
  const source = join(repoRoot, relative);
  if (!existsSync(source)) throw new Error('Missing Pages source: ' + relative);
  cpSync(source, join(output, relative), { recursive: true });
};

for (const relative of [
  'index.html',
  'feedback.html',
  'manifest.webmanifest',
  'sw.js',
  'icon.svg',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'src',
  'tracks'
]) copyFile(relative);

rmSync(join(output, 'src/platform-kernel'), { recursive: true, force: true });

for (const relative of [
  'data/concepts',
  'data/migrations',
  'data/learn.json',
  'data/cases.json',
  'data/evidence/sdaia-ai-engineer.objectives-v1.json',
  'data/evidence/sdaia-ai-engineer.runtime-v1.json',
  'data/evidence/sdaia-ai-engineer.scoring-v1.json',
  'data/evidence/event-definitions-v1.json',
  'data/evidence/payload-schemas'
]) copyFile(relative);

for (const forbidden of ['data/legacy', 'data/factory', 'src/platform-kernel']) {
  if (existsSync(join(output, forbidden))) {
    throw new Error('Forbidden Pages artifact path: ' + forbidden);
  }
}

if (!existsSync(join(output, 'data/evidence/sdaia-ai-engineer.objectives-v1.json'))) {
  throw new Error('Missing Pages K3 objective runtime projection');
}
if (!existsSync(join(output, 'tracks/registry.json'))) {
  throw new Error('Missing Pages track registry');
}

writeFileSync(join(output, '.nojekyll'), '');
console.log('pages artifact: PASS ' + output);
