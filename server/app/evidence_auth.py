from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass(frozen=True)
class AuthorizedLearner:
    learner_id: str

    def __post_init__(self):
        if not isinstance(self.learner_id, str) or not self.learner_id:
            raise ValueError("learner_id must be a non-empty pseudonymous principal")


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
