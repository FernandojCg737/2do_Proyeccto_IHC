import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: nueva contraseña
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { forgotPassword, resetPassword } = useAuth()
  const navigate = useNavigate()

  const rules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`]/.test(newPassword),
  }

  const isPasswordValid = Object.values(rules).every(Boolean)

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setMessage('Correo verificado. Ahora ingresa tu nueva contraseña.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo no encontrado')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!isPasswordValid) {
      setError('La nueva contraseña debe cumplir con todos los requisitos de seguridad')
      return
    }

    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    setError('')
    try {
      await resetPassword(email, newPassword)
      setMessage('¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '))
      } else {
        setError(detail || 'Error al cambiar contraseña')
      }
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
        <h2 className="auth-tagline">Recupera tu acceso</h2>
        <p>Te ayudamos a restablecer tu contraseña.</p>
        <div className="auth-decorations">
          <div className="deco-circle deco-1"></div>
          <div className="deco-circle deco-2"></div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">
            {step === 1 ? 'Recuperar contraseña' : 'Nueva contraseña'}
          </h1>
          <p className="auth-subtitle">
            <Link to="/login" className="auth-link">← Volver al login</Link>
          </p>

          {message && <div className="auth-success">{message}</div>}
          {error && <div className="auth-error">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleVerifyEmail} className="auth-form">
              <div className="form-group">
                <label htmlFor="fp-email">Correo Electrónico</label>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  required
                />
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Verificar correo'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="new-pass">Nueva Contraseña</label>
                <input
                  id="new-pass"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Checklist de requisitos de contraseña */}
              <div className="password-requirements">
                <div className={`req-item ${rules.length ? 'valid' : ''}`}>
                  <span className="req-icon">{rules.length ? '✓' : '○'}</span>
                  <span>Al menos 8 caracteres</span>
                </div>
                <div className={`req-item ${rules.upper ? 'valid' : ''}`}>
                  <span className="req-icon">{rules.upper ? '✓' : '○'}</span>
                  <span>Al menos 1 letra mayúscula (A-Z)</span>
                </div>
                <div className={`req-item ${rules.lower ? 'valid' : ''}`}>
                  <span className="req-icon">{rules.lower ? '✓' : '○'}</span>
                  <span>Al menos 1 letra minúscula (a-z)</span>
                </div>
                <div className={`req-item ${rules.number ? 'valid' : ''}`}>
                  <span className="req-icon">{rules.number ? '✓' : '○'}</span>
                  <span>Al menos 1 número (0-9)</span>
                </div>
                <div className={`req-item ${rules.special ? 'valid' : ''}`}>
                  <span className="req-icon">{rules.special ? '✓' : '○'}</span>
                  <span>Al menos 1 carácter especial (@, $, !, %, *, #, etc.)</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-confirm">Confirmar Contraseña</label>
                <input
                  id="new-confirm"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError('') }}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
