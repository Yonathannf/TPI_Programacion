from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def import_models() -> None:
    """Importa todos los modelos para registrarlos en el metadata y resolver relaciones."""
    from app.modules.categorias import models as _c  # noqa: F401
    from app.modules.pedidos import models as _p  # noqa: F401
    from app.modules.productos import models as _pr  # noqa: F401
    from app.modules.usuarios import models as _u  # noqa: F401


def create_all_tables() -> None:
    import_models()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
