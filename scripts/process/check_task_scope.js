const H0_R2_PRODUCT_PATHS = [
 'scripts/generate_k3_validators.js','src/evidence/generatedValidators.js','src/evidence/ids.js','src/evidence/contract.js',
 'tests/k3-generated-validators.test.js','tests/k3-evidence-contract-runtime.test.js'
];
function matches(pattern,path){
 if(pattern.endsWith('/**')) return path===pattern.slice(0,-3)||path.startsWith(pattern.slice(0,-2));
 return pattern===path;
}
export function comparisonBaseSha(envelope){
 if(!envelope?.task_base_sha) throw new Error('task_base_sha is required for task scope comparison');
 return envelope.task_base_sha;
}
export function checkTaskScope(packet,changedPaths,{processOnly=false}={}){
 const s=packet?.scope??{}; const violations=[];
 const allowed={added:s.allowed_create??[],modified:s.allowed_modify??[],removed:s.allowed_delete??[]};
 for(const change of changedPaths??[]){
  const path=change.path; const status=change.status;
  if((s.forbidden_paths??[]).some(p=>matches(p,path))) violations.push({path,reason:'FORBIDDEN_PATH'});
  if(processOnly&&H0_R2_PRODUCT_PATHS.includes(path)) violations.push({path,reason:'PRODUCT_SCOPE_LEAK'});
  if(!(allowed[status]??[]).some(p=>matches(p,path))) violations.push({path,reason:'UNDECLARED_CHANGE'});
 }
 return violations.length?{ok:false,code:'SCOPE_EXPANSION_BLOCKED',violations}:{ok:true,code:'TASK_SCOPE_VALID',violations:[]};
}
