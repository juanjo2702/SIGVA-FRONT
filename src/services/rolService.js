import api from './api'

const rolService = {
  /**
   * Listar roles con paginación
   */
  getRoles(params = {}) {
    return api.get('/admin/roles', { params })
  },

  /**
   * Obtener roles para select (sin paginar)
   */
  getRolesParaSelect() {
    return api.get('/admin/roles', { params: { sin_paginar: 'true' } })
  },

  /**
   * Obtener detalle de un rol
   */
  getRol(id) {
    return api.get(`/admin/roles/${id}`)
  },

  /**
   * Crear nuevo rol
   */
  crearRol(data) {
    return api.post('/admin/roles', data)
  },

  /**
   * Actualizar rol
   */
  actualizarRol(id, data) {
    return api.put(`/admin/roles/${id}`, data)
  },

  /**
   * Eliminar rol
   */
  eliminarRol(id) {
    return api.delete(`/admin/roles/${id}`)
  }
}

export default rolService
