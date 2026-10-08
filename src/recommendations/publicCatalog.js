// K4 bootstrap catalog: only K2-reviewed, currently shipped public QuestionFamily
// and ItemVersion identifiers. Never include answer content or a protected pool.
const VERIFIED=new WeakSet();
const ENTRY_KEYS=['domain_id','item_version_id','lifecycle','objective_id','question_family_id','visibility'].sort();
const CATALOG_KEYS=['catalog_id','content_release_id','items','question_payload_sha256','schema_version','source','track_id'].sort();
const ID='sdaia-ai-engineer';
const RELEASE='sdaia-ai-engineer.bootstrap.v1';
const DIGEST='5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9';
const validObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const exactly=(value,keys)=>validObject(value)&&
  Object.keys(value).sort().length===keys.length &&
  Object.keys(value).sort().every((name,index)=>name===keys[index]);
const cmp=(a,b)=>a<b?-1:a>b?1:0;

export function validatePublicCatalog({catalog,trackManifest,evidenceContext,publicQuestions,objectives}={}) {
  if(!exactly(catalog,CATALOG_KEYS) || catalog.schema_version!==1 ||
     catalog.catalog_id!==ID+'.public.bootstrap.v1' || catalog.track_id!==ID ||
     catalog.content_release_id!==RELEASE || catalog.question_payload_sha256!==DIGEST ||
     catalog.source!=='MIGRATED_GRANDFATHERED_PUBLIC' || !Array.isArray(catalog.items))
    throw new TypeError('K4 public catalog identity or fields are invalid');
  if(trackManifest?.id!==ID || trackManifest.status!=='active' ||
     evidenceContext?.content_release_id!==RELEASE ||
     evidenceContext?.question_payload_sha256!==DIGEST)
    throw new TypeError('K4 active track/release/digest provenance mismatch');
  if(!Array.isArray(publicQuestions) || !Array.isArray(objectives?.objectives) ||
     objectives.track_id!==ID || catalog.items.length!==publicQuestions.length)
    throw new TypeError('K4 public question and objective inventory is incomplete');
  const byItem=new Map();
  for(const q of publicQuestions){
    if(typeof q?.id!=='string' || byItem.has(q.id))
      throw new TypeError('K4 duplicate or malformed public question');
    byItem.set(q.id,q);
  }
  const objById=new Map(objectives.objectives.map(o=>[o.objective_id,o]));
  const families=new Set(),versions=new Set();
  for(const item of catalog.items){
    if(!exactly(item,ENTRY_KEYS) || item.visibility!=='PUBLIC' || item.lifecycle!=='ACTIVE' ||
       typeof item.item_version_id!=='string' || item.item_version_id!==item.question_family_id+'.v1' ||
       !item.question_family_id.startsWith(ID+'.') || versions.has(item.item_version_id) ||
       families.has(item.question_family_id))
      throw new TypeError('K4 protected, duplicate, noncurrent or malformed catalog item');
    const q=byItem.get(item.item_version_id),objective=objById.get(item.objective_id);
    if(!q || q.family_id!==item.question_family_id || q.domain_id!==item.domain_id ||
       !objective || objective.track_id!==ID || objective.domain_id!==item.domain_id ||
       !Array.isArray(objective.concept_ids) ||
       !objective.concept_ids.some(c=>item.question_family_id.startsWith(ID+'.'+c+'.')))
      throw new TypeError('K4 public family/version/objective is not verified');
    versions.add(item.item_version_id);families.add(item.question_family_id);
  }
  if(versions.size!==byItem.size)throw new TypeError('K4 public catalog cannot omit a shipped question');
  const safe=structuredClone(catalog);
  safe.items.sort((a,b)=>cmp(a.item_version_id,b.item_version_id));
  for(const item of safe.items)Object.freeze(item);
  Object.freeze(safe.items);Object.freeze(safe);
  VERIFIED.add(safe);
  return safe;
}

export function eligiblePublicItems({catalog,releaseId,availableIds}={}) {
  if(!catalog || !VERIFIED.has(catalog) || releaseId!==catalog.content_release_id)
    throw new TypeError('K4 candidate selection requires verified matching public release');
  if(!Array.isArray(availableIds) || availableIds.some(id=>typeof id!=='string'))
    throw new TypeError('K4 available item IDs are invalid');
  const available=new Set(availableIds);
  return catalog.items.filter(i=>i.visibility==='PUBLIC' && i.lifecycle==='ACTIVE' &&
    available.has(i.item_version_id)).map(i=>Object.freeze({
      question_family_id:i.question_family_id,item_version_id:i.item_version_id,
      objective_id:i.objective_id,domain_id:i.domain_id
    }));
}
