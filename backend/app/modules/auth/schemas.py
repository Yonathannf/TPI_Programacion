from sqlmodel import SQLModel


class LoginResponse(SQLModel):
    message: str


class MessageResponse(SQLModel):
    message: str
