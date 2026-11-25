from datetime import datetime

from sqlalchemy.orm import selectinload
from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def _paginar(
        self, stmt, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:  # type: ignore[no-untyped-def]
        total = self.session.exec(
            select(func.count()).select_from(stmt.subquery())
        ).one()
        items = self.session.exec(
            stmt.options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(Pedido.id.desc())  # type: ignore[union-attr]
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def list_by_usuario(
        self, usuario_id: int, estado: str | None, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        stmt = select(Pedido).where(Pedido.usuario_id == usuario_id)
        if estado:
            stmt = stmt.where(Pedido.estado == estado)
        return self._paginar(stmt, skip, limit)

    def list_all(
        self, estado: str | None, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        stmt = select(Pedido)
        if estado:
            stmt = stmt.where(Pedido.estado == estado)
        return self._paginar(stmt, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in rows}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(
                Pedido.estado == estado
            )
        ).one()
        return float(total)
