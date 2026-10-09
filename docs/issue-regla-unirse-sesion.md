# Issue: Regla de Negocio — ¿Puede unirse a la sesión de estudio?

**Materia:** Interacción Hombre-Computador (IHC) — Clase 14: *Del requisito al código*  
**Proyecto:** StudyMatch 📚🤝  
**Estado:** Resuelto / Implementado y Verificado  

---

## 📌 Plantilla del Issue en GitHub

### Título
`feat(sesiones): Regla de negocio - ¿Puede unirse a la sesión de estudio?`

### Historia de usuario

```markdown
Como estudiante, quiero unirme a una sesión de estudio para participar y repasar la materia con mis compañeros.
```

### Criterios de aceptación

```markdown
- [x] Solo se permite unir a la sesión si su estado es "abierta".
- [x] Una sesión "cerrada" no acepta nuevos participantes (solicitud rechazada con mensaje claro).
- [x] Un estudiante no puede inscribirse dos veces a la misma sesión (regla de no duplicidad).
- [x] La inscripción permanece después de recargar (persistida en la base de datos PostgreSQL).
```

---

## 🗂️ División en Sub-Issues Relacionados (Paso: Dividir)

Para modularizar el desarrollo y facilitar la trazabilidad, el requerimiento se dividió en tres tareas especializadas:

1. **Sub-Issue 1 (Backend / Dominio):**  
   * *Nombre:* `feat(domain): Implementar regla pura can_join() y register_participant() en modelo Session`
   * *Alcance:* Programar la función de negocio pura independiente de cualquier interfaz o framework web.
2. **Sub-Issue 2 (Testing / Pruebas Unitarias):**  
   * *Nombre:* `test(sessions): Pruebas unitarias para caso permitido y casos rechazados`
   * *Alcance:* Crear tests deterministas para evaluar:
     * Caso permitido: Sesión abierta acepta participante.
     * Caso rechazado 1: Sesión cerrada no acepta participante (`ValueError`).
     * Caso rechazado 2: Inscripción duplicada es bloqueada (`ValueError`).
3. **Sub-Issue 3 (Frontend / Interfaz IHC):**  
   * *Nombre:* `ui(sessions): Botón reactivo de inscripción y feedback de estado en Dashboard`
   * *Alcance:* Mostrar botón interactivo `Inscribirme`, deshabilitar si la sesión está cerrada (`⛔ Inscripción cerrada`) o si el estudiante ya está inscrito (`✅ Ya estás inscrito`).

---

## 💻 Implementación Técnica (Paso: Implementar)

### Regla de negocio pura (separada de la interfaz)
Ubicación: [`backend/app/models.py`](file:///d:/INTERACCION%20HOMBRE-COMPUTADOR/Segundo%20Proyecto/backend/app/models.py)

```python
def can_join(self, user_email: str | None = None) -> tuple[bool, str]:
    """
    Regla de negocio: ¿Puede unirse a la sesión?
    Evalúa si un estudiante cumple todas las condiciones para inscribirse.
    Retorna (True, 'Permitido') o (False, 'Motivo del rechazo').
    """
    if self.status != "abierta":
        return False, "Una sesión cerrada no acepta nuevos participantes."

    normalized_email = user_email.strip().lower() if user_email else None
    if normalized_email and self.is_user_registered(normalized_email):
        return False, "Ya te encuentras inscrito en esta sesión de estudio."

    current_count = self.participants_count or len(self.get_participant_emails_list())
    if self.spots is not None and current_count >= self.spots:
        return False, "No hay cupos disponibles en esta sesión de estudio."

    return True, "Permitido"

def register_participant(self, user_email: str | None = None):
    """
    Aplica la regla de negocio: ¿Puede unirse a la sesión?
    Si la regla lo rechaza, levanta ValueError con el motivo exacto.
    Si lo permite, registra el participante y persiste el cambio.
    """
    allowed, reason = self.can_join(user_email)
    if not allowed:
        raise ValueError(reason)

    normalized_email = user_email.strip().lower() if user_email else None
    emails = self.get_participant_emails_list()

    if normalized_email:
        emails.append(normalized_email)
        self.participant_emails = json.dumps(emails)
        self.participants_count = len(emails)
    else:
        self.participants_count = (self.participants_count or 0) + 1

    return self
```

---

## 🧪 Pruebas Unitarias (Paso: Probar)

Ubicación: [`backend/tests/test_session_state.py`](file:///d:/INTERACCION%20HOMBRE-COMPUTADOR/Segundo%20Proyecto/backend/tests/test_session_state.py)

### 1. Caso Rechazado: Sesión Cerrada
```python
def test_05_sesion_cerrada_no_acepta_nuevos_participantes(self):
    self.session.close_registration()
    with self.assertRaises(ValueError) as context:
        self.session.register_participant(user_email="estudiante2@uagrm.edu.bo")
    self.assertIn("Una sesión cerrada no acepta nuevos participantes", str(context.exception))
```

### 2. Caso Permitido: Sesión Abierta
```python
def test_06_sesion_abierta_acepta_nuevos_participantes(self):
    self.assertEqual(self.session.status, "abierta")
    self.session.register_participant(user_email="estudiante_nuevo@uagrm.edu.bo")
    self.assertEqual(self.session.participants_count, 1)
```

### 3. Caso Rechazado: Inscripción Duplicada
```python
def test_08_usuario_ya_inscrito_no_puede_inscribirse_doble(self):
    email = "juan.perez@uagrm.edu.bo"
    self.session.register_participant(user_email=email) # Primer intento (éxito)
    with self.assertRaises(ValueError) as context:
        self.session.register_participant(user_email=email) # Segundo intento (rechazado)
    self.assertIn("Ya te encuentras inscrito", str(context.exception))
```

---

## 🚀 Comando de Ejecución y Entrega (Paso: Entregar)

```bash
python -m pytest backend/tests/test_session_state.py -v
```

### Evidencia de Ejecución:
```text
backend/tests/test_session_state.py::TestSessionStateTransitions::test_01_estado_inicial_es_correcto PASSED [ 12%]
backend/tests/test_session_state.py::TestSessionStateTransitions::test_02_accion_realiza_transicion_esperada PASSED [ 25%]
backend/tests/test_session_state.py::TestSessionStateTransitions::test_03_transicion_invalida_se_rechaza PASSED [ 37%]
backend/tests/test_session_state.py::TestSessionStateTransitions::test_04_demas_datos_del_elemento_se_conservan PASSED [ 50%]
backend/tests/test_session_state.py::TestSessionStateTransitions::test_05_sesion_cerrada_no_acepta_nuevos_participantes PASSED [ 62%]
backend/tests/test_session_state.py::TestSessionStateTransitions::test_06_sesion_abierta_acepta_nuevos_participantes PASSED [ 75%]
backend/tests/test_session_state.py::TestSessionStateTransitions::test_07_reabrir_sesion_cerrada PASSED [ 87%]
backend/tests/test_session_state.py::TestSessionStateTransitions::test_08_usuario_ya_inscrito_no_puede_inscribirse_doble PASSED [100%]

============================== 8 passed in 0.40s ==============================
```
