import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createJsonlEvidenceStore } from '../../scripts/platform-kernel/adapters/jsonlEvidenceStore.js';
export const uid = n => `20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export const event = (n = 1, extra = {}) => ({schema_version:2,event_id:uid(n),definition_id:'learner.activity.started@1',learner_id:'learner:a',origin_id:uid(100),origin_seq:n,activity_id:uid(101),track_id:'sdaia-ai-engineer',content_release_id:'release:test',mode:'practice',locale:'en',occurred_at:'2026-10-03T17:00:00Z',payload:{},...extra});
export async function fileStore(t) {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'k3-repair-'));
  t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const eventFile=path.join(dir,'events.jsonl'), indexFile=path.join(dir,'index.json');
  return {dir,eventFile,indexFile,store:createJsonlEvidenceStore(eventFile,indexFile,{storeId:'repair:jsonl'})};
}
