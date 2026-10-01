import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="StudyMatch" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="sidebar-item active">🏠 Dashboard</a>
          <a href="#" className="sidebar-item">🔍 Buscar compañeros</a>
          <a href="#" className="sidebar-item">📅 Mis sesiones</a>
          <a href="#" className="sidebar-item">📚 Mis materias</a>
          <a href="#" className="sidebar-item">👤 Mi perfil</a>
        </nav>
        <button
          className="sidebar-logout"
          onClick={() => setShowLogoutConfirm(true)}
        >
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="welcome-title">
              ¡Hola, <span className="user-name">{user?.full_name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="welcome-sub">Aquí están tus materias y sesiones disponibles.</p>
          </div>
          <div className="header-avatar">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Stats */}
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
              <button className="btn-join">Unirse</button>
            </div>
          ))}
        </div>
      </main>

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
