import axios from 'axios'

const BACK_URL = String(import.meta.env.VITE_SIGVA_BACK_URL || '').replace(/\/+$/, '')
const API_BASE = import.meta.env.VITE_API_BASE || `${BACK_URL}/api`
const SSO_FRONT_URL = String(import.meta.env.VITE_SSO_FRONT_URL || 'http://127.0.0.1:9000').replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sigva_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
      const hadToken = localStorage.getItem('sigva_token')

      if (hadToken) {
        const now = Date.now()
        const lastRedirect = parseInt(localStorage.getItem('sigva_last_401') || '0')
        const redirectCount = parseInt(localStorage.getItem('sigva_401_count') || '0')

        if (now - lastRedirect < 10000 && redirectCount >= 3) {
          console.error('API 401: Detectado bucle de redireccion. Deteniendo para evitar crasheo.')
          isRedirecting = true
          alert('Error critico de autenticacion: Se ha detectado un bucle. Por favor, limpia la cache del navegador y vuelve a intentar.')
          return Promise.reject(error)
        }

        localStorage.setItem('sigva_last_401', now.toString())
        localStorage.setItem('sigva_401_count', (redirectCount + 1).toString())

        isRedirecting = true
        console.warn('API 401: Token invalido o expirado en SIGVA. Limpiando y redirigiendo.')
        localStorage.removeItem('sigva_token')
        localStorage.removeItem('sigva_user')
        window.location.href = `${SSO_FRONT_URL}/login?force=true`
      }
    }

    return Promise.reject(error)
  }
)

export default api
