import {createHash} from 'node:crypto';
export function canonicalMappingJson(input){
 function normalize(v){
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(Array.isArray(v))return v.map(normalize);
  if(v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype){
   const out={};for(const k of Object.keys(v).sort())out[k]=normalize(v[k]);return out;
  }
  throw Error('unsupported mapping value');
 }
 return JSON.stringify(normalize(input));
}
export async function canonicalMappingHash(mapping){
 return createHash('sha256').update(canonicalMappingJson(mapping)).digest('hex');
}
