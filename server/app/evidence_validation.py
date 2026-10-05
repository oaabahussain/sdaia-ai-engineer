"""Shared pre-persistence validation for HTTP and direct K3 store calls."""
from app.response_privacy import validate_response_privacy
import json
import re
from pathlib import Path
from jsonschema import Draft7Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
_SCHEMA = json.loads((ROOT / 'data/schema/learner-evidence-event-v2.schema.json').read_text())
_ENVELOPE = Draft7Validator(_SCHEMA, format_checker=FormatChecker())
_DEFINITIONS = {f"{d['event_name']}@{d['event_version']}": d for d in json.loads(
    (ROOT / 'data/evidence/event-definitions-v1.json').read_text())}
_PAYLOADS = {key: Draft7Validator(json.loads((ROOT / value['payload_schema_ref']).read_text()),
                                format_checker=FormatChecker()) for key, value in _DEFINITIONS.items()}
_PII = [re.compile(r'@'), re.compile(r'^\+?\d[\d\s().-]{6,}$'), re.compile(r'^(?:\d{1,3}\.){3}\d{1,3}$')]


def validate_evidence_structure(event):
    """Validate versioned evidence structure without applying current admission policy."""
    errors = list(_ENVELOPE.iter_errors(event))
    if errors:
        return '; '.join(error.message for error in errors)
    if isinstance(event['origin_seq'], bool) or event['origin_seq'] > 9007199254740991:
        return 'Invalid evidence origin sequence'
    definition = _DEFINITIONS.get(event['definition_id'])
    if definition is None:
        return 'Unknown learner evidence definition'
    for key in definition.get('required_context_fields', []):
        if event.get(key) in (None, ''):
            return f'Missing required context field {key}'
    errors = list(_PAYLOADS[event['definition_id']].iter_errors(event['payload']))
    return '; '.join(error.message for error in errors) if errors else None


def validate_evidence(event):
    structural = validate_evidence_structure(event)
    if structural:
        return structural
    if any(pattern.search(event['learner_id']) for pattern in _PII):
        return 'Evidence learner must be pseudonymous, not direct PII'
    return validate_response_privacy(event)
