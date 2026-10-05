"""Closed response collection shapes; no arbitrary text/structured policy by default."""
import math


def validate_response_privacy(event):
    if event.get('definition_id') != 'learner.response.recorded@1':
        return None
    payload = event.get('payload', {})
    kind, value = payload.get('response_kind'), payload.get('response')
    allowed = {'OPTION': {'option_index', 'option_id'}, 'MULTI_OPTION': {'option_indices', 'option_ids'}, 'BOOLEAN': {'value'}, 'NUMBER': {'value'}}.get(kind)
    if allowed is None:
        return 'Response kind requires an approved item-specific collection/privacy policy'
    if not isinstance(value, dict) or not value or set(value) - allowed:
        return 'Invalid or undeclared response payload field'
    def index(x):
        return type(x) is int and 0 <= x <= 9007199254740991
    def identity(x):
        return isinstance(x, str) and bool(x.strip())
    if kind == 'OPTION':
        if ('option_index' in value and not index(value['option_index'])) or ('option_id' in value and not identity(value['option_id'])):
            return 'Invalid stable option response'
    elif kind == 'MULTI_OPTION':
        for key, values in value.items():
            check = index if key == 'option_indices' else identity
            if not isinstance(values, list) or not all(check(x) for x in values) or len(set(values)) != len(values):
                return 'Invalid multiple option response'
    elif kind == 'BOOLEAN':
        if type(value.get('value')) is not bool:
            return 'Invalid boolean response'
    elif kind == 'NUMBER':
        x = value.get('value')
        if (type(x) not in (int, float)
                or (type(x) is int and abs(x) > 9007199254740991)
                or not math.isfinite(x)
                or (x % 1 == 0 and abs(x) > 9007199254740991)):
            return 'Invalid numeric response'
    return None
