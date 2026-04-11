import axios from 'axios'

// Detectar si estamos en producción o desarrollo
const isProduction = import.meta.env.PROD

const api = axios.create({
  baseURL: import.meta.env.PROD ? `${import.meta.env.VITE_SIGVA_BACK_URL}/api` : '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para añadir token en cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sigva_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para respuestas de error
let isRedirecting = false
const resetAuthLoopGuard = () => {
  isRedirecting = false
  localStorage.removeItem('sigva_last_401')
  localStorage.removeItem('sigva_401_count')
}

api.interceptors.response.use(
  response => {
    if (localStorage.getItem('sigva_token')) {
      resetAuthLoopGuard()
    }

    return response
  },
  error => {
    if (error.response?.status === 401 && !isRedirecting) {
      // Solo redirigir si el usuario TENÍA un token (sesión expirada)
      // No redirigir si nunca estuvo autenticado (portal empleado público)
      const hadToken = localStorage.getItem('sigva_token')
      if (hadToken) {
        // --- GUARDRAIL: Evitar bucle infinito de redirección 401 ---
        const now = Date.now()
        const lastRedirect = parseInt(localStorage.getItem('sigva_last_401') || '0')
        const redirectCount = parseInt(localStorage.getItem('sigva_401_count') || '0')
        
        if (now - lastRedirect < 10000 && redirectCount >= 3) {
            console.error('API 401: Detectado bucle de redirección. Deteniendo para evitar crasheo.')
            isRedirecting = true // Bloquear más intentos
            alert('Error crítico de autenticación: Se ha detectado un bucle. Por favor, limpia la caché del navegador y vuelve a intentar.')
            return Promise.reject(error)
        }

        localStorage.setItem('sigva_last_401', now.toString())
        localStorage.setItem('sigva_401_count', (redirectCount + 1).toString())

        isRedirecting = true
        console.warn('API 401: Token inválido o expirado en SIGVA. Limpiando y redirigiendo.')
        localStorage.removeItem('sigva_token')
        localStorage.removeItem('sigva_user')
        // Redirigir al login de SIGVA (que a su vez redirige al SSO central)
        window.location.href = '/admin/login?force=true'
      }
    }
    return Promise.reject(error)
  }
)

export default api
