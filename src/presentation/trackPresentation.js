import { CORE_LOCALES, CORE_DEFAULT_LOCALE } from './coreI18n.js';

export async function loadTrackPresentation(fetchJson, manifest) {
  const presentation = await fetchJson(`./tracks/${manifest.id}/presentation.json`);
  if (presentation.track_id !== manifest.id) throw new Error('presentation track mismatch');
  if (presentation.track_version !== manifest.version) throw new Error('presentation version mismatch');
  return presentation;
}

export function resolvePresentationLocale(preferredLocale, manifest, presentation) {
  const common = CORE_LOCALES.filter(locale =>
    manifest.locales?.includes(locale) && Boolean(presentation.locales?.[locale])
  );
  if (!common.length) throw new Error('no common locale for track presentation');
  if (common.includes(preferredLocale)) return preferredLocale;
  if (common.includes(presentation.default_locale)) return presentation.default_locale;
  if (common.includes(CORE_DEFAULT_LOCALE)) return CORE_DEFAULT_LOCALE;
  return common[0];
}
