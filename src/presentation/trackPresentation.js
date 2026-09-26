export async function loadTrackPresentation(fetchJson, manifest) {
  const presentation = await fetchJson(`./tracks/${manifest.id}/presentation.json`);
  if (presentation.track_id !== manifest.id) throw new Error('presentation track mismatch');
  if (presentation.track_version !== manifest.version) throw new Error('presentation version mismatch');
  return presentation;
}
