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

### Diseño 100% Responsivo (Auto Layout & Grillas CSS)
- **CSS Grid con `auto-fit` y `minmax`:** Las tarjetas de materias, estadísticas y características de estudio se adaptan automáticamente a cualquier resolución (móvil, tablet, escritorio) sin desbordamiento horizontal.
- **Tipografía fluida con `clamp()`:** Los títulos y textos escalan progresivamente según el tamaño de la pantalla, evitando cortes de texto en dispositivos móviles pequeños (360px).
- **Adaptabilidad móvil en Dashboard:** 
  - En pantallas de escritorio: barra lateral completa fija.
  - En tablets: barra lateral compacta.
  - En smartphones (< 768px): barra superior pegajosa con logo y cambio de tema, contenido a ancho completo y barra de navegación inferior tipo app móvil (*bottom navigation dock*).
- **Formularios de autenticación adaptativos:** El panel dividido oculta las decoraciones pesadas en teléfonos y centra la tarjeta con el logo de marca visible y objetivos táctiles accesibles (mínimo 44px).

---

## Funcionalidades implementadas

| Requisito | Estado | Archivo |
|-----------|--------|---------|
| Registro de cuenta | ✅ | `pages/Register.jsx` + `routers/auth.py` |
| Inicio de sesión | ✅ | `pages/Login.jsx` + `routers/auth.py` |
| Cierre de sesión | ✅ | `pages/Dashboard.jsx` / `pages/Profile.jsx` (modal) |
| Recuperación de contraseña | ✅ | `pages/ForgotPassword.jsx` + `routers/auth.py` |
| Sesión persistente al recargar | ✅ | `context/AuthContext.jsx` (localStorage) |
| Ruta pública | ✅ | `/` → `pages/Home.jsx` |
| Rutas privadas con redirección | ✅ | `/dashboard`, `/profile` + `components/PrivateRoute.jsx` |
| Nombre del usuario autenticado | ✅ | `pages/Dashboard.jsx`, `pages/Profile.jsx` |
| Perfil con datos del usuario | ✅ | `pages/Profile.jsx` (`/profile` + `/auth/me`) |
| Cambio de contraseña autenticado | ✅ | `pages/Profile.jsx` + `POST /auth/change-password` |

---

## Archivos principales

```
frontend/src/
├── context/AuthContext.jsx      ← Lógica de sesión global (login, logout, changePassword, refreshUser)
├── components/PrivateRoute.jsx  ← Protección de rutas
├── components/ThemeToggle.jsx   ← Switch modo claro / oscuro
├── data/subjects.js            ← Catálogo oficial de 53 materias de la carrera
├── pages/Login.jsx              ← Inicio de sesión (centrado responsivo)
├── pages/Register.jsx           ← Registro de cuenta (validaciones IHC)
├── pages/ForgotPassword.jsx     ← Recuperar contraseña
├── pages/Dashboard.jsx          ← Ruta privada (53 materias, buscador, filtros)
├── pages/Profile.jsx            ← Ruta privada (perfil de estudiante y cambio de contraseña)
├── pages/Home.jsx               ← Ruta pública (hero, CTA, logo de marca)
└── api/axios.js                 ← Cliente HTTP con token automático

backend/app/
├── main.py                      ← Entrada FastAPI + CORS + Auto-seed
├── routers/auth.py              ← Endpoints de autenticación (/register, /login, /me, /change-password)
├── routers/subjects.py          ← Endpoints de materias (/subjects, /subjects/{code}, /seed)
├── models.py                    ← Modelos User y Subject (PostgreSQL)
├── schemas.py                   ← Validación de datos Pydantic
├── security.py                  ← JWT + bcrypt
└── database.py                  ← Conexión SQLAlchemy
```

---

## Perfil del Estudiante y Seguridad de Contraseña (`/profile`)
Al hacer clic en **"Mi perfil"** desde la barra lateral, el menú móvil o el avatar del estudiante:
1. **Datos Registrados del Estudiante y Edición en Vivo:**
   - Muestra nombres, apellidos, nombre completo, correo electrónico institucional/personal, estado de la cuenta (activa) y fecha de creación.
   - **Gestión de Foto de Perfil:** Permite subir, cambiar y eliminar una foto de perfil personalizada (`POST /auth/avatar`, `DELETE /auth/avatar`), con vista previa inmediata.
   - **Iniciales personalizadas automáticas:** Cuando no hay foto de perfil, el avatar muestra la inicial del **primer apellido + primer nombre** (ej: Calani Fernando → **CF**).
   - Botón **"✏️ Editar Datos"**: Permite editar nombres, apellidos y correo electrónico en un formulario limpio e interactivo.
   - **Trigger en PostgreSQL (`trg_update_user_profile`):** Al guardar los cambios, el disparador en PostgreSQL concatena silenciosamente `first_name` y `last_name` en `full_name` y actualiza `updated_at`.
2. **Cambio de Contraseña Seguro:**
   - Requiere la **contraseña actual** para verificar la identidad antes de cualquier cambio.
   - Solicita la **nueva contraseña** con validación visual en vivo de las políticas de seguridad (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo).
   - Solicita la **confirmación** con comprobación de coincidencia.
   - Valida en backend y frontend que la nueva clave sea diferente a la actual.
   - Proporciona retroalimentación inmediata con alertas de éxito o advertencia.



---

## Catálogo Oficial de Materias Integradas
El dashboard cuenta con las 53 asignaturas oficiales del plan de estudios de la carrera (desde `MAT101 Cálculo I` hasta `ELC108 Control y Automatización`), incluyendo la materia de este proyecto `ELC106 Interacción Hombre-Computador`.
- **Búsqueda instantánea:** Filtrado por código o nombre de materia en tiempo real.
- **Filtros por área:** Programación, Matemáticas, Sistemas, Redes, IA, Software, Electivas.
- **Interacción de grupos:** Unirse o salir de salas y grupos de estudio con estado visual inmediato.

