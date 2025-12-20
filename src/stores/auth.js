import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || 'Usuario',
    mustChangePassword: (state) => state.user?.must_change_password || false
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/login', { email, password })
        
        if (response.data.success) {
          this.token = response.data.data.token
          this.user = response.data.data.user

          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))

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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
      }
    },

    initializeAuth() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    }
  }
})
