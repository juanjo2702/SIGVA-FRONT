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

// Interceptor para añadir token en cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para respuestas de error
let isRedirecting = false
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !isRedirecting) {
      // Solo redirigir si el usuario TENÍA un token (sesión expirada)
      // No redirigir si nunca estuvo autenticado
      const hadToken = localStorage.getItem('token')
      if (hadToken) {
        isRedirecting = true
        console.warn('API 401: Token inválido o expirado. Limpiando sesión.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Redirigir al login local de SIGVA, no al SSO
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
