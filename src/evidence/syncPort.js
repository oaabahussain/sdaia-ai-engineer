export function assertEvidenceSyncPort(port) {
  if (!port || typeof port !== 'object') throw new TypeError('EvidenceSync port is required');
  if (typeof port.push !== 'function') throw new TypeError('EvidenceSync.push must be a function');
  if (typeof port.pull !== 'function') throw new TypeError('EvidenceSync.pull must be a function');
  return port;
}
