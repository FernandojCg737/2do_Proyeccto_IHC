from datetime import datetime
import re
from pydantic import BaseModel, EmailStr, field_validator


def validate_password_rules(v: str) -> str:
    if len(v) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula")
    if not re.search(r"[a-z]", v):
        raise ValueError("La contraseña debe contener al menos una letra minúscula")
    if not re.search(r"\d", v):
        raise ValueError("La contraseña debe contener al menos un número")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/~`]", v):
        raise ValueError("La contraseña debe contener al menos un carácter especial (!@#$%^&*...)")
    return v


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_rules(v)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    first_name: str | None = None
    last_name: str | None = None
    full_name: str
    email: str
    is_active: bool
    avatar_url: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True





class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordChange(BaseModel):
    email: EmailStr
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_rules(v)


class VerifyResetCode(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordWithCode(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_rules(v)



class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_rules(v)


class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_names(cls, v: str) -> str:
        v_stripped = v.strip()
        if len(v_stripped) < 2:
            raise ValueError("El campo debe tener al menos 2 caracteres")
        return v_stripped




class SubjectBase(BaseModel):
    code: str
    name: str
    area: str
    emoji: str | None = None
    students_count: int = 0
    sessions_count: int = 0


class SubjectCreate(SubjectBase):
    pass


class SubjectResponse(SubjectBase):
    id: int

    class Config:
        from_attributes = True


# ── SESIONES ──────────────────────────────────────────────
import datetime as dt

class SessionCreate(BaseModel):
    name: str
    date: dt.date
    modality: str
    spots: int
    status: str = "abierta"

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("El nombre debe tener al menos 3 caracteres")
        return v

    @field_validator("spots")
    @classmethod
    def validate_spots(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Los cupos deben ser al menos 1")
        return v


class SessionStatusUpdate(BaseModel):
    status: str


class SessionResponse(BaseModel):
    id: int
    name: str
    date: dt.date
    modality: str
    spots: int
    status: str = "abierta"
    creator_id: int | None = None
    creator_name: str | None = None
    creator_email: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True

