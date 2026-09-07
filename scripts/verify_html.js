import fs from 'node:fs';
import vm from 'node:vm';

const file = process.argv[2] || 'index.html';
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*src=)(?![^>]*type=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).filter((value) => value.trim());
for (const script of scripts) new vm.Script(script);
const moduleScripts = [...html.matchAll(/<script[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*><\/script>/gi)].map((match) => match[1]);
if (!moduleScripts.includes('./src/app.js')) throw new Error('src/app.js module reference missing');
console.log(`inline script parse: PASS (${scripts.length})`);
console.log('module reference: PASS');
