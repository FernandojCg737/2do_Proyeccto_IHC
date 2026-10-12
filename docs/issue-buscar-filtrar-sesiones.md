# Requisito docente · Buscar y filtrar sesiones de estudio

> Relacionado con: GitHub Issue #2

## Historia de usuario

Como estudiante,  
quiero buscar sesiones y filtrarlas,  
para encontrar una a la que realmente pueda asistir.

## Criterios de aceptación cumplidos

- [x] **Búsqueda por nombre:** Puedo buscar sesiones por su título o tema mediante campo de búsqueda reactivo con debounce y consulta en base de datos.
- [x] **Filtro por materia:** Puedo filtrar por materias oficiales de la base de datos y agregar nuevas materias mediante la opción *"➕ Otra materia..."* (que las registra automáticamente en la tabla `subjects` y en la sesión).
- [x] **Filtro por fecha:** Opciones directas para *Hoy*, *Próximos 7 días* y *Rango personalizado* (`date_from` y `date_to`).
- [x] **Filtro por modalidad:** Botones interactivos para alternar entre *Todas*, *Presencial* y *Virtual*.
- [x] **Filtro por disponibilidad:** Solo sesiones abiertas, con cupos libres y fecha futura (`only_available=true`), utilizando la regla de negocio del Issue #1.
- [x] **Filtros combinables:** Se pueden aplicar simultáneamente (por ejemplo: Cálculo, virtual y con cupos).
- [x] **Visibilidad de filtros activos (IHC):** Barra interactiva de chips/etiquetas removibles individualmente con botón ✕ y acción para *Limpiar todos los filtros*.
- [x] **Mensaje de estado vacío (Empty State):** Si no hay coincidencias, muestra un mensaje explícito *"No se encontraron sesiones coincidentes"* con un botón de restablecimiento rápido.
- [x] **Resolución en Base de Datos:** Los filtros se resuelven mediante consultas SQL en PostgreSQL/SQLAlchemy a través del endpoint `GET /sessions/?...`.
- [x] **Pruebas unitarias:** Suite de 11 pruebas unitarias cubriendo casos con resultados, casos vacíos y combinaciones complejas (`pytest backend/tests/test_session_filters.py -v`).
