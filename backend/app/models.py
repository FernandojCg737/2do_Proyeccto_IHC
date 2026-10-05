from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, ForeignKey
from sqlalchemy.sql import func
from app.database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())




class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    area = Column(String(100), nullable=False)
    emoji = Column(String(10), nullable=True)
    students_count = Column(Integer, default=0)
    sessions_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PasswordResetCode(Base):
    __tablename__ = "password_reset_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), nullable=False, index=True)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    date = Column(Date, nullable=False)
    modality = Column(String(50), nullable=False)
    spots = Column(Integer, nullable=False)
    status = Column(String(30), default="abierta", nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    creator_name = Column(String(150), nullable=True)
    creator_email = Column(String(150), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def close_registration(self, user_email: str | None = None, user_id: int | None = None):
        """
        Regla de negocio: Transición de estado para cerrar inscripciones.
        Flujo permitido: 'abierta' -> 'cerrada'.
        Validación de seguridad por correo electrónico del creador.
        Si la sesión ya está cerrada o en otro estado, la transición se rechaza.
        """
        if user_email and self.creator_email and user_email.strip().lower() != self.creator_email.strip().lower():
            raise PermissionError("No autorizado: Solo la persona que creó la sesión con su correo electrónico puede cerrarla.")

        if user_id is not None and self.creator_id is not None and self.creator_id != user_id:
            raise PermissionError("No autorizado: Solo el creador de la sesión puede cerrar las inscripciones.")

        if self.status != "abierta":
            raise ValueError(
                f"Transición inválida: No se pueden cerrar inscripciones de una sesión con estado '{self.status}'. Solo se permite desde 'abierta'."
            )
        self.status = "cerrada"
        return self

    @property
    def is_open(self) -> bool:
        return self.status == "abierta"


