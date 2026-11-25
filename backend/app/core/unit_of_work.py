from collections.abc import Callable
from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Unit of Work base.

    Abre la sesión en __enter__ y hace commit (o rollback) y close en __exit__.
    Las subclases exponen los repositorios sobre la misma sesión en
    _init_repositories.
    """

    session: Session

    def __init__(
        self, session_factory: Callable[[], Session] = default_session_factory
    ) -> None:
        self._session_factory = session_factory

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aquí sus repositorios."""

    def __enter__(self) -> "UnitOfWork":
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> bool:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False
