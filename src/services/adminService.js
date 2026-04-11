import api from './api'

export const adminService = {
  // =============================================
  // Empleados
  // =============================================
  async getEmpleados(params = {}) {
    const response = await api.get('/admin/empleados', { params })
    return response.data
  },

  async getEmpleado(id) {
    const response = await api.get(`/admin/empleados/${id}`)
    return response.data
  },

  async crearEmpleado(data) {
    const response = await api.post('/admin/empleados', data)
    return response.data
  },

  async actualizarEmpleado(id, data) {
    const response = await api.put(`/admin/empleados/${id}`, data)
    return response.data
  },

  async eliminarEmpleado(id) {
    const response = await api.delete(`/admin/empleados/${id}`)
    return response.data
  },

  async ajustarSaldo(id, nuevoSaldo, descripcion) {
    const response = await api.post(`/admin/empleados/${id}/ajustar-saldo`, {
      nuevo_saldo: nuevoSaldo,
      descripcion
    })
    return response.data
  },

  async importarEmpleados(file, sedeId) {
    const formData = new FormData()
    formData.append('archivo', file)
    if (sedeId !== null && sedeId !== undefined && sedeId !== '') {
      formData.append('sede_id', sedeId)
    }
    
    const response = await api.post('/admin/empleados/importar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async getEstadisticasEmpleados() {
    const response = await api.get('/admin/empleados/estadisticas')
    return response.data
  },

  async descargarPlantillaEmpleados() {
    const response = await api.get('/admin/empleados/plantilla', {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'plantilla_empleados.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // =============================================
  // Solicitudes
  // =============================================
  async getSolicitudes(params = {}) {
    const response = await api.get('/admin/solicitudes', { params })
    return response.data
  },

  async getSolicitud(id) {
    const response = await api.get(`/admin/solicitudes/${id}`)
    return response.data
  },

  async aprobarSolicitud(id) {
    const response = await api.put(`/admin/solicitudes/${id}/aprobar`)
    return response.data
  },

  async rechazarSolicitud(id, motivo) {
    const response = await api.put(`/admin/solicitudes/${id}/rechazar`, { motivo })
    return response.data
  },

  async confirmarDocumento(id) {
    const response = await api.put(`/admin/solicitudes/${id}/confirmar-documento`)
    return response.data
  },

  async cancelarSolicitud(id, motivo) {
    const response = await api.put(`/admin/solicitudes/${id}/cancelar`, { motivo })
    return response.data
  },

  async getFormularioData(id) {
    const response = await api.get(`/admin/solicitudes/${id}/formulario-pdf`)
    return response.data
  },

  async getEstadisticasSolicitudes(ano = null) {
    const params = ano ? { ano } : {}
    const response = await api.get('/admin/solicitudes/estadisticas', { params })
    return response.data
  },

  async programarVacaciones(data) {
    const response = await api.post('/admin/solicitudes/programar', data)
    return response.data
  },

  async actualizarSolicitud(id, data) {
    const response = await api.put(`/admin/solicitudes/${id}`, data)
    return response.data
  },

  async getVacacionesCalendario(params = {}) {
    const response = await api.get('/admin/vacaciones-calendario', { params })
    return response.data
  },

  async subirRespaldo(id, file) {
    const formData = new FormData()
    formData.append('archivo', file)
    const response = await api.post(`/admin/solicitudes/${id}/archivo-respaldo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async eliminarRespaldo(id) {
    const response = await api.delete(`/admin/solicitudes/${id}/archivo-respaldo`)
    return response.data
  },

  // =============================================
  // Reportes
  // =============================================
  async getReporteSaldos(params = {}) {
    const response = await api.get('/admin/reportes/saldos', { params })
    return response.data
  },

  async getReporteSolicitudes(params = {}) {
    const response = await api.get('/admin/reportes/solicitudes', { params })
    return response.data
  },

  async getHistorialEmpleado(empleadoId) {
    const response = await api.get(`/admin/reportes/historial/${empleadoId}`)
    return response.data
  },

  async descargarEmpleados(params = {}) {
    const response = await api.get('/admin/reportes/exportar/empleados', {
      params,
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    let filename = `REPORTE_VACACIONES_SALDOS.xlsx`
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '')
    }

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async descargarSolicitudes(params = {}) {
    const response = await api.get('/admin/reportes/exportar/solicitudes', {
      params,
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))

    let filename = `REPORTE_VACACIONES_SOLICITUDES.xlsx`
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '')
    }

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  getExportarReporteGeneralUrl(params = {}) {
    const query = new URLSearchParams(params).toString()
    return `/api/admin/reportes/exportar/general${query ? '?' + query : ''}`
  },

  async descargarReporteGeneral(params = {}) {
    const response = await api.get('/admin/reportes/exportar/general', {
      params,
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    let filename = `PLAN_NACIONAL_VACACIONES.xlsx`
    
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '')
    }

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // =============================================
  // Sedes
  // =============================================
  async getSedes(params = {}) {
    const response = await api.get('/admin/sedes', { params })
    return response.data
  },

  async getSede(id) {
    const response = await api.get(`/admin/sedes/${id}`)
    return response.data
  },

  async crearSede(data) {
    const response = await api.post('/admin/sedes', data)
    return response.data
  },

  async actualizarSede(id, data) {
    const response = await api.put(`/admin/sedes/${id}`, data)
    return response.data
  },

  async eliminarSede(id) {
    const response = await api.delete(`/admin/sedes/${id}`)
    return response.data
  },

  // =============================================
  // Feriados
  // =============================================
  async getFeriados(params = {}) {
    const response = await api.get('/admin/feriados', { params })
    return response.data
  },



  async getFeriado(id) {
    const response = await api.get(`/admin/feriados/${id}`)
    return response.data
  },

  async crearFeriado(data) {
    const response = await api.post('/admin/feriados', data)
    return response.data
  },

  async actualizarFeriado(id, data) {
    const response = await api.put(`/admin/feriados/${id}`, data)
    return response.data
  },

  async eliminarFeriado(id) {
    const response = await api.delete(`/admin/feriados/${id}`)
    return response.data
  },

  async previewAfectadosFeriado(id) {
    const response = await api.get(`/admin/feriados/${id}/preview-afectados`)
    return response.data
  },

  async procesarDevolucionesFeriado(id) {
    const response = await api.post(`/admin/feriados/${id}/procesar-devoluciones`)
    return response.data
  }
}

export default adminService


