from datetime import datetime

from app.core.utils import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


# ── Excepciones de dominio ────────────────────────────────────────────────
class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


# ── Máquina de estados (RN-02) ────────────────────────────────────────────
TRANSICIONES: dict[str, list[str]] = {
    EstadoPedido.PENDIENTE.value: [
        EstadoPedido.EN_PREPARACION.value,
        EstadoPedido.CANCELADO.value,
    ],
    EstadoPedido.EN_PREPARACION.value: [
        EstadoPedido.ENTREGADO.value,
        EstadoPedido.CANCELADO.value,
    ],
    EstadoPedido.ENTREGADO.value: [],
    EstadoPedido.CANCELADO.value: [],
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # RN-01 ───────────────────────────────────────────────────────────────
    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido()

        with self.uow as uow:
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=EstadoPedido.PENDIENTE.value,
                    forma_pago=data.forma_pago.value,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado()
                if not producto.disponible:
                    raise ProductoNoDisponible()
                if producto.stock < item.cantidad:
                    raise StockInsuficiente()
                producto.stock -= item.cantidad
                uow.session.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.session.add(
                    DetallePedido(
                        pedido_id=pedido.id,  # type: ignore[arg-type]
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # Consultas ───────────────────────────────────────────────────────────
    def listar(
        self, usuario: Usuario, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                items, total = uow.pedidos.list_all(estado, skip, limit)
            else:
                items, total = uow.pedidos.list_by_usuario(
                    usuario.id, estado, skip, limit  # type: ignore[arg-type]
                )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # RN-02 / RN-03 ───────────────────────────────────────────────────────
    def _aplicar_transicion(
        self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str
    ) -> PedidoRead:
        if nuevo not in TRANSICIONES.get(pedido.estado, []):
            raise TransicionInvalida()
        if nuevo == EstadoPedido.CANCELADO.value:
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.session.add(producto)
        pedido.estado = nuevo
        pedido.updated_at = utcnow()
        uow.session.add(pedido)
        uow.session.flush()
        uow.session.refresh(pedido)
        return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            return self._aplicar_transicion(uow, pedido, nuevo.value)

    # RN-04 ───────────────────────────────────────────────────────────────
    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida()
            return self._aplicar_transicion(
                uow, pedido, EstadoPedido.CANCELADO.value
            )

    # Resumen ─────────────────────────────────────────────────────────────
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteo = uow.pedidos.count_by_estado()
            hoy: datetime = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteo.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=conteo.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=conteo.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=conteo.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(
                    EstadoPedido.ENTREGADO.value
                ),
            )
