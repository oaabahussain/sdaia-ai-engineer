import fs from 'node:fs';
import path from 'node:path';
export function loadConcepts(root=process.cwd()){
  const dir=path.join(root,'data','concepts');
  const docs=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort().map(name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8')));
  return Object.fromEntries(docs.map(doc=>[doc.domain,doc.concepts]));
}
