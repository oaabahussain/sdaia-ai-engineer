import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';

test('K2 validator discovers present governance artifacts and rejects malformed JSON contracts',async()=>{
 const {validateK2GovernanceArtifacts}=await import('../scripts/validate.js');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'k2-validate-'));
 const dir=path.join(tmp,'data','factory','k2','activation');fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'bad.json'),JSON.stringify({schema_version:1,decision:'PROMOTE'}));
 assert.throws(()=>validateK2GovernanceArtifacts(tmp,process.cwd()),/activation|schema|required/i);
});

test('K2 validator accepts an artifact root with no optional K2 artifacts',async()=>{
 const {validateK2GovernanceArtifacts}=await import('../scripts/validate.js');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'k2-validate-empty-'));
 assert.equal(validateK2GovernanceArtifacts(tmp,process.cwd()),true);
});
