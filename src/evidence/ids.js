export function newUuid() {
  if (!globalThis.crypto?.randomUUID) throw new Error('Secure crypto.randomUUID is required');
  return globalThis.crypto.randomUUID();
}
