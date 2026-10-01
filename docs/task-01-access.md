# Task 01 – Manejo de Acceso

## Modalidad
- **Parte 1 (sin IA):** No aplicable en esta tarea  
- **Parte 2 (con IA):** Asistencia con Antigravity IDE (Google DeepMind)

---

## Decisiones técnicas

### ¿Por qué React + Vite?
- Desarrollo rápido con Hot Module Replacement
- React Router v6 permite proteger rutas fácilmente con componentes wrapper
- Vite arranca en menos de 1 segundo

### ¿Por qué FastAPI?
- Framework Python moderno con tipado automático
- Genera documentación interactiva en `/docs` automáticamente
- Validación de datos con Pydantic integrada

### ¿Por qué PostgreSQL?
- Base de datos relacional robusta
- Integración nativa con SQLAlchemy
- Tabla `users` con campos claros y tipados

### ¿Cómo se maneja la sesión?
- Al hacer login/register, el backend genera un **JWT** firmado
- El token se guarda en `localStorage`
- `AuthContext` con `useEffect` lo recupera al recargar la página
- Si no hay token → `PrivateRoute` redirige a `/login`

### ¿Por qué no se envía correo real en recuperación?
- El enunciado lo permite explícitamente
- Se implementa un flujo de 2 pasos: verificar email → nueva contraseña

### Política de seguridad de contraseñas y campos de usuario
- **Campos de registro:** Nombres (`first_name`), Apellidos (`last_name`), Correo Electrónico (`email`), Contraseña (`password`) y Confirmar Contraseña (`confirm`).
- **Reglas de contraseña (validación en Frontend y Backend):**
  - Mínimo 8 caracteres de longitud.
  - Al menos una letra mayúscula (`A-Z`).
  - Al menos una letra minúscula (`a-z`).
  - Al menos un número (`0-9`).
  - Al menos un carácter especial (`!@#$%^&*...`).
  - Confirmación idéntica a la contraseña.
  - Checklist interactivo visual en tiempo real para mejorar la experiencia de usuario (IHC).

### Identidad visual y Accesibilidad (Modo Claro / Modo Oscuro)
- **Paleta de marca adaptada a `logo.png`:**
  - Azul Marino StudyMatch (`#1e4b87`)
  - Cian / Turquesa colaborativo (`#00b4d8`, `#38bdf8`)
  - Ámbar cálido de apoyo (`#f59e0b`)
- **Switch Claro / Oscuro con persistencia en `localStorage`:** Permite al estudiante alternar entre un diseño académico limpio (Modo Claro) y un entorno nocturno relajante para largas sesiones de estudio (Modo Oscuro).

---

## Funcionalidades implementadas

| Requisito | Estado | Archivo |
|-----------|--------|---------|
| Registro de cuenta | ✅ | `pages/Register.jsx` + `routers/auth.py` |
| Inicio de sesión | ✅ | `pages/Login.jsx` + `routers/auth.py` |
| Cierre de sesión | ✅ | `pages/Dashboard.jsx` (botón + modal) |
| Recuperación de contraseña | ✅ | `pages/ForgotPassword.jsx` + `routers/auth.py` |
| Sesión persistente al recargar | ✅ | `context/AuthContext.jsx` (localStorage) |
| Ruta pública | ✅ | `/` → `pages/Home.jsx` |
| Ruta privada con redirección | ✅ | `/dashboard` + `components/PrivateRoute.jsx` |
| Nombre del usuario autenticado | ✅ | `pages/Dashboard.jsx` (muestra `user.full_name`) |

---

## Archivos principales

```
frontend/src/
├── context/AuthContext.jsx      ← Lógica de sesión global
├── components/PrivateRoute.jsx  ← Protección de rutas
├── pages/Login.jsx              ← Inicio de sesión
├── pages/Register.jsx           ← Registro
├── pages/ForgotPassword.jsx     ← Recuperar contraseña
├── pages/Dashboard.jsx          ← Ruta privada (muestra nombre)
├── pages/Home.jsx               ← Ruta pública
└── api/axios.js                 ← Cliente HTTP con token automático

backend/app/
├── main.py                      ← Entrada FastAPI + CORS
├── routers/auth.py              ← Endpoints de autenticación
├── models.py                    ← Modelo User (PostgreSQL)
├── schemas.py                   ← Validación de datos
├── security.py                  ← JWT + bcrypt
└── database.py                  ← Conexión SQLAlchemy
```
