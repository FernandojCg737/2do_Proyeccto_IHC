import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import api from '../api/axios'
import { subjectsData } from '../data/subjects'
import { getStudentInitials } from '../utils/avatar'
import LogoutIcon from '../components/LogoutIcon'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('Todas')
  const [joinedSubjects, setJoinedSubjects] = useState(['ELC106']) // IHC unida por defecto
  const [subjects, setSubjects] = useState(subjectsData)
  const [dbLoaded, setDbLoaded] = useState(false)

  // Cargar materias directamente desde la base de datos PostgreSQL
  useEffect(() => {
    let isMounted = true
    api.get('/subjects/')
      .then((res) => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((s) => ({
            code: s.code,
            name: s.name,
            area: s.area,
            emoji: s.emoji || '📚',
            students: s.students_count || 15,
            sessions: s.sessions_count || 3,
          }))
          setSubjects(mapped)
          setDbLoaded(true)
        }
      })
      .catch((err) => {
        console.warn('Utilizando catálogo local de contingencia:', err)
      })
    return () => { isMounted = false }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleToggleJoin = (code) => {
    setJoinedSubjects((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  // Áreas únicas para los filtros
  const areas = ['Todas', 'Programación', 'Matemáticas', 'Sistemas', 'Redes', 'IA', 'Software', 'Electivas']

  // Filtrado reactivo en tiempo real
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchSearch =
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchArea = selectedArea === 'Todas' || sub.area === selectedArea
      return matchSearch && matchArea
    })
  }, [subjects, searchTerm, selectedArea])

  const totalStudents = useMemo(() => {
    return subjects.reduce((acc, s) => acc + s.students, 0)
  }, [subjects])

  const totalSessions = useMemo(() => {
    return subjects.reduce((acc, s) => acc + s.sessions, 0)
  }, [subjects])


  const displayName = user?.first_name || user?.full_name?.split(' ')[0] || 'Estudiante'
  const studentInitials = useMemo(() => getStudentInitials(user), [user])

  return (
    <div className="dashboard-page">
      {/* Mobile Top Header (Screens < 768px) */}
      <header className="mobile-header">
        <div className="sidebar-logo-container">
          <img src="/logo.png" alt="StudyMatch" className="sidebar-logo" />
        </div>
        <div className="mobile-header-actions">
          <ThemeToggle />
          <div
            className="header-avatar"
            title="Ver mi perfil"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="header-avatar-img" />
            ) : (
              studentInitials
            )}
          </div>
          <button
            className="mobile-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* Desktop / Tablet Sidebar (Screens >= 768px) */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-container">
            <img src="/logo.png" alt="StudyMatch" className="sidebar-logo" />
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-item active">🏠 <span>Dashboard</span></Link>
          <a href="#materias" className="sidebar-item">📚 <span>Materias ({subjects.length})</span></a>
          <a href="#" className="sidebar-item">👥 <span>Mis grupos ({joinedSubjects.length})</span></a>
          <a href="#" className="sidebar-item">📅 <span>Sesiones activas</span></a>
          <Link to="/profile" className="sidebar-item">👤 <span>Mi perfil</span></Link>
        </nav>
        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogoutIcon /> <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Desktop Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="welcome-title">
              ¡Hola, <span className="user-name">{displayName}</span>! 👋
            </h1>
            <p className="welcome-sub">
              Plan de Estudios de Ingeniería Informática y Sistemas · Sesiones disponibles hoy
            </p>
          </div>
          <div className="dashboard-header-right">
            <ThemeToggle />
            <div
              className="header-avatar"
              title="Ver mi perfil"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="header-avatar-img" />
              ) : (
                studentInitials
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{subjects.length}</div>
            <div className="stat-label">Materias del Plan</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalSessions}</div>
            <div className="stat-label">Sesiones Disponibles</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Compañeros Conectados</div>
          </div>
        </div>

        {/* Subjects Section with Interactive Toolbar */}
        <section id="materias" className="subjects-section">
          <div className="subjects-header-bar">
            <div>
              <h2 className="section-title">
                Materias Académicas
                <span className="subjects-count-badge">{filteredSubjects.length}</span>
              </h2>
              <p className="section-subtitle">
                Únete a un grupo de estudio o busca compañeros por materia oficial
              </p>
            </div>
          </div>

          {/* Search bar & Area Pills */}
          <div className="dashboard-toolbar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por código (ej: ELC106, INF120) o nombre de materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dashboard-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="area-pills-row">
              {areas.map((area) => (
                <button
                  key={area}
                  type="button"
                  className={`area-pill ${selectedArea === area ? 'active' : ''}`}
                  onClick={() => setSelectedArea(area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects Grid */}
          {filteredSubjects.length > 0 ? (
            <div className="subjects-grid">
              {filteredSubjects.map((subject) => {
                const isJoined = joinedSubjects.includes(subject.code)
                return (
                  <div key={subject.code} className={`subject-card ${isJoined ? 'card-joined' : ''}`}>
                    <div className="subject-card-top">
                      <span className="subject-code-badge">{subject.code}</span>
                      <span className="subject-area-tag">{subject.area}</span>
                    </div>

                    <div className="subject-card-body">
                      <div className="subject-emoji">{subject.emoji}</div>
                      <h3 className="subject-name">{subject.name}</h3>
                    </div>

                    <div className="subject-info">
                      <span>👥 {subject.students} estudiantes</span>
                      <span>📅 {subject.sessions} sesiones</span>
                    </div>

                    <button
                      type="button"
                      className={`btn-join ${isJoined ? 'joined' : ''}`}
                      onClick={() => handleToggleJoin(subject.code)}
                    >
                      {isJoined ? '✓ Grupo Unido' : '+ Unirse a Grupo'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="no-subjects-found">
              <span className="no-subjects-icon">🔍</span>
              <h3>No se encontraron materias</h3>
              <p>No hay resultados para "{searchTerm}" en la categoría "{selectedArea}".</p>
              <button
                type="button"
                className="btn-outline"
                onClick={() => { setSearchTerm(''); setSelectedArea('Todas'); }}
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation (Screens < 768px) */}
      <nav className="mobile-bottom-nav">
        <a href="#" className="mobile-nav-item active">
          <span className="mobile-nav-icon">🏠</span>
          <span>Inicio</span>
        </a>
        <a href="#materias" className="mobile-nav-item">
          <span className="mobile-nav-icon">📚</span>
          <span>Materias</span>
        </a>
        <a href="#" className="mobile-nav-item">
          <span className="mobile-nav-icon">👥</span>
          <span>Grupos</span>
        </a>
        <a href="#" className="mobile-nav-item">
          <span className="mobile-nav-icon">📅</span>
          <span>Sesiones</span>
        </a>
        <Link to="/profile" className="mobile-nav-item">
          <span className="mobile-nav-icon">👤</span>
          <span>Perfil</span>
        </Link>
      </nav>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Cerrar sesión?</h3>
            <p>¿Estás seguro que deseas salir de StudyMatch?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
              <button className="btn-confirm-logout" onClick={handleLogout}>Sí, cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
