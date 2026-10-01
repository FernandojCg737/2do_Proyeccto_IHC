from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth

# Crear tablas automáticamente al iniciar
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyMatch API",
    description="API para la plataforma StudyMatch - Compañeros y sesiones de estudio",
    version="1.0.0"
)

# CORS para que React pueda conectarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "StudyMatch API funcionando", "version": "1.0.0"}
