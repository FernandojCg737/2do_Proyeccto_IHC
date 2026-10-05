from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.models import Session, User
from app.schemas import SessionCreate, SessionResponse, SessionStatusUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/sessions", tags=["Sesiones"])


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea una nueva sesión de estudio vinculada al usuario autenticado (creador).
    Estado inicial por defecto: 'abierta'.
    """
    creator_display = (
        current_user.full_name
        or f"{current_user.first_name or ''} {current_user.last_name or ''}".strip()
        or current_user.email
    )
    new_session = Session(
        name=data.name,
        date=data.date,
        modality=data.modality,
        spots=data.spots,
        status="abierta",
        creator_id=current_user.id,
        creator_name=creator_display,
        creator_email=current_user.email.strip().lower()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.get("/", response_model=List[SessionResponse])
def get_sessions(db: DBSession = Depends(get_db)):
    """
    Devuelve todas las sesiones guardadas en la BD,
    ordenadas de la más reciente a la más antigua.
    """
    return db.query(Session).order_by(Session.created_at.desc()).all()


@router.patch("/{session_id}/close", response_model=SessionResponse)
def close_session_registration(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Acción: 'Cerrar inscripciones'.
    Regla de seguridad: Solo el usuario que creó la sesión (validado por correo) puede cerrarla.
    Aplica la regla de transición de estado: 'abierta' -> 'cerrada'.
    Rechaza transiciones inválidas con error HTTP 400 y accesos no autorizados con HTTP 403.
    """
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada"
        )

    # Validar que el usuario actual sea el creador por correo electrónico
    is_creator = False
    if session.creator_email and current_user.email:
        is_creator = session.creator_email.strip().lower() == current_user.email.strip().lower()
    elif session.creator_id and current_user.id:
        is_creator = int(session.creator_id) == int(current_user.id)

    if not is_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado: Solo la persona que creó la sesión puede cerrar sus inscripciones."
        )

    try:
        session.close_registration()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    db.commit()
    db.refresh(session)
    return session


@router.patch("/{session_id}/status", response_model=SessionResponse)
def update_session_status(
    session_id: int,
    body: SessionStatusUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza el estado de la sesión validando que el usuario sea el creador por correo.
    """
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada"
        )

    # Validar creador por correo electrónico
    is_creator = False
    if session.creator_email and current_user.email:
        is_creator = session.creator_email.strip().lower() == current_user.email.strip().lower()
    elif session.creator_id and current_user.id:
        is_creator = int(session.creator_id) == int(current_user.id)

    if not is_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado: Solo la persona que creó la sesión puede modificar su estado."
        )

    if body.status == "cerrada":
        try:
            session.close_registration()
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    elif body.status == "abierta":
        if session.status == "abierta":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transición inválida: La sesión ya se encuentra con inscripciones abiertas."
            )
        session.status = "abierta"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado '{body.status}' no válido. Estados permitidos: 'abierta', 'cerrada'."
        )

    db.commit()
    db.refresh(session)
    return session


