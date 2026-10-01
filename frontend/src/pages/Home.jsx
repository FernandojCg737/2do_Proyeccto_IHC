import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="nav-brand">
          <img src="/logo.png" alt="StudyMatch Logo" className="nav-logo" />
        </div>
        <div className="nav-actions">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Ir al Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Iniciar Sesión</Link>
              <Link to="/register" className="btn-primary">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎓 Plataforma de Estudio Colaborativo</div>
          <h1 className="hero-title">
            Encuentra tu <span className="gradient-text">compañero</span> de estudio ideal
          </h1>
          <p className="hero-subtitle">
            StudyMatch conecta estudiantes para organizar sesiones de estudio,
            compartir recursos y alcanzar juntos sus metas académicas.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero-primary">
              Comenzar gratis →
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <span className="card-emoji">📚</span>
            <span>Matemáticas</span>
            <span className="card-count">12 estudiantes</span>
          </div>
          <div className="floating-card card-2">
            <span className="card-emoji">💻</span>
            <span>Programación</span>
            <span className="card-count">28 estudiantes</span>
          </div>
          <div className="floating-card card-3">
            <span className="card-emoji">🧪</span>
            <span>Química</span>
            <span className="card-count">9 estudiantes</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Conecta con compañeros</h3>
          <p>Encuentra estudiantes de tu misma materia y nivel.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Organiza sesiones</h3>
          <p>Agenda sesiones de estudio y recibe recordatorios.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>Mejora tu rendimiento</h3>
          <p>Estudiar en grupo mejora la comprensión y retención.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2026 StudyMatch · Compañeros | Sesiones de Estudio</p>
      </footer>
    </div>
  )
}
