# StudyMatch 📚🤝

**Compañeros | Sesiones de Estudio**

Plataforma para conectar estudiantes, organizar sesiones de estudio y encontrar compañeros por materia.

---

## 🐳 Iniciar con Docker (recomendado)

```bash
docker-compose up --build
```

Eso es todo. Docker levanta automáticamente:
- 🐘 PostgreSQL en puerto `5433`
- ⚡ FastAPI en http://localhost:8000
- ⚛️  React en http://localhost:5173

Para detener:
```bash
docker-compose down
```

Para detener y eliminar los datos de la base de datos:
```bash
docker-compose down -v
```

---

## 🚀 Cómo iniciar el proyecto (sin Docker)

### Pre-requisitos
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

---

### 1. Configurar la base de datos

Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE studymatch;
```

---

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copiar y editar el archivo de variables de entorno:
```bash
copy .env.example .env
```
Editar `.env` con tus credenciales de PostgreSQL.

Iniciar el servidor:
```bash
uvicorn app.main:app --reload
```
> API disponible en: http://localhost:8000
> Documentación: http://localhost:8000/docs

---

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
> App disponible en: http://localhost:5173

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | FastAPI (Python) |
| Base de datos | PostgreSQL |
| ORM | SQLAlchemy |
| Autenticación | JWT (python-jose) |
| Seguridad | bcrypt (passlib) |

---

## 📁 Estructura del proyecto

```
Segundo Proyecto/
├── frontend/          # React + Vite
│   └── src/
│       ├── api/       # Configuración Axios
│       ├── components/# PrivateRoute
│       ├── context/   # AuthContext (estado global)
│       ├── pages/     # Home, Login, Register, ForgotPassword, Dashboard
│       └── styles/    # CSS por página
├── backend/           # FastAPI
│   └── app/
│       ├── routers/   # auth.py
│       ├── main.py    # Entrada de la API
│       ├── models.py  # Modelos SQLAlchemy
│       ├── schemas.py # Pydantic schemas
│       ├── security.py# JWT + bcrypt
│       └── database.py# Conexión PostgreSQL
└── docs/
    ├── project-card.md
    └── task-01-access.md
```
