import fs from 'node:fs/promises';
import path from 'node:path';
import { canonicalizeJson } from '../../../src/evidence/jcs.js';
import { assertIdentityLinkRecord } from '../../../src/platform-kernel/evidence/identityLinks.js';

async function readRecords(file) {
  let text;
  try { text = await fs.readFile(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const records = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line) continue;
    try { records.push(JSON.parse(line)); }
    catch { throw new Error(`Malformed K3 identity-link record at line ${index + 1}`); }
  }
  return records;
}

export function createJsonlIdentityLinkStore(file) {
  return {
    async append(record) {
      assertIdentityLinkRecord(record);
      const records = await readRecords(file);
      const previous = records.find((item) => item.identity_link_record_id === record.identity_link_record_id);
      if (previous) {
        if (canonicalizeJson(previous) === canonicalizeJson(record)) {
          return { disposition: 'DUPLICATE', identity_link_record_id: record.identity_link_record_id };
        }
        throw new Error(`Identity-link record conflict: ${record.identity_link_record_id}`);
      }
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.appendFile(file, JSON.stringify(record) + '\n');
      return { disposition: 'ACCEPTED', identity_link_record_id: record.identity_link_record_id };
    },
    async readAll() {
      return readRecords(file);
    }
  };
}
