import re
from dataclasses import dataclass
from typing import Protocol, runtime_checkable


def _assert_pseudonymous_principal(value: str):
    if not isinstance(value, str) or not value or "@" in value or re.fullmatch(r"\+?\d[\d\s().-]{6,}", value):
        raise ValueError("learner_id must be a non-empty pseudonymous principal and must not contain direct PII")


@dataclass(frozen=True)
class AuthorizedLearner:
    learner_id: str
    producer_grants: frozenset[tuple[str, str]] = frozenset()

    def __post_init__(self):
        _assert_pseudonymous_principal(self.learner_id)
        grants = frozenset(self.producer_grants)
        if any(not isinstance(pair, tuple) or len(pair) != 2 or any(not isinstance(x, str) or not x or x == '*' for x in pair) for pair in grants):
            raise ValueError('Producer grants must bind exact definition and authority references')
        object.__setattr__(self, 'producer_grants', grants)


class LearnerAuthorizationDenied(PermissionError):
    pass


@runtime_checkable
class LearnerAuthorizationPort(Protocol):
    def resolve(self, request) -> AuthorizedLearner:
        ...


class DenyLearnerAuthorization:
    def resolve(self, request) -> AuthorizedLearner:
        raise LearnerAuthorizationDenied("Learner evidence server synchronization is not authorized")


class StaticLearnerAuthorization:
    """Deterministic test resolver. Never derives authority from request claims."""

    def __init__(self, learner_id: str, *, producer_grants=frozenset()):
        self._authorized = AuthorizedLearner(learner_id, producer_grants=frozenset(producer_grants))

    def resolve(self, request) -> AuthorizedLearner:
        return self._authorized
