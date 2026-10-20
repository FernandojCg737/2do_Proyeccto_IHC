from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session as DBSession
from app.database import get_db
from app.models import Session, User
from app.history import get_user_history, current_session_status
from app.schemas import HistoryEventResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/history", tags=["Historial"])


@router.get("/me", response_model=List[HistoryEventResponse])
def get_my_history(
    tipo: str = Query("todos", description="Filtro: 'todos', 'unido' (me uní) o 'creada' (sesiones que organicé)"),
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Historial de participación del usuario autenticado (Issue #14).
    El usuario se obtiene del token: no es posible consultar el historial de otra persona.
    Responde qué ocurrió, cuándo, con qué sesión y cuál es su estado actual.
    """
    try:
        events = get_user_history(db, current_user.id, tipo)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    session_ids = {e.session_id for e in events if e.session_id is not None}
    sessions_by_id = {
        s.id: s for s in db.query(Session).filter(Session.id.in_(session_ids)).all()
    } if session_ids else {}

    response = []
    for event in events:
        session = sessions_by_id.get(event.session_id)
        response.append(HistoryEventResponse(
            id=event.id,
            event_type=event.event_type,
            created_at=event.created_at,
            session_id=event.session_id,
            session_name=event.session_name,
            session_subject=event.session_subject,
            session_date=event.session_date,
            session_modality=event.session_modality,
            session_creator_name=event.session_creator_name,
            current_status=current_session_status(session),
            participants_count=session.participants_count if session else None,
            spots=session.spots if session else None,
        ))
    return response
