import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('sigva_user') || 'null'),
    token: localStorage.getItem('sigva_token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => {
      const user = state.user
      if (!user) return 'Usuario'
      
      // Intentar extraer de persona (SSO Global)
      if (user.persona) {
        return `${user.persona.nombres || ''} ${user.persona.apellido_paterno || ''}`.trim() || user.username
      }
      
      return user.nombre_completo || user.nombres || user.name || user.username || 'Usuario'
    },
    userRole: (state) => {
      const user = state.user
      if (!user) return 'Usuario'
      
      // Preferir el rol ya mapeado o buscar en rol objeto (estilo local)
      if (user.rol?.name || user.rol?.nombre) return user.rol.name || user.rol.nombre
      
      // Buscar en access_metadata (SSO Global)
      const accessMetadata = user.access_metadata || {}
      const sigvaAccess = accessMetadata['sigva'] || accessMetadata['SIGVA']
      if (sigvaAccess && sigvaAccess.roles?.length > 0) return sigvaAccess.roles[0]
      
      return 'Administrador'
    },
    mustChangePassword: (state) => state.user?.must_change_password || false
  },

  actions: {
    async login(ci, password) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/login', { ci, password })
        
        if (response.data.success) {
          this.token = response.data.data.token
          this.user = response.data.data.user

          localStorage.setItem('sigva_token', this.token)
          localStorage.setItem('sigva_user', JSON.stringify(this.user))

          // Configurar token en API
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

          // Retornar si debe cambiar contraseña
          return { 
            success: true, 
            mustChangePassword: response.data.data.must_change_password 
          }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al iniciar sesión'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('sigva_token')
        localStorage.removeItem('sigva_user')
        delete api.defaults.headers.common['Authorization']
      }
    },

    initializeAuth() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('sigva_token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    setUser(user) {
      if (!user) {
        this.user = null
        localStorage.removeItem('sigva_user')
        return
      }

      // === NORMALIZACIÓN COMPLETA PARA SIGVA ===
      const accessMetadata = user.access_metadata || {}
      const sigvaAccess = accessMetadata['sigva'] || accessMetadata['SIGVA'] || { roles: [], permissions: [] }
      
      // Inyectar o asegurar campos que SIGVA usa persistentemente
      user.permisos = Array.from(new Set([
          ...(user.permisos || []),
          ...(sigvaAccess.permissions || [])
      ]))
      
      if (sigvaAccess.roles?.length > 0) {
          user.rol = { name: sigvaAccess.roles[0], ...user.rol }
      }

      this.user = user
      localStorage.setItem('sigva_user', JSON.stringify(user))
    }
  }
})
