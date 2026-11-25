# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN)

**Alumno:** Jonathan Nahuel Franco (trabajo individual)

- 🔗 **Repositorio:** `https://github.com/Yonathannf/TPI_Programacion`
- 🎥 **Video de demostración:** `https://youtu.be/-HrvtnJ_eko`

Aplicación web completa para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

| Parte | Tecnologías |
|---|---|
| Backend (`backend/`) | Python, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly, arquitectura en capas con Unit of Work |
| Frontend (`frontend/`) | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, Zustand, Axios, React Router |

## Requisitos

- **Python** 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14)
- **Node.js** 20.19 o superior y **pnpm** 9 o superior (`npm install -g pnpm`)
- **PostgreSQL** 15 o superior (se puede levantar con Docker, ver abajo). Para desarrollo rápido también se acepta SQLite cambiando `DATABASE_URL`.

## Backend

```bash
cd backend

# 1) Entorno virtual e instalación de dependencias
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2) Base de datos (opción A: PostgreSQL con Docker, desde la raíz del proyecto)
#    docker compose up -d
#    (opción B: SQLite → en .env usar DATABASE_URL=sqlite:///./foodstore.db)

# 3) Variables de entorno
cp .env.example .env              # Windows: copy .env.example .env

# 4) Cargar datos iniciales (idempotente: se puede ejecutar varias veces)
python -m app.db.seed

# 5) Ejecutar
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación: <http://localhost:8000/docs> y <http://localhost:8000/redoc>
- Las tablas se crean automáticamente al ejecutar el seed o al iniciar la aplicación.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

### Usuario del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

El seed también carga 4 categorías y 8 productos con stock. Los clientes (rol `user`) se crean desde la pantalla de registro.

## Frontend

```bash
cd frontend
cp .env.example .env              # Windows: copy .env.example .env
pnpm install
pnpm build                        # verifica los tipos (TypeScript strict) y compila
pnpm dev
```

- Aplicación: <http://localhost:5173>

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Arquitectura

### Backend (`backend/app/`)

```
core/        config, database, security, deps, unit_of_work, base_repository
modules/
  auth/        router, service, schemas            (usa el modelo Usuario)
  usuarios/    models, schemas, repository, unit_of_work, service, router
  categorias/  models, schemas, repository, unit_of_work, service, router
  productos/   models, schemas, repository, unit_of_work, service, router
  pedidos/     models, schemas, repository, unit_of_work, service, router
db/seed.py   seed idempotente
main.py      FastAPI + CORS con credenciales + prefijo /api/v1
```

Cadena de capas: **Router → Service → Unit of Work → Repository → Model**. El `commit` ocurre únicamente en el `__exit__` del Unit of Work: ningún Service ni Router llama a `session.commit()`.

### Reglas de negocio de pedidos

- **RN-01** Crear pedido: al menos un ítem, sin productos repetidos; cada producto debe existir, estar activo, disponible y con stock suficiente. El stock se descuenta y la línea copia `nombre_producto` y `precio_unitario` en una única transacción (si algo falla, no se persiste nada).
- **RN-02** Máquina de estados: `PENDIENTE → EN_PREPARACION | CANCELADO`, `EN_PREPARACION → ENTREGADO | CANCELADO`; `ENTREGADO` y `CANCELADO` son terminales (transición inválida → 400).
- **RN-03** Cancelar restituye el stock en la misma transacción.
- **RN-04** El cliente solo ve y cancela sus pedidos y solo desde `PENDIENTE`; el admin ve todos y avanza o cancela desde cualquier estado no terminal.
- **RN-05** Líneas y total inmutables; no hay endpoints de edición ni borrado.
- **RN-06** `forma_pago` (`EFECTIVO` / `TRANSFERENCIA`) y `direccion_entrega` (5 a 200 caracteres) se validan en el schema.

### Frontend (`frontend/src/`)

```
shared/    api (axiosInstance, handleApiError, queryClient), ui, components, layout, hooks, utils
features/  auth · categorias · productos · usuarios · pedidos   (pages, components, hooks, api, types)
store/     authStore (sesión, persist con partialize) · cartStore (carrito, persist)
routes/    AppRouter · ProtectedRoute (por sesión y rol)
```

- Estado del servidor: **TanStack Query** (`useQuery`, `useMutation` con `invalidateQueries`).
- Estado del cliente: **Zustand** (`authStore` guarda solo el usuario, nunca el token; `cartStore` persiste el carrito).
- La sesión viaja en la cookie `HttpOnly`; Axios usa `withCredentials: true` y un interceptor que limpia la sesión ante un 401 o una cuenta desactivada.

## Pantallas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Catálogo paginado en el servidor, búsqueda y filtro por categoría |
| `/login`, `/register` | Público | Formularios con TanStack Form |
| `/carrito` | Público | Carrito persistido |
| `/checkout` | Sesión | Dirección, forma de pago y notas |
| `/mis-pedidos` | Sesión | Pedidos propios, detalle y cancelación en `PENDIENTE` |
| `/admin/resumen` | Admin | Indicadores del negocio |
| `/admin/categorias`, `/admin/productos` | Admin | ABM con TanStack Table y Form, cambio de stock y disponibilidad |
| `/admin/pedidos` | Admin | Filtro por estado y cambio de estado |
| `/admin/usuarios` | Admin | Activar y desactivar usuarios |
