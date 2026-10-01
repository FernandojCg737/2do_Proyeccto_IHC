import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await register(form.full_name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/">
          <img src="/logo.png" alt="StudyMatch" className="auth-logo" />
        </Link>
        <h2 className="auth-tagline">Únete a StudyMatch</h2>
        <p>Miles de estudiantes ya estudian juntos.</p>
        <div className="auth-decorations">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">
            ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link>
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="full_name">Nombre completo</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                placeholder="Fernando García"
                value={form.full_name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirmar contraseña</label>
              <input
                id="confirm"
                type="password"
                name="confirm"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="btn-spinner"></span> : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
