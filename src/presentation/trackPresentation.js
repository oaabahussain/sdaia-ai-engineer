export async function loadTrackPresentation(fetchJson, manifest) {
  return fetchJson(`./tracks/${manifest.id}/presentation.json`);
}
