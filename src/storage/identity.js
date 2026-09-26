export const ANON_KEY='learning-platform.anon-id.v1';
export const LEGACY_ANON_KEY='sdaia.anon_id.v1';
let memoryAnonId;
function defaultStorage(){try{return globalThis.localStorage}catch{return null}}
export function getOrCreateAnonId(storage=defaultStorage()){
 try{const existing=storage?.getItem?.(ANON_KEY)||storage?.getItem?.(LEGACY_ANON_KEY);if(existing){storage?.setItem?.(ANON_KEY,existing);return existing}}catch{}
 if(memoryAnonId)return memoryAnonId;const created=globalThis.crypto?.randomUUID?.();if(!created)throw new Error('crypto.randomUUID is required to create an anonymous identifier');memoryAnonId=created;try{storage?.setItem?.(ANON_KEY,created)}catch{}return created;
}
