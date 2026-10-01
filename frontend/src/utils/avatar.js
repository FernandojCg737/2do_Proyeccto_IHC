/**
 * Calcula las iniciales del estudiante siguiendo el formato:
 * Inicial del Primer Apellido + Inicial del Primer Nombre.
 * Ejemplo:
 *   Nombre: Fernando Javier
 *   Apellido: Calani Garcia
 *   Resultado: CF
 */
export function getStudentInitials(user) {
  if (!user) return 'U'

  const lastNamePart = (user.last_name || '').trim().split(/\s+/)[0] || ''
  const firstNamePart = (user.first_name || '').trim().split(/\s+/)[0] || ''

  const lastInitial = lastNamePart ? lastNamePart.charAt(0).toUpperCase() : ''
  const firstInitial = firstNamePart ? firstNamePart.charAt(0).toUpperCase() : ''

  if (lastInitial && firstInitial) {
    return `${lastInitial}${firstInitial}`
  }
  if (firstInitial) return firstInitial
  if (lastInitial) return lastInitial

  if (user.full_name) {
    const parts = user.full_name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[1].charAt(0).toUpperCase()}${parts[0].charAt(0).toUpperCase()}`
    }
    return parts[0].charAt(0).toUpperCase()
  }

  return 'U'
}
