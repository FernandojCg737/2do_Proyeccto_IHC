"""
Pruebas Unitarias - Búsqueda y Filtrado de Sesiones de Estudio (Issue #2)
Proyecto: StudyMatch

Criterios evaluados:
1. Buscar sesiones por su nombre (caso con resultados y caso vacío).
2. Filtrar por materia (caso con resultados y caso vacío).
3. Filtrar por modalidad (Presencial vs Virtual).
4. Filtrar por fecha (hoy, próximos 7 días, rango de fechas).
5. Filtrar por disponibilidad (regla Issue #1: abierta, fecha hoy/futura, con cupos).
6. Combinación de filtros simultáneos (ej: Cálculo, virtual, con cupos).
7. Combinación sin coincidencias devuelve lista vacía [].
"""

import unittest
from datetime import date, datetime, timedelta
import sys
import os

# Asegurar que el backend esté en sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Session, User, Subject, filter_sessions_query


class TestSessionFilters(unittest.TestCase):
    """
    Suite de pruebas unitarias para evaluar el motor de búsqueda y filtrado de sesiones en BD.
    """

    @classmethod
    def setUpClass(cls):
        # Base de datos SQLite en memoria para tests deterministas y aislados
        cls.engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    def setUp(self):
        self.db = self.SessionLocal()
        # Fecha de referencia determinista para pruebas de fechas
        self.ref_date = date(2026, 10, 15)

        # Poblar datos de prueba con diferentes estados, materias, fechas y modalidades
        self.s1 = Session(
            id=1,
            name="Taller de Cálculo I - Derivadas",
            subject="Cálculo I",
            date=self.ref_date,  # Hoy
            modality="Virtual",
            spots=10,
            participants_count=2,
            participant_emails='["a@test.com", "b@test.com"]',
            status="abierta",
            created_at=datetime(2026, 10, 1, 10, 0)
        )
        self.s2 = Session(
            id=2,
            name="Álgebra Lineal - Espacios Vectoriales",
            subject="Álgebra Lineal",
            date=self.ref_date + timedelta(days=3),  # Próximos 7 días (18 oct)
            modality="Presencial",
            spots=8,
            participants_count=1,
            participant_emails='["c@test.com"]',
            status="abierta",
            created_at=datetime(2026, 10, 2, 11, 0)
        )
        self.s3 = Session(
            id=3,
            name="Repaso de Física I - Dinámica",
            subject="Física I",
            date=self.ref_date + timedelta(days=5),  # Próximos 7 días (20 oct)
            modality="Virtual",
            spots=4,
            participants_count=4,  # CUPOS LLENOS (no disponible)
            participant_emails='["1@t.com", "2@t.com", "3@t.com", "4@t.com"]',
            status="abierta",
            created_at=datetime(2026, 10, 3, 12, 0)
        )
        self.s4 = Session(
            id=4,
            name="Programación I - Punteros y Memoria",
            subject="Programación I",
            date=self.ref_date - timedelta(days=5),  # FECHA PASADA (10 oct)
            modality="Presencial",
            spots=12,
            participants_count=2,
            participant_emails='["p@t.com"]',
            status="abierta",
            created_at=datetime(2026, 10, 4, 9, 0)
        )
        self.s5 = Session(
            id=5,
            name="Estructuras Discretas - Grafos",
            subject="Estructuras Discretas",
            date=self.ref_date + timedelta(days=12),  # Futura lejana (27 oct)
            modality="Virtual",
            spots=15,
            participants_count=3,
            participant_emails='["g@t.com"]',
            status="cerrada",  # SESIÓN CERRADA (no disponible)
            created_at=datetime(2026, 10, 5, 8, 0)
        )

        self.db.add_all([self.s1, self.s2, self.s3, self.s4, self.s5])
        self.db.commit()

    def tearDown(self):
        self.db.query(Session).delete()
        self.db.commit()
        self.db.close()

    def test_01_buscar_por_nombre_encuentra_coincidencias(self):
        """
        Criterio: Puedo buscar sesiones por su nombre.
        Verifica que buscar 'Cálculo' retorne la sesión correspondiente.
        """
        results = filter_sessions_query(self.db, search="Cálculo", reference_date=self.ref_date)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, 1)
        self.assertIn("Cálculo", results[0].name)

    def test_02_buscar_por_nombre_sin_coincidencias_retorna_vacio(self):
        """
        Criterio: Caso de prueba que no devuelve nada.
        Verifica que un término inexistente como 'Termodinámica' devuelva una lista vacía.
        """
        results = filter_sessions_query(self.db, search="Termodinámica Avanzada 999", reference_date=self.ref_date)
        self.assertEqual(len(results), 0)

    def test_03_filtrar_por_materia_especifica(self):
        """
        Criterio: Puedo filtrar por materia.
        Verifica que filtrar por 'Álgebra Lineal' retorne únicamente la sesión de esa materia.
        """
        results = filter_sessions_query(self.db, subject="Álgebra Lineal", reference_date=self.ref_date)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, 2)
        self.assertEqual(results[0].subject, "Álgebra Lineal")

    def test_04_filtrar_por_materia_sin_sesiones_retorna_vacio(self):
        """
        Criterio: Filtrar por materia sin sesiones retorna lista vacía.
        """
        results = filter_sessions_query(self.db, subject="Inglés Técnico II", reference_date=self.ref_date)
        self.assertEqual(len(results), 0)

    def test_05_filtrar_por_modalidad(self):
        """
        Criterio: Puedo filtrar por modalidad: presencial o virtual.
        """
        virtuals = filter_sessions_query(self.db, modality="Virtual", reference_date=self.ref_date)
        self.assertEqual(len(virtuals), 3)  # s1, s3, s5
        for s in virtuals:
            self.assertEqual(s.modality, "Virtual")

        presentials = filter_sessions_query(self.db, modality="Presencial", reference_date=self.ref_date)
        self.assertEqual(len(presentials), 2)  # s2, s4
        for s in presentials:
            self.assertEqual(s.modality, "Presencial")

    def test_06_filtrar_por_fecha_hoy(self):
        """
        Criterio: Puedo filtrar por fecha: hoy.
        """
        results = filter_sessions_query(self.db, date_filter="hoy", reference_date=self.ref_date)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, 1)
        self.assertEqual(results[0].date, self.ref_date)

    def test_07_filtrar_por_fecha_proximos_7_dias(self):
        """
        Criterio: Puedo filtrar por fecha: próximos 7 días.
        Debe incluir hoy (15 oct), +3 días (18 oct) y +5 días (20 oct).
        Excluye pasadas (10 oct) y lejanas (+12 días).
        """
        results = filter_sessions_query(self.db, date_filter="proximos_7_dias", reference_date=self.ref_date)
        ids = [s.id for s in results]
        self.assertIn(1, ids)
        self.assertIn(2, ids)
        self.assertIn(3, ids)
        self.assertNotIn(4, ids)  # Pasada
        self.assertNotIn(5, ids)  # Más de 7 días
        self.assertEqual(len(results), 3)

    def test_08_filtrar_por_rango_de_fechas(self):
        """
        Criterio: Puedo filtrar por fecha: un rango de fechas.
        Rango del 17 de octubre al 22 de octubre -> solo s2 (18 oct) y s3 (20 oct).
        """
        results = filter_sessions_query(
            self.db,
            date_filter="rango",
            date_from=self.ref_date + timedelta(days=2),
            date_to=self.ref_date + timedelta(days=7),
            reference_date=self.ref_date
        )
        ids = [s.id for s in results]
        self.assertEqual(ids, [3, 2])  # Ordenadas por created_at desc

    def test_09_filtrar_por_disponibilidad_solo_abiertas_con_cupos_y_futuras(self):
        """
        Criterio: Puedo filtrar por disponibilidad: solo sesiones abiertas y con cupos.
        Debe aplicar la regla del Issue #1:
        - Excluye s3 porque tiene 4/4 participantes (cupos agotados).
        - Excluye s4 porque su fecha ya pasó.
        - Excluye s5 porque su estado es 'cerrada'.
        Solo permite s1 (Cálculo, abierta, 2/10 cupos, hoy) y s2 (Álgebra, abierta, 1/8 cupos, futura).
        """
        results = filter_sessions_query(self.db, only_available=True, reference_date=self.ref_date)
        ids = [s.id for s in results]
        self.assertIn(1, ids)
        self.assertIn(2, ids)
        self.assertNotIn(3, ids, "La sesión con cupos llenos no debe aparecer en disponibles.")
        self.assertNotIn(4, ids, "La sesión con fecha pasada no debe aparecer en disponibles.")
        self.assertNotIn(5, ids, "La sesión cerrada no debe aparecer en disponibles.")
        self.assertEqual(len(results), 2)

    def test_10_combinar_filtros_materia_modalidad_y_disponibilidad(self):
        """
        Criterio: La búsqueda y los filtros se pueden combinar (ej: Cálculo, virtual, con cupos).
        """
        results = filter_sessions_query(
            self.db,
            search="Cálculo",
            modality="Virtual",
            only_available=True,
            reference_date=self.ref_date
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, 1)
        self.assertEqual(results[0].modality, "Virtual")
        self.assertEqual(results[0].status, "abierta")

    def test_11_combinacion_sin_coincidencias_retorna_vacio(self):
        """
        Criterio: Combinación de filtros que no encuentra nada retorna lista vacía [].
        Ejemplo: Sesiones de Cálculo presenciales con cupos (solo existe virtual).
        """
        results = filter_sessions_query(
            self.db,
            search="Cálculo",
            modality="Presencial",
            only_available=True,
            reference_date=self.ref_date
        )
        self.assertEqual(len(results), 0)


if __name__ == "__main__":
    unittest.main()
