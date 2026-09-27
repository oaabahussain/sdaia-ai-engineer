export const TRACK_SELECTION_KEY='learning-platform.track-id.v1';
const fallback=new Map();
const defaultStorage=()=>{try{return globalThis.localStorage}catch{return null}};
export function readSavedTrackId(storage=defaultStorage()){try{const value=storage?storage.getItem(TRACK_SELECTION_KEY):fallback.get(TRACK_SELECTION_KEY);return typeof value==='string'&&value?value:null}catch{return null}}
export function saveTrackId(trackId,storage=defaultStorage()){if(typeof trackId!=='string'||!trackId)return;try{if(storage)storage.setItem(TRACK_SELECTION_KEY,trackId);else fallback.set(TRACK_SELECTION_KEY,trackId)}catch{}}
