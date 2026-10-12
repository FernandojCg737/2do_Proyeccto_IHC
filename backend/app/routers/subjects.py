import unicodedata
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Subject
from app.schemas import SubjectCreate, SubjectResponse
from app.seed_data import SUBJECTS_DATA

router = APIRouter(prefix="/subjects", tags=["Materias"])


@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_custom_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    """
    Registra una nueva materia en la base de datos (por ejemplo, desde la opción 'Otros' al crear una sesión).
    Si ya existe una materia con el mismo nombre, devuelve la existente.
    """
    name_clean = data.name.strip()
    if not name_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de la materia no puede estar vacío."
        )

    # Verificar si ya existe por nombre
    existing = db.query(Subject).filter(Subject.name.ilike(name_clean)).first()
    if existing:
        return existing

    # Generar código único si no fue proporcionado
    code = data.code
    if not code:
        normalized = unicodedata.normalize('NFKD', name_clean).encode('ascii', 'ignore').decode('utf-8')
        base_prefix = re.sub(r'[^A-Z0-9]', '', normalized.upper())[:4] or "OTR"
        counter = 1
        code_candidate = f"{base_prefix}{counter:02d}"
        while db.query(Subject).filter(Subject.code == code_candidate).first():
            counter += 1
            code_candidate = f"{base_prefix}{counter:02d}"
        code = code_candidate

    new_subject = Subject(
        code=code,
        name=name_clean,
        area=data.area or "General",
        emoji=data.emoji or "📚",
        students_count=0,
        sessions_count=0,
    )
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject


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
