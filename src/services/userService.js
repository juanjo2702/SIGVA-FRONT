import api from './api'

const userService = {
  /**
   * Listar usuarios con filtros y paginación
   */
  getUsuarios(params = {}) {
    return api.get('/admin/usuarios', { params })
  },

  /**
   * Obtener detalle de un usuario
   */
  getUsuario(id) {
    return api.get(`/admin/usuarios/${id}`)
  },

  /**
   * Crear nuevo usuario
   */
  crearUsuario(data) {
    return api.post('/admin/usuarios', data)
  },

  /**
   * Actualizar usuario
   */
  actualizarUsuario(id, data) {
    return api.put(`/admin/usuarios/${id}`, data)
  },

  /**
   * Desactivar usuario
   */
  desactivarUsuario(id) {
    return api.delete(`/admin/usuarios/${id}`)
  },

  /**
   * Restablecer contraseña a CI
   */
  resetPassword(id) {
    return api.post(`/admin/usuarios/${id}/reset-password`)
  },

  /**
   * Obtener permisos de un usuario
   */
  getPermissions(id) {
    return api.get(`/admin/usuarios/${id}/permissions`)
  },

  /**
   * Sincronizar permisos individuales
   */
  sincronizarPermisos(id, permissions) {
    return api.post(`/admin/usuarios/${id}/permissions`, { permissions })
  }
}

export default userService
