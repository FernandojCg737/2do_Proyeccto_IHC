import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import api from '../api/axios'
import { getStudentInitials } from '../utils/avatar'
import LogoutIcon from '../components/LogoutIcon'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // ── SESIONES ──────────────────────────────────────────
  const [sessions, setSessions] = useState([])
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    name: '',
    date: '',
    modality: 'Presencial',
    spots: '',
  })
  const [sessionError, setSessionError] = useState('')
  const [sessionSaving, setSessionSaving] = useState(false)
  const [closingSessionId, setClosingSessionId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // ── EDITAR, ELIMINAR Y PARTICIPAR (FLUJO AMPLIADO) ───
  const [editingSession, setEditingSession] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', date: '', modality: 'Presencial', spots: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [joiningSessionId, setJoiningSessionId] = useState(null)

  // Cargar sesiones guardadas desde PostgreSQL al montar el componente
  useEffect(() => {
    api.get('/sessions/')
      .then((res) => {
        if (Array.isArray(res.data)) setSessions(res.data)
      })
      .catch((err) => console.warn('No se pudieron cargar las sesiones:', err))
  }, [])

  // Guarda la nueva sesión en la BD vía POST /sessions/
  const handleSaveSession = async (e) => {
    e.preventDefault()
    setSessionError('')

    if (!sessionForm.name.trim() || !sessionForm.date || !sessionForm.modality || !sessionForm.spots) {
      setSessionError('Por favor completa todos los campos.')
      return
    }
    if (parseInt(sessionForm.spots) < 1) {
      setSessionError('Los cupos deben ser al menos 1.')
      return
    }

    setSessionSaving(true)
    try {
      const res = await api.post('/sessions/', {
        name: sessionForm.name.trim(),
        date: sessionForm.date,
        modality: sessionForm.modality,
        spots: parseInt(sessionForm.spots),
      })
      setSessions((prev) => [res.data, ...prev])
      setSessionForm({ name: '', date: '', modality: 'Presencial', spots: '' })
      setShowSessionForm(false)
      setToastMessage({
        type: 'success',
        text: `Sesión "${res.data.name}" creada con inscripciones abiertas.`
      })
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al guardar la sesión.'
      setSessionError(msg)
    } finally {
      setSessionSaving(false)
    }
  }

  // 1. EDITAR: Abrir modal y enviar actualización PUT /sessions/{id}
  const openEditModal = (session) => {
    setEditingSession(session)
    setEditForm({
      name: session.name,
      date: session.date,
      modality: session.modality,
      spots: session.spots,
      status: session.status || 'abierta',
    })
  }

  const handleUpdateSession = async (e) => {
    e.preventDefault()
    if (!editingSession) return
    setEditSaving(true)
    try {
      const res = await api.put(`/sessions/${editingSession.id}`, {
        name: editForm.name.trim(),
        date: editForm.date,
        modality: editForm.modality,
        spots: parseInt(editForm.spots),
        status: editForm.status,
      })
      setSessions((prev) => prev.map((s) => (s.id === editingSession.id ? res.data : s)))
      setEditingSession(null)
      setToastMessage({
        type: 'success',
        text: `Sesión "${res.data.name}" actualizada con éxito (${res.data.status === 'abierta' ? 'Inscripciones abiertas' : 'Inscripciones cerradas'}).`
      })
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al actualizar la sesión.'
      setToastMessage({ type: 'error', text: `⚠️ ${msg}` })
      setTimeout(() => setToastMessage(null), 4500)
    } finally {
      setEditSaving(false)
    }
  }

  // 2. ELIMINAR: Con confirmación previa vía DELETE /sessions/{id}
  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return
    setDeletingId(sessionToDelete.id)
    try {
      await api.delete(`/sessions/${sessionToDelete.id}`)
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id))
      setToastMessage({
        type: 'success',
        text: `Sesión "${sessionToDelete.name}" eliminada de la base de datos.`
      })
      setTimeout(() => setToastMessage(null), 4000)
      setSessionToDelete(null)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al eliminar la sesión.'
      setToastMessage({ type: 'error', text: `⚠️ ${msg}` })
      setTimeout(() => setToastMessage(null), 4500)
    } finally {
      setDeletingId(null)
    }
  }

  // 3. RESTRICCIÓN SEGÚN ESTADO: Inscribirse a una sesión
  const handleJoinSession = async (session) => {
    if (session.status === 'cerrada') {
      setToastMessage({
        type: 'error',
        text: '⛔ Restricción StudyMatch: Una sesión cerrada no acepta nuevos participantes.'
      })
      setTimeout(() => setToastMessage(null), 4500)
      return
    }

    setJoiningSessionId(session.id)
    try {
      const res = await api.post(`/sessions/${session.id}/join`)
      setSessions((prev) => prev.map((s) => (s.id === session.id ? res.data : s)))
      setToastMessage({
        type: 'success',
        text: `🎉 ¡Te has inscrito a "${session.name}"! Cupo reservado y persistido en la BD.`
      })
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al unirte a la sesión.'
      setToastMessage({ type: 'error', text: `⚠️ ${msg}` })
      setTimeout(() => setToastMessage(null), 4500)
    } finally {
      setJoiningSessionId(null)
    }
  }

  // Acción: Cerrar inscripciones (Transición abierta -> cerrada)
  const handleCloseRegistration = async (sessionId, sessionName) => {
    setClosingSessionId(sessionId)
    try {
      const res = await api.patch(`/sessions/${sessionId}/close`)
      // Actualización reactiva del estado local
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? res.data : s))
      )
      setToastMessage({
        type: 'success',
        text: `Inscripciones cerradas para "${sessionName}". El cambio quedó guardado en la base de datos.`
      })
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al cerrar las inscripciones.'
      setToastMessage({
        type: 'error',
        text: `⚠️ ${msg}`
      })
      setTimeout(() => setToastMessage(null), 4500)
    } finally {
      setClosingSessionId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = user?.first_name || user?.full_name?.split(' ')[0] || 'Estudiante'
  const studentInitials = useMemo(() => getStudentInitials(user), [user])

  const modalityColor = (m) => {
    if (m === 'Virtual')  return 'modality-virtual'
    if (m === 'Híbrida')  return 'modality-hibrida'
    return 'modality-presencial'
  }

  return (
    <div className="dashboard-page">
      {/* Mobile Top Header */}
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

      {/* Desktop / Tablet Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-container">
            <img src="/logo.png" alt="StudyMatch" className="sidebar-logo" />
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-item active">🏠 <span>Dashboard</span></Link>
          <a href="#sesiones" className="sidebar-item">📅 <span>Mis sesiones ({sessions.length})</span></a>
          <Link to="/profile" className="sidebar-item">👤 <span>Mi perfil</span></Link>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => setShowLogoutConfirm(true)}>
            <LogoutIcon /> <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Toast Notificación de Cambio de Estado */}
        {toastMessage && (
          <div className={`session-toast toast-${toastMessage.type}`} role="alert">
            <span className="toast-icon">
              {toastMessage.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="toast-text">{toastMessage.text}</span>
            <button
              className="toast-close"
              onClick={() => setToastMessage(null)}
              aria-label="Cerrar notificación"
            >✕</button>
          </div>
        )}

        {/* Desktop Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="welcome-title">
              ¡Hola, <span className="user-name">{displayName}</span>! 👋
            </h1>
            <p className="welcome-sub">
              Sesiones de estudio · StudyMatch
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
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-label">Total Sesiones</div>
          </div>
          <div className="stat-card">
            <div className="stat-value stat-open">
              {sessions.filter(s => s.status !== 'cerrada').length}
            </div>
            <div className="stat-label">Inscripción Abierta</div>
          </div>
          <div className="stat-card">
            <div className="stat-value stat-closed">
              {sessions.filter(s => s.status === 'cerrada').length}
            </div>
            <div className="stat-label">Inscripciones Cerradas</div>
          </div>
        </div>

        {/* ── SECCIÓN SESIONES ── */}
        <section id="sesiones" className="sessions-section">
          <div className="sessions-header-bar">
            <div>
              <h2 className="section-title">
                Sesiones de Estudio
                <span className="subjects-count-badge">{sessions.length}</span>
              </h2>
              <p className="section-subtitle">
                Crea y gestiona tus sesiones de estudio grupales
              </p>
            </div>
            <button
              id="btn-crear-sesion"
              className="btn-create-session"
              onClick={() => { setShowSessionForm(true); setSessionError('') }}
            >
              + Crear Sesión
            </button>
          </div>

          {/* Formulario modal de nueva sesión */}
          {showSessionForm && (
            <div className="session-modal-overlay" onClick={() => setShowSessionForm(false)}>
              <div className="session-modal" onClick={(e) => e.stopPropagation()}>
                <div className="session-modal-header">
                  <h3>📅 Nueva Sesión de Estudio</h3>
                  <button
                    className="session-modal-close"
                    onClick={() => setShowSessionForm(false)}
                    aria-label="Cerrar"
                  >✕</button>
                </div>

                <form className="session-form" onSubmit={handleSaveSession}>
                  <div className="session-form-group">
                    <label htmlFor="session-name">Nombre de la Sesión</label>
                    <input
                      id="session-name"
                      type="text"
                      placeholder="Ej: Repaso Vectores Capítulo 3"
                      value={sessionForm.name}
                      onChange={(e) => setSessionForm((p) => ({ ...p, name: e.target.value }))}
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="session-form-row">
                    <div className="session-form-group">
                      <label htmlFor="session-date">Fecha</label>
                      <input
                        id="session-date"
                        type="date"
                        value={sessionForm.date}
                        onChange={(e) => setSessionForm((p) => ({ ...p, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="session-form-group">
                      <label htmlFor="session-modality">Modalidad</label>
                      <select
                        id="session-modality"
                        value={sessionForm.modality}
                        onChange={(e) => setSessionForm((p) => ({ ...p, modality: e.target.value }))}
                      >
                        <option value="Presencial">Presencial</option>
                        <option value="Virtual">Virtual</option>
                        <option value="Híbrida">Híbrida</option>
                      </select>
                    </div>
                  </div>

                  <div className="session-form-group">
                    <label htmlFor="session-spots">Cupos disponibles</label>
                    <input
                      id="session-spots"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Ej: 10"
                      value={sessionForm.spots}
                      onChange={(e) => setSessionForm((p) => ({ ...p, spots: e.target.value }))}
                      required
                    />
                  </div>

                  {sessionError && (
                    <p className="session-form-error">⚠️ {sessionError}</p>
                  )}

                  <div className="session-form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowSessionForm(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-save-session"
                      disabled={sessionSaving}
                    >
                      {sessionSaving ? 'Guardando...' : '💾 Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de sesiones guardadas */}
          {sessions.length > 0 ? (
            <div className="sessions-grid">
              {sessions.map((s) => {
                const isClosed = s.status === 'cerrada'
                // Validación por correo electrónico: solo quien creó la sesión puede cerrarla
                const isCreator = Boolean(
                  user && user.email && (
                    (s.creator_email && s.creator_email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
                    (s.creator_id && Number(s.creator_id) === Number(user.id))
                  )
                )

                return (
                  <div
                    key={s.id}
                    className={`session-card ${isClosed ? 'session-card-closed' : 'session-card-open'}`}
                  >
                    <div className="session-card-header">
                      <span className={`session-modality-badge ${modalityColor(s.modality)}`}>
                        {s.modality}
                      </span>
                      <span
                        className={`session-status-badge ${isClosed ? 'status-closed' : 'status-open'}`}
                        id={`status-badge-${s.id}`}
                      >
                        {isClosed ? '🔒 Cerrada' : '🟢 Inscripción abierta'}
                      </span>
                    </div>

                    <span className="session-date">
                      📅 {new Date(s.date + 'T00:00:00').toLocaleDateString('es-BO', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </span>

                    <h3 className="session-name">{s.name}</h3>

                    {s.creator_name && (
                      <div className="session-creator-tag">
                        👤 Organizado por: <strong>{isCreator ? `${s.creator_name} (Tú)` : s.creator_name}</strong>
                      </div>
                    )}

                    <div className="session-spots">
                      👥 <strong>{s.participants_count || 0} / {s.spots}</strong> participantes
                      {isClosed && <span className="session-spots-closed-pill"> (Cupo cerrado)</span>}
                    </div>

                    {/* Acciones exclusivas del creador: Editar y Eliminar */}
                    {isCreator && (
                      <div className="session-creator-toolbar">
                        <button
                          type="button"
                          className="btn-toolbar-action btn-edit-session"
                          onClick={() => openEditModal(s)}
                          title="Editar los datos de esta sesión"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          type="button"
                          className="btn-toolbar-action btn-delete-session"
                          onClick={() => setSessionToDelete(s)}
                          title="Eliminar esta sesión de estudio"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}

                    <div className="session-card-footer">
                      {/* Restricción según su estado: Directriz StudyMatch */}
                      {isClosed ? (
                        <div className="session-status-restricted-box">
                          <button
                            type="button"
                            className="btn-join-session btn-join-disabled"
                            disabled
                            title="Directriz StudyMatch: Una sesión cerrada no acepta nuevos participantes."
                          >
                            ⛔ Inscripción cerrada
                          </button>
                          <span className="restriction-caption">Una sesión cerrada no acepta nuevos participantes</span>
                        </div>
                      ) : (
                        <div className="session-open-actions">
                          <button
                            type="button"
                            className="btn-join-session btn-join-active"
                            onClick={() => handleJoinSession(s)}
                            disabled={joiningSessionId === s.id}
                            title="Unirme a esta sesión de estudio"
                          >
                            {joiningSessionId === s.id ? '⏳ Inscribiendo...' : 'Inscribirme'}
                          </button>

                          {isCreator && (
                            <button
                              id={`btn-close-session-${s.id}`}
                              className="btn-close-registration"
                              onClick={() => handleCloseRegistration(s.id, s.name)}
                              disabled={closingSessionId === s.id}
                              title="Cerrar inscripciones para esta sesión (Solo el creador)"
                            >
                              {closingSessionId === s.id ? (
                                <>⏳ Cerrando...</>
                              ) : (
                                <>🔒 Cerrar inscripciones</>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="no-sessions-placeholder">
              <span className="no-sessions-icon">📭</span>
              <h3>No hay sesiones aún</h3>
              <p>Crea tu primera sesión con el botón <strong>"+ Crear Sesión"</strong></p>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <a href="#" className="mobile-nav-item active">
          <span className="mobile-nav-icon">🏠</span>
          <span>Inicio</span>
        </a>
        <a href="#sesiones" className="mobile-nav-item">
          <span className="mobile-nav-icon">📅</span>
          <span>Sesiones</span>
        </a>
        <Link to="/profile" className="mobile-nav-item">
          <span className="mobile-nav-icon">👤</span>
          <span>Perfil</span>
        </Link>
      </nav>

      {/* Modal para Editar Sesión */}
      {editingSession && (
        <div className="modal-overlay" onClick={() => setEditingSession(null)}>
          <div className="modal edit-session-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>✏️ Editar Sesión de Estudio</h3>
              <button
                type="button"
                className="btn-modal-close-icon"
                onClick={() => setEditingSession(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateSession} className="edit-session-form">
              <div className="form-group">
                <label>Nombre de la sesión</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Ej: Repaso examen final..."
                  required
                  minLength={3}
                />
              </div>

              <div className="form-row-edit">
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Modalidad</label>
                  <select
                    value={editForm.modality}
                    onChange={(e) => setEditForm({ ...editForm, modality: e.target.value })}
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Híbrida">Híbrida</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cupos totales</label>
                  <input
                    type="number"
                    min={editingSession.participants_count || 1}
                    value={editForm.spots}
                    onChange={(e) => setEditForm({ ...editForm, spots: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group edit-status-group" style={{ marginTop: '14px' }}>
                <label>Estado de inscripción</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="edit-status-select"
                >
                  <option value="abierta">🟢 Inscripción abierta (Acepta nuevos participantes)</option>
                  <option value="cerrada">🔒 Inscripción cerrada (No acepta nuevos participantes)</option>
                </select>
                <small style={{ display: 'block', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {editForm.status === 'abierta'
                    ? '✔️ La sesión volverá a aceptar nuevos inscritos.'
                    : '⛔ La sesión quedará bloqueada para nuevos inscritos.'}
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingSession(null)}
                  disabled={editSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-confirm-edit"
                  disabled={editSaving}
                >
                  {editSaving ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Sesión */}
      {sessionToDelete && (
        <div className="modal-overlay" onClick={() => setSessionToDelete(null)}>
          <div className="modal delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>🗑️ Confirmar Eliminación</h3>
              <button
                type="button"
                className="btn-modal-close-icon"
                onClick={() => setSessionToDelete(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body-content">
              <p>¿Estás seguro de que deseas eliminar permanentemente la sesión:</p>
              <div className="delete-target-preview">
                <strong>"{sessionToDelete.name}"</strong>
              </div>
              <p className="delete-disclaimer">
                ⚠️ Esta acción borrará el registro de la base de datos y no se puede deshacer.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setSessionToDelete(null)}
                disabled={deletingId === sessionToDelete.id}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
                disabled={deletingId === sessionToDelete.id}
              >
                {deletingId === sessionToDelete.id ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

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
