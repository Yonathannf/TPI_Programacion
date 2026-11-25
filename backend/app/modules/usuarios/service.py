from fastapi import HTTPException, status

from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(
                    status.HTTP_409_CONFLICT, detail="El username ya está en uso"
                )
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(
                    status.HTTP_409_CONFLICT, detail="El email ya está registrado"
                )
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all(skip=0, limit=1000)
            return [UserPublic.model_validate(u) for u in usuarios]

    def _cambiar_estado(self, usuario_id: int, disabled: bool) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
                )
            usuario.disabled = disabled
            uow.session.add(usuario)
            uow.session.flush()
            return UserPublic.model_validate(usuario)

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, False)

    def desactivar(self, usuario_id: int, actual_id: int) -> UserPublic:
        if usuario_id == actual_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail="Un administrador no puede desactivarse a sí mismo",
            )
        return self._cambiar_estado(usuario_id, True)
