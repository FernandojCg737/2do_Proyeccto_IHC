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
    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPassword(email, newPassword)
      setMessage('¡Contraseña actualizada! Redirigiendo al login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cambiar contraseña')
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
                <label htmlFor="fp-email">Correo electrónico</label>
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
                <label htmlFor="new-pass">Nueva contraseña</label>
                <input
                  id="new-pass"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-confirm">Confirmar contraseña</label>
                <input
                  id="new-confirm"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError('') }}
                  required
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
