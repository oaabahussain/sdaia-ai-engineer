import re
from dataclasses import dataclass
from typing import Protocol, runtime_checkable


def _assert_pseudonymous_principal(value: str):
    if not isinstance(value, str) or not value or "@" in value or re.fullmatch(r"\+?\d[\d\s().-]{6,}", value):
        raise ValueError("learner_id must be a non-empty pseudonymous principal and must not contain direct PII")


@dataclass(frozen=True)
class AuthorizedLearner:
    learner_id: str

    def __post_init__(self):
        _assert_pseudonymous_principal(self.learner_id)


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

    def __init__(self, learner_id: str):
        self._authorized = AuthorizedLearner(learner_id)

    def resolve(self, request) -> AuthorizedLearner:
        return self._authorized
