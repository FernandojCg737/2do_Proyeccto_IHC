# 📋 Evaluación Heurística de Nielsen · Clase 15 (IHC)
**Proyecto:** StudyMatch 📚🤝  
**Acción asignada:** *"Encontrar una sesión y unirse"*  
**Marco de evaluación:** 10 Heurísticas de Jakob Nielsen (Clase 15)  

---

## 📑 Evidencia: Registro de los Tres Hallazgos (Formato Diapositiva 18)

| # | Pantalla y evidencia | Problema y consecuencia | Heurística | Severidad (0–4) |
|---|---|---|---|:---:|
| **1** | **Pantalla:** Listado de sesiones en Dashboard.<br>**Paso exacto:** Clic en botón `[Inscribirme]` en la tarjeta de sesión ([`Dashboard.jsx`](../frontend/src/pages/Dashboard.jsx#L1005)). | **Problema:** La inscripción se ejecutaba de forma instantánea e irreversible en la base de datos sin confirmación ni resumen previo.<br>**Consecuencia:** Si el estudiante hacía clic por error (*misclick*) o no revisó bien el horario o modalidad, quedaba inscrito inmediatamente ocupando un cupo limitado sin posibilidad de cancelar ni revisar antes de confirmar. | **H3: Control y libertad**<br>*"La persona puede cancelar, volver o salir de una acción iniciada por error."*<br>y **H5: Prevención de errores**<br>*"El diseño evita el problema antes de que ocurra, especialmente en acciones importantes."* | **3**<br>*(Mayor)* |
| **2** | **Pantalla:** Barra de búsqueda y filtros del Dashboard.<br>**Paso exacto:** Escribir en el buscador por nombre o seleccionar materia, fecha o modalidad ([`Dashboard.jsx`](../frontend/src/pages/Dashboard.jsx#L487-L600)). | **Problema:** La interfaz filtraba las sesiones pero no mostraba oportunamente el resultado cuantitativo (cuántas coincidencias encontró).<br>**Consecuencia:** El usuario no sabía si la búsqueda arrojó pocas o muchas opciones sin tener que desplazarse y contarlas manualmente una por una. | **H1: Visibilidad del estado del sistema**<br>*"La interfaz informa oportunamente qué está ocurriendo y cuál fue el resultado."* | **2**<br>*(Menor)* |
| **3** | **Pantalla:** Tarjeta de sesión en Dashboard.<br>**Paso exacto:** Visualización de participantes y cupos ([`Dashboard.jsx`](../frontend/src/pages/Dashboard.jsx#L894)), donde figuraba solo `"👥 4 / 5 participantes"`. | **Problema:** Solo se mostraban cifras numéricas brutas de asistentes y aforo total; no se destacaban visualmente los cupos restantes ni se alertaba la escasez cuando la sesión estaba por llenarse.<br>**Consecuencia:** El estudiante debía realizar un cálculo mental aritmético para saber cuántos cupos quedaban libres o si corría riesgo de quedarse fuera en el último minuto. | **H6: Reconocer antes que recordar**<br>*"Las opciones y datos necesarios están visibles cuando la persona debe decidir."* *(Citado en diapositiva 9 de clase para StudyMatch).* | **2**<br>*(Menor)* |

---

## 🎯 Priorización y Elección del Hallazgo (Minutos 15–20)

> **Criterio obligatorio de clase:** *"Elijan el hallazgo por su impacto en la tarea, no porque sea el cambio visual más rápido."*

### Hallazgo seleccionado: **#1 — Falta de confirmación y libertad de cancelar antes de inscribirse (H3 y H5)**

* **Severidad:** **3 (Problema Mayor)**
* **Justificación del impacto en la tarea:**
  1. **Impacto en el flujo crítico:** Inscribirse a una sesión es el objetivo final de la acción. Un clic accidental sin diálogo de confirmación compromete datos reales en PostgreSQL y bloquea un cupo que priva a otro compañero de participar.
  2. **Prevención de errores (H5):** Un modal interactivo que presenta el resumen de la sesión (materia, fecha, horario, modalidad, ubicación y cupos disponibles) le permite al estudiante tomar una decisión consciente y bien informada.
  3. **Control y libertad (H3):** Brinda una salida de emergencia clara mediante el botón *"Cancelar"*, permitiendo abandonar la acción sin guardar un registro accidental en la base de datos.

---

## 🛠️ Mejora Implementada en Código e Interfaz (Minutos 20–32)

Se implementó la solución completa en el frontend:

1. **Control de Estado React ([`Dashboard.jsx`](../frontend/src/pages/Dashboard.jsx)):**
   - Se añadió el estado `sessionToJoin` para gestionar la apertura y cierre del diálogo de confirmación.
   - El botón *"Inscribirme"* de la tarjeta ahora activa `setSessionToJoin(s)` en lugar de disparar la petición HTTP de inmediato.
2. **Componente Modal de Confirmación ([`Dashboard.jsx`](../frontend/src/pages/Dashboard.jsx#L1240-L1335)):**
   - Encabezado con icono y título: `🎒 Confirmar inscripción a sesión`.
   - Tarjeta de resumen con datos clave visibles: Materia, Fecha, Horario, Modalidad, Cupos libres restantes y Organizador.
   - Caja de mensaje preventivo indicando el compromiso de asistencia.
   - **Botón Cancelar (`btn-cancel`):** Cierra el modal sin modificar la base de datos (**H3: Control y libertad**).
   - **Botón Confirmar (`btn-confirm-join`):** Ejecuta `POST /sessions/{id}/join` con feedback toast inmediato (**H5: Prevención de errores**).
3. **Mejoras complementarias de usabilidad:**
   - **H1:** Agregado el badge de contador de resultados en la barra de filtros (`📋 X sesiones encontradas`).
   - **H6:** Agregado el badge dinámico de cupos libres y la alerta animada `⚠️ ¡Último cupo disponible!`.

---

## 📚 Anexo: Las 10 Heurísticas de Nielsen explicadas en Clase 15

| Heurística | Pregunta guía del docente | Definición dada en clase | Ejemplo visto en diapositivas |
|---|---|---|---|
| **H1: Visibilidad del estado del sistema** | *¿Sé qué está pasando y entiendo el lenguaje?* | La interfaz informa oportunamente qué está ocurriendo y cuál fue el resultado. | Después de postularse, Voluntariado Cerca muestra *"Postulación enviada"* y el estado actual. |
| **H2: Relación con el mundo real** | *¿Sé qué está pasando y entiendo el lenguaje?* | La interfaz utiliza palabras, conceptos y orden comprensibles para sus usuarios. | Presupuesto Estudiantil dice *"Disponible este mes"* en lugar de mostrar `balance_remaining`. |
| **H3: Control y libertad** | *¿Puedo corregir una decisión y encuentro patrones conocidos?* | La persona puede cancelar, volver o salir de una acción iniciada por error. | Mascota al Día permite cerrar *"Reprogramar"* sin guardar una fecha accidental. |
| **H4: Consistencia y estándares** | *¿Puedo corregir una decisión y encuentro patrones conocidos?* | Las mismas palabras, estados y controles mantienen el mismo significado. | Trueque U no llama *"Completar"*, *"Finalizar"* e *"Intercambiar"* a la misma acción en tres pantallas. |
| **H5: Prevención de errores** | *¿La interfaz evita el error y reduce lo que debo recordar?* | El diseño evita el problema antes de que ocurra, especialmente en acciones importantes. | Planazo bloquea *"Cancelar"* para quien no organiza el plan y explica el motivo. |
| **H6: Reconocer antes que recordar** | *¿La interfaz evita el error y reduce lo que debo recordar?* | Las opciones y datos necesarios están visibles cuando la persona debe decidir. | **StudyMatch muestra cupos, fecha y modalidad junto a "Unirme"; no obliga a volver a otra pantalla.** |
| **H7: Flexibilidad y eficiencia** | *¿La tarea es eficiente sin llenar la pantalla de ruido?* | La interacción sirve a quien comienza y también permite avanzar con rapidez a quien ya conoce el producto. | UniSport conserva los filtros activos al regresar del detalle de un partido. |
| **H8: Diseño estético y minimalista** | *¿La tarea es eficiente sin llenar la pantalla de ruido?* | Cada elemento visible compite por atención; lo irrelevante dificulta encontrar la acción principal. | El detalle del partido destaca *"Unirme"* y no lo pierde entre varias acciones secundarias. |
| **H9: Reconocer y recuperarse de errores** | *Cuando algo falla, ¿sé qué pasó y cómo continuar?* | El mensaje explica el problema con lenguaje claro y ofrece una salida concreta. | **"No puedes unirte: la sesión ya no tiene cupos. Busca otra sesión disponible."** |
| **H10: Ayuda y documentación** | *Cuando algo falla, ¿sé qué pasó y cómo continuar?* | Cuando hace falta, la ayuda es fácil de encontrar, breve y orientada a completar una tarea. | Un texto corto explica qué significa *"límite mensual"* justo donde se configura. |
