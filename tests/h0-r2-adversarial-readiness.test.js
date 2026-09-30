import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runAdversarialReadiness, extractDeclaredStatusCodes, STATUS_CODE_OWNERSHIP } from '../scripts/process/adversarial_readiness.js';
test('all 15 pressure cases fail closed with fixed codes',()=>{
 const r=runAdversarialReadiness(); assert.equal(r.total,15); assert.equal(r.blocked,15); assert.equal(r.accepted,0,JSON.stringify(r.results));
 for(const x of r.results){assert.match(x.code,/^[A-Z0-9_]+$/);assert.notEqual(x.evidence_source,'hardcoded');}
});
test('every declared spec status code has executable or regression ownership',()=>{
 const spec=readFileSync(new URL('../docs/superpowers/specs/2026-09-30-k3-low-model-execution-h0-r2-design.md',import.meta.url),'utf8');
 const codes=extractDeclaredStatusCodes(spec); assert.ok(codes.length>=20);
 for(const code of codes)assert.ok(STATUS_CODE_OWNERSHIP[code],code);
});
