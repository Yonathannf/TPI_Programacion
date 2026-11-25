from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def list_activas(self) -> list[Categoria]:
        stmt = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return list(self.session.exec(stmt).all())

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca por nombre incluyendo las dadas de baja (el nombre no se libera)."""
        return self.session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()
