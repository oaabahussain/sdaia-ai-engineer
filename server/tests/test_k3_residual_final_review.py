import pytest
from app.main import init_db
from app.evidence_store import accept_evidence

def test_extreme_numeric_response_is_rejected_without_numeric_conversion_overflow(tmp_path):
    url=f'sqlite:///{tmp_path}/number.db';init_db(url)
    e=dict(schema_version=2,event_id='20000000-0000-4000-8000-000000000001',definition_id='learner.response.recorded@1',learner_id='learner:a',origin_id='20000000-0000-4000-8000-000000000002',origin_seq=1,activity_id='20000000-0000-4000-8000-000000000003',track_id='sdaia-ai-engineer',content_release_id='release:test',mode='practice',locale='en',occurred_at='2026-10-03T18:00:00Z',item_interaction_id='20000000-0000-4000-8000-000000000004',item_version_id='item:test',payload={'response_version':1,'response_kind':'NUMBER','response':{'value':10**400}})
    with pytest.raises(ValueError,match='[Nn]umeric|[Ii]nvalid'):
        accept_evidence(url,e)
