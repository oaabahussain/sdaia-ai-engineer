const KNOWN_RULES=[
 {id:'F003_INLINE_YAML_CP_R',test:(content)=>/assert\.(?:match|ok)\([^\n]*cp\s+-R\s+/i.test(content)}
];
export function checkTestContracts(files){
 const findings=[];
 for(const file of files??[]) for(const rule of KNOWN_RULES) if(rule.test(file.content??'')) findings.push({code:rule.id,path:file.path});
 return findings.length?{ok:false,code:'IMPLEMENTATION_COUPLING_BLOCKED',findings}:{ok:true,code:'TEST_CONTRACTS_VALID',findings:[]};
}
