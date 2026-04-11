import api from './api'

export const empleadoService = {
  // Buscar empleado por CI y Fecha de Ingreso (público)
  async buscarEmpleado(ci, fechaIngreso) {
    const response = await api.post('/empleados/buscar', {
      ci,
      fecha_ingreso: fechaIngreso
    })
    return response.data
  },

  // Crear solicitud de vacaciones (público)
  async crearSolicitud(data) {
    const response = await api.post('/solicitudes', data)
    return response.data
  },

  // Crear solicitud con días individuales (nuevo formato con calendario)
  async crearSolicitudConDias(data) {
    const response = await api.post('/solicitudes/con-dias', data)
    return response.data
  },

  // Obtener datos para formulario
  async getFormularioData(solicitudId) {
    const response = await api.get(`/solicitudes/${solicitudId}/formulario`)
    return response.data
  },

  // Calcular días hábiles
  async calcularDias(fechaInicio, fechaFin, tipo) {
    const response = await api.post('/calcular-dias', {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      tipo
    })
    return response.data
  },

  // Subir respaldo para una solicitud existente
  async subirRespaldo(solicitudId, formData) {
    const response = await api.post(`/solicitudes/${solicitudId}/respaldo`, formData)
    return response.data
  }
}

export default empleadoService
