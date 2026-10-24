const plain = value => Object.getPrototypeOf(value)===Object.prototype;

// RFC 8785 ordering with strict JSON-only inputs: no ignored undefined,
// NaN, class instances or unstable JS object integer-key enumeration.
export function canonicalMappingJson(input) {
  const seen=new WeakSet();
  const walk=value=>{
    if(value===null||typeof value==='boolean')return JSON.stringify(value);
    if(typeof value==='string') {
      if(!value.isWellFormed())throw new Error('unsupported lone surrogate in mapping');
      return JSON.stringify(value);
    }
    if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
    if(!value||typeof value!=='object'||(!Array.isArray(value)&&!plain(value)))
      throw new Error('unsupported mapping value');
    if(seen.has(value))throw new Error('unsupported circular mapping');
    seen.add(value);
    let result;
    if(Array.isArray(value))result='['+value.map(walk).join(',')+']';
    else result='{'+Object.keys(value).sort().map(key=>{
      if(!key.isWellFormed())throw new Error('unsupported mapping key');
      return JSON.stringify(key)+':'+walk(value[key]);
    }).join(',')+'}';
    seen.delete(value);
    return result;
  };
  return walk(input);
}

export async function canonicalMappingHash(input) {
  if(!globalThis.crypto?.subtle)throw new Error('Web Crypto SHA-256 unavailable');
  const digest=await globalThis.crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(canonicalMappingJson(input)));
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}
