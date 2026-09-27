import path from 'node:path';import process from 'node:process';import {verifyCurrentImport} from './import_current_bank.js';
const root=process.cwd();const outDir=path.join(root,'data','factory');const result=verifyCurrentImport(root,outDir);console.log(`factory import: PASS items=${result.items} objectives=${result.objectives} release=${result.release_id} digest=${result.digest}`);
