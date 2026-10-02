import canonicalize from '../vendor/rfc8785.js';

export function canonicalizeJson(value) {
  const result = canonicalize(value);
  if (typeof result !== 'string') {
    throw new Error('RFC 8785 canonicalization requires a JSON-serializable value');
  }
  return result;
}

export async function fingerprintEvent(event) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto subtle.digest is required');
  const bytes = new TextEncoder().encode(canonicalizeJson(event));
  const digest = await subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
