import axios from 'axios'

// Detectar si estamos en producción o desarrollo
const isProduction = import.meta.env.PROD

const api = axios.create({
  baseURL: isProduction ? 'https://api.sigva.xpertiaplus.com/api' : '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para respuestas de error
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // SSO: Redirigir al login centralizado de SISPO pidiendo limpiar sesión
      window.location.href = 'https://postulacionesunitepc.xpertiaplus.com/#/login?logout=true'
    }
    return Promise.reject(error)
  }
)

export default api
