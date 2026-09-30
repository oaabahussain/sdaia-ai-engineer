import { createHash } from 'node:crypto';

function orderedKeys(value, path, propertyOrderByPath) {
  const preferred = Array.isArray(propertyOrderByPath[path]) ? propertyOrderByPath[path] : [];
  const keys = Object.keys(value);
  const presentPreferred = preferred.filter((key) => keys.includes(key));
  const preferredSet = new Set(presentPreferred);
  const remaining = keys.filter((key) => !preferredSet.has(key)).sort();
  return [...presentPreferred, ...remaining];
}

function normalize(value, path, propertyOrderByPath) {
  if (Array.isArray(value)) {
    return value.map((item, index) => normalize(item, `${path}/${index}`, propertyOrderByPath));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of orderedKeys(value, path, propertyOrderByPath)) {
      const childPath = path === '/' ? `/${key}` : `${path}/${key}`;
      out[key] = normalize(value[key], childPath, propertyOrderByPath);
    }
    return out;
  }
  return value;
}

export function stableJson(value, propertyOrderByPath = {}) {
  return `${JSON.stringify(normalize(value, '/', propertyOrderByPath), null, 2)}\n`;
}

export function sha256Text(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
