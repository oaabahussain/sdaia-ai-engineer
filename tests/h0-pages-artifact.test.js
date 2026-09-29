import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

function manifest(root) {
  const files=[];
  const walk=(dir)=>{
    for(const name of readdirSync(dir).sort()){
      const p=join(dir,name);
      if(statSync(p).isDirectory()) walk(p);
      else files.push([relative(root,p).replaceAll('\\\\','/'),createHash('sha256').update(readFileSync(p)).digest('hex')]);
    }
  };
  walk(root);
  return files;
}

test('Pages artifact builder preserves the governed public boundary deterministically', () => {
  const a=mkdtempSync(join(tmpdir(),'h0-pages-a-'));
  const b=mkdtempSync(join(tmpdir(),'h0-pages-b-'));
  try {
    execFileSync(process.execPath,['scripts/build_pages_artifact.js',a],{stdio:'pipe'});
    execFileSync(process.execPath,['scripts/build_pages_artifact.js',b],{stdio:'pipe'});
    for(const p of [
      'index.html','feedback.html','manifest.webmanifest','sw.js','tracks/registry.json',
      'data/learn.json','data/cases.json',
      'data/evidence/sdaia-ai-engineer.runtime-v1.json',
      'data/evidence/sdaia-ai-engineer.scoring-v1.json',
      'data/evidence/event-definitions-v1.json'
    ]) assert.equal(existsSync(join(a,p)),true,p);
    assert.equal(existsSync(join(a,'data/evidence/payload-schemas')),true);
    for(const p of ['data/legacy','data/factory','src/platform-kernel']) assert.equal(existsSync(join(a,p)),false,p);
    assert.deepEqual(manifest(a),manifest(b));
  } finally {
    rmSync(a,{recursive:true,force:true});
    rmSync(b,{recursive:true,force:true});
  }
});
