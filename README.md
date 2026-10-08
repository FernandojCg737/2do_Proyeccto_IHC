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

---

## 🧪 Pruebas Unitarias (Task 02 – Regla de Cambio de Estado)

El proyecto incluye una suite de pruebas unitarias que valida la máquina de estados y las reglas de negocio para el ciclo de vida de las **Sesiones de Estudio** (`Inscripción abierta -> cerrada`, Acción: *"Cerrar inscripciones"*).

### Casos de prueba evaluados:
1. **`test_01_estado_inicial_es_correcto`**: El estado inicial de la sesión es `'abierta'`.
2. **`test_02_accion_realiza_transicion_esperada`**: La acción `close_registration()` realiza la transición exitosa de `'abierta'` a `'cerrada'`.
3. **`test_03_transicion_invalida_se_rechaza`**: Intentar cerrar una sesión que ya se encuentra cerrada se rechaza lanzando un `ValueError`.
4. **`test_04_demas_datos_del_elemento_se_conservan`**: Tras el cambio de estado, todos los atributos (`name`, `date`, `modality`, `spots`, etc.) se conservan intactos.
5. **`test_05_sesion_cerrada_no_acepta_nuevos_participantes`**: Restricción según su estado: una sesión con estado `'cerrada'` no acepta nuevos participantes (lanza `ValueError`).
6. **`test_06_sesion_abierta_acepta_nuevos_participantes`**: Una sesión abierta sí acepta nuevos participantes e incrementa los cupos ocupados.

### Comandos de ejecución:

#### Opción 1: Ejecutar con Pytest (Recomendado)
```bash
cd backend
python -m pytest -v
```

#### Opción 2: Ejecutar con Unittest nativo de Python (sin dependencias adicionales)
```bash
cd backend
python -m unittest discover -s tests -v
```

#### Opción 3: Ejecutar dentro del contenedor Docker
```bash
docker exec -it studymatch_backend python -m pytest -v
```

---

## 📁 Estructura del proyecto

```
Segundo Proyecto/
├── frontend/          # React + Vite
│   └── src/
│       ├── api/       # Configuración Axios
│       ├── components/# PrivateRoute, ThemeToggle, LogoutIcon
│       ├── context/   # AuthContext (estado global)
│       ├── pages/     # Home, Login, Register, ForgotPassword, Dashboard, Profile
│       └── styles/    # CSS por página (Dashboard.css, Auth.css, etc.)
├── backend/           # FastAPI
│   ├── tests/         # Pruebas unitarias
│   │   ├── __init__.py
│   │   └── test_session_state.py # 4 pruebas unitarias de cambio de estado
│   └── app/
│       ├── routers/   # auth.py, subjects.py, sessions.py
│       ├── main.py    # Entrada de la API
│       ├── models.py  # Modelos SQLAlchemy (User, Subject, Session)
│       ├── schemas.py # Pydantic schemas (SessionCreate, SessionResponse, etc.)
│       ├── security.py# JWT + bcrypt
│       ├── database.py# Conexión PostgreSQL
│       └── triggers.py# Triggers y migraciones DDL PostgreSQL
└── docs/
    ├── project-card.md
    ├── task-01-access.md
    └── task-02-state-tests.md
```

