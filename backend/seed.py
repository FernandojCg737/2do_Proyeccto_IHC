"""Script CLI para poblar o actualizar las 53 materias de la carrera en PostgreSQL."""
import os
import sys

# Agregar ruta actual al sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app import models
from app.routers.subjects import seed_subjects_in_db

def main():
    print("Creando tablas si no existen...")
    models.Base.metadata.create_all(bind=engine)
    print("Poblando 53 materias del plan de estudios en PostgreSQL...")
    with SessionLocal() as db:
        res = seed_subjects_in_db(db)
        print(f"Completado exitosamente!")
        print(f"- Nuevas materias creadas: {res['created']}")
        print(f"- Materias actualizadas: {res['updated']}")
        print(f"- Total materias en catálogo: {res['total']}")

if __name__ == "__main__":
    main()
