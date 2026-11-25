"""Carga inicial idempotente: admin, categorías y productos.

Uso:  python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (nombre, descripcion, precio, stock, categoria, imagen)
PRODUCTOS = [
    ("Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 6500, 25, "Hamburguesas",
     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"),
    ("Hamburguesa Doble", "Doble carne, cheddar y panceta", 8500, 20, "Hamburguesas",
     "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600"),
    ("Pizza Muzzarella", "Salsa de tomate y muzzarella", 7200, 15, "Pizzas",
     "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"),
    ("Pizza Napolitana", "Muzzarella, tomate fresco y ajo", 8200, 12, "Pizzas",
     "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600"),
    ("Gaseosa 500 ml", "Línea cola, botella individual", 1800, 60, "Bebidas",
     "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600"),
    ("Agua mineral 500 ml", "Sin gas", 1200, 80, "Bebidas",
     "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600"),
    ("Flan con dulce de leche", "Flan casero con crema", 3200, 18, "Postres",
     "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600"),
    ("Brownie con helado", "Brownie tibio y bocha de vainilla", 4200, 14, "Postres",
     "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600"),
]


def run() -> None:
    create_all_tables()
    with Session(engine) as session:
        if not session.exec(
            select(Usuario).where(Usuario.username == ADMIN["username"])
        ).first():
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
            categorias[nombre] = cat
        session.flush()

        for nombre, descripcion, precio, stock, cat_nombre, imagen in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=imagen,
                        categoria_id=categorias[cat_nombre].id,  # type: ignore[arg-type]
                    )
                )
        session.commit()
    print("Seed completado: usuario admin, categorías y productos.")


if __name__ == "__main__":
    run()
