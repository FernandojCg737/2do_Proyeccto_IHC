from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Subject
from app.schemas import SubjectResponse
from app.seed_data import SUBJECTS_DATA

router = APIRouter(prefix="/subjects", tags=["Materias"])


def seed_subjects_in_db(db: Session) -> dict:
    created_count = 0
    updated_count = 0
    for item in SUBJECTS_DATA:
        existing = db.query(Subject).filter(Subject.code == item["code"]).first()
        if not existing:
            new_subject = Subject(
                code=item["code"],
                name=item["name"],
                area=item["area"],
                emoji=item["emoji"],
                students_count=item["students_count"],
                sessions_count=item["sessions_count"],
            )
            db.add(new_subject)
            created_count += 1
        else:
            # Update fields if needed
            existing.name = item["name"]
            existing.area = item["area"]
            existing.emoji = item["emoji"]
            updated_count += 1
    db.commit()
    return {"created": created_count, "updated": updated_count, "total": len(SUBJECTS_DATA)}


@router.get("/", response_model=List[SubjectResponse])
def get_subjects(
    search: Optional[str] = Query(None, description="Buscar por código o nombre"),
    area: Optional[str] = Query(None, description="Filtrar por área"),
    db: Session = Depends(get_db),
):
    query = db.query(Subject)
    if search:
        search_filter = f"%{search.strip().lower()}%"
        query = query.filter(
            (Subject.name.ilike(search_filter)) | (Subject.code.ilike(search_filter))
        )
    if area and area.lower() != "todas":
        query = query.filter(Subject.area.ilike(area.strip()))
    
    # Ordenar por id (orden curricular original)
    return query.order_by(Subject.id.asc()).all()


@router.get("/{code}", response_model=SubjectResponse)
def get_subject_by_code(code: str, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.code.ilike(code.strip())).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Materia con código '{code}' no encontrada",
        )
    return subject


@router.post("/seed", status_code=status.HTTP_200_OK)
def trigger_seed(db: Session = Depends(get_db)):
    """Poblar o sincronizar las 53 materias oficiales en la base de datos."""
    result = seed_subjects_in_db(db)
    return {
        "message": f"Se sincronizaron {result['total']} materias en la base de datos",
        "detail": result,
    }
