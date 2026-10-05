// This is a collection boundary, not a text-redaction or logging filter.
// Free text/structured item policies have not been activated for this track.
const RESPONSE = 'learner.response.recorded@1';
const safeIndex = value => Number.isSafeInteger(value) && value >= 0;
const stableId = value => typeof value === 'string' && value.trim().length > 0;
const unique = values => new Set(values).size === values.length;

export function assertResponsePrivacy(event) {
  if (event?.definition_id !== RESPONSE) return;
  const { response_kind: kind, response: value } = event.payload ?? {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Invalid response payload');
  const allowed = { OPTION:['option_index','option_id'], MULTI_OPTION:['option_indices','option_ids'], BOOLEAN:['value'], NUMBER:['value'] }[kind];
  if (!allowed) throw new TypeError('Response kind requires an approved item-specific collection/privacy policy');
  const keys = Object.keys(value);
  if (!keys.length || keys.some(key => !allowed.includes(key))) throw new TypeError('Invalid or undeclared response payload field');
  if (kind === 'OPTION' && ((value.option_index !== undefined && !safeIndex(value.option_index)) || (value.option_id !== undefined && !stableId(value.option_id)))) {
    throw new TypeError('Invalid stable option response');
  }
  if (kind === 'MULTI_OPTION') {
    for (const key of keys) {
      const values = value[key], validate = key === 'option_indices' ? safeIndex : stableId;
      if (!Array.isArray(values) || !unique(values) || !values.every(validate)) throw new TypeError('Invalid multiple option response');
    }
  }
  if (kind === 'BOOLEAN' && typeof value.value !== 'boolean') throw new TypeError('Invalid boolean response');
  if (kind === 'NUMBER' && (typeof value.value !== 'number' || !Number.isFinite(value.value) || (Number.isInteger(value.value) && !Number.isSafeInteger(value.value)))) {
    throw new TypeError('Invalid numeric response');
  }
}
