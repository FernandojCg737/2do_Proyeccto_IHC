import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const subjects = [
    { name: 'Matemáticas', emoji: '📐', students: 12, sessions: 3 },
    { name: 'Programación', emoji: '💻', students: 28, sessions: 7 },
    { name: 'Física', emoji: '⚡', students: 15, sessions: 4 },
    { name: 'Química', emoji: '🧪', students: 9, sessions: 2 },
    { name: 'Historia', emoji: '📜', students: 6, sessions: 1 },
    { name: 'Inglés', emoji: '🌎', students: 20, sessions: 5 },
  ]

  const displayName = user?.first_name || user?.full_name?.split(' ')[0] || 'Estudiante'
  const userInitial = (user?.first_name || user?.full_name || 'U').charAt(0).toUpperCase()

  return (
    <div className="dashboard-page">
      {/* Mobile Top Header (Screens < 768px) */}
      <header className="mobile-header">
        <div className="sidebar-logo-container">
          <img src="/logo.png" alt="StudyMatch" className="sidebar-logo" />
        </div>
        <div className="mobile-header-actions">
          <ThemeToggle />
          <div className="header-avatar" title={user?.full_name || user?.email}>
            {userInitial}
          </div>
          <button
            className="mobile-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            🚪
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
          <a href="#" className="sidebar-item active">🏠 <span>Dashboard</span></a>
          <a href="#" className="sidebar-item">🔍 <span>Buscar compañeros</span></a>
          <a href="#" className="sidebar-item">📅 <span>Mis sesiones</span></a>
          <a href="#" className="sidebar-item">📚 <span>Mis materias</span></a>
          <a href="#" className="sidebar-item">👤 <span>Mi perfil</span></a>
        </nav>
        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            🚪 <span>Cerrar sesión</span>
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
            <p className="welcome-sub">Aquí están tus materias y sesiones disponibles para hoy.</p>
          </div>
          <div className="dashboard-header-right">
            <ThemeToggle />
            <div className="header-avatar" title={user?.full_name || user?.email}>
              {userInitial}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">6</div>
            <div className="stat-label">Materias activas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">22</div>
            <div className="stat-label">Sesiones disponibles</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">90</div>
            <div className="stat-label">Compañeros conectados</div>
          </div>
        </div>

        {/* Subjects grid */}
        <h2 className="section-title">Materias disponibles</h2>
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div key={subject.name} className="subject-card">
              <div className="subject-emoji">{subject.emoji}</div>
              <h3 className="subject-name">{subject.name}</h3>
              <div className="subject-info">
                <span>👥 {subject.students} estudiantes</span>
                <span>📅 {subject.sessions} sesiones</span>
              </div>
              <button className="btn-join">Unirse a grupo</button>
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Screens < 768px) */}
      <nav className="mobile-bottom-nav">
        <a href="#" className="mobile-nav-item active">
          <span className="mobile-nav-icon">🏠</span>
          <span>Inicio</span>
        </a>
        <a href="#" className="mobile-nav-item">
          <span className="mobile-nav-icon">🔍</span>
          <span>Buscar</span>
        </a>
        <a href="#" className="mobile-nav-item">
          <span className="mobile-nav-icon">📅</span>
          <span>Sesiones</span>
        </a>
        <a href="#" className="mobile-nav-item">
          <span className="mobile-nav-icon">📚</span>
          <span>Materias</span>
        </a>
        <a href="#" className="mobile-nav-item">
          <span className="mobile-nav-icon">👤</span>
          <span>Perfil</span>
        </a>
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
