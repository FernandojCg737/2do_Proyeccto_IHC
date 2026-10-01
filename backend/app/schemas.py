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
    created_at: datetime | None = None

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


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_rules(v)



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

