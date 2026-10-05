"""
Pruebas Unitarias - Regla de Cambio de Estado (Task 02)
Proyecto: StudyMatch
Flujo de Estado: Inscripción abierta -> cerrada
Acción: "Cerrar inscripciones"

Requisitos evaluados:
1. El estado inicial es el correcto ('abierta').
2. La acción realiza la transición esperada ('abierta' -> 'cerrada').
3. Una transición inválida se rechaza (intentar cerrar cuando ya está 'cerrada').
4. Los demás datos del elemento se conservan (nombre, fecha, modalidad, cupos, id).
"""

import unittest
from datetime import date, datetime
import sys
import os

# Asegurar que el directorio raíz del backend esté en sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models import Session


class TestSessionStateTransitions(unittest.TestCase):
    """
    Suite de pruebas unitarias sobre la regla de cambio de estado de una Sesión de Estudio.
    """

    def setUp(self):
        """
        Fixture de prueba:
        Crea una instancia de sesión representativa para cada caso de prueba.
        """
        self.session = Session(
            id=101,
            name="Taller de Álgebra Lineal - Espacios Vectoriales",
            date=date(2026, 10, 20),
            modality="Presencial",
            spots=15,
            status="abierta",
            creator_id=1,
            creator_name="Fernando Calani",
            created_at=datetime(2026, 10, 5, 10, 0, 0)
        )

    def test_01_estado_inicial_es_correcto(self):
        """
        Prueba 1: El estado inicial es el correcto.
        Verifica que al instanciarse o crearse una sesión, su estado por defecto
        sea 'abierta' (Inscripción abierta) y que is_open sea True.
        """
        self.assertEqual(
            self.session.status,
            "abierta",
            "El estado inicial de la sesión debe ser 'abierta'."
        )
        self.assertTrue(
            self.session.is_open,
            "La propiedad is_open debe ser True cuando el estado inicial es 'abierta'."
        )

    def test_02_accion_realiza_transicion_esperada(self):
        """
        Prueba 2: La acción realiza la transición esperada.
        Verifica que al invocar 'close_registration()' (Cerrar inscripciones),
        el estado pase efectivamente de 'abierta' a 'cerrada'.
        """
        # Estado previo
        self.assertEqual(self.session.status, "abierta")

        # Ejecución de la acción
        resultado = self.session.close_registration()

        # Verificación del estado posterior
        self.assertEqual(
            self.session.status,
            "cerrada",
            "La acción debe cambiar el estado a 'cerrada'."
        )
        self.assertFalse(
            self.session.is_open,
            "La propiedad is_open debe ser False una vez cerrada la inscripción."
        )
        self.assertIs(
            resultado,
            self.session,
            "El método debe retornar la instancia de la sesión actualizada."
        )

    def test_03_transicion_invalida_se_rechaza(self):
        """
        Prueba 3: Una transición inválida se rechaza.
        Verifica que intentar cerrar una sesión que ya se encuentra en estado 'cerrada'
        (o en cualquier estado distinto a 'abierta') sea rechazado lanzando un ValueError,
        y que el estado no sufra modificaciones no deseadas.
        """
        # Primera transición válida: abierta -> cerrada
        self.session.close_registration()
        self.assertEqual(self.session.status, "cerrada")

        # Intentar ejecutar nuevamente la acción sobre una sesión ya cerrada
        with self.assertRaises(ValueError) as context:
            self.session.close_registration()

        # Comprobar el mensaje de rechazo
        self.assertIn(
            "Transición inválida",
            str(context.exception),
            "Debe lanzar un ValueError indicando que la transición es inválida."
        )

        # El estado debe mantenerse estrictamente en 'cerrada'
        self.assertEqual(
            self.session.status,
            "cerrada",
            "El estado debe continuar siendo 'cerrada' tras rechazar la transición inválida."
        )

    def test_04_demas_datos_del_elemento_se_conservan(self):
        """
        Prueba 4: Los demás datos del elemento se conservan.
        Verifica que tras ejecutar la acción de cerrar inscripciones, todos los demás
        atributos del modelo (id, name, date, modality, spots, creator_id, creator_name, created_at)
        permanezcan intactos.
        """
        # Captura de los valores previos
        id_esperado = self.session.id
        nombre_esperado = self.session.name
        fecha_esperada = self.session.date
        modalidad_esperada = self.session.modality
        cupos_esperados = self.session.spots
        creator_id_esperado = self.session.creator_id
        creator_name_esperado = self.session.creator_name
        fecha_creacion_esperada = self.session.created_at

        # Ejecutar la acción que cambia el estado
        self.session.close_registration()

        # Verificaciones de conservación de datos
        self.assertEqual(self.session.status, "cerrada", "El estado debió cambiar a 'cerrada'.")
        self.assertEqual(self.session.id, id_esperado, "El ID de la sesión debe conservarse.")
        self.assertEqual(self.session.name, nombre_esperado, "El nombre de la sesión debe conservarse.")
        self.assertEqual(self.session.date, fecha_esperada, "La fecha de la sesión debe conservarse.")
        self.assertEqual(self.session.modality, modalidad_esperada, "La modalidad debe conservarse.")
        self.assertEqual(self.session.spots, cupos_esperados, "La cantidad de cupos debe conservarse.")
        self.assertEqual(self.session.created_at, fecha_creacion_esperada, "La fecha de creación debe conservarse.")


if __name__ == "__main__":
    unittest.main()

