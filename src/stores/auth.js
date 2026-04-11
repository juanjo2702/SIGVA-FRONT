import { defineStore } from 'pinia'
import api from '@/services/api'

const LAST_ACTIVITY_KEY = 'sigva_last_activity'
const LOGOUT_BROADCAST_KEY = 'sigva_logout_broadcast'
const SHARED_ASSET_URL = String(import.meta.env.VITE_SHARED_ASSET_URL || '').replace(/\/+$/, '')

const resolveSharedAssetBase = () => {
  if (SHARED_ASSET_URL) return SHARED_ASSET_URL

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}`
  }

  return ''
}

const normalizePhotoUrl = (photo) => {
  if (!photo) return null

  if (String(photo).startsWith('http://') || String(photo).startsWith('https://')) {
    return photo
  }

  if (String(photo).startsWith('/')) {
    return `${resolveSharedAssetBase()}${photo}`
  }

  return `${resolveSharedAssetBase()}/${String(photo).replace(/^\/+/, '')}`
}

const normalizePersona = (persona) => {
  if (!persona) return null

  return {
    ...persona,
    apellido_paterno: persona.apellido_paterno || persona.primer_apellido || null,
    apellido_materno: persona.apellido_materno || persona.segundo_apellido || null,
    foto_url: normalizePhotoUrl(persona.foto_url || persona.foto || null),
  }
}

const resolveRoleBySystem = (user, targetSystemId) => {
  const matchingRole = (user?.roles || []).find((role) =>
    (role?.permissions || []).some((permission) => Number(permission?.sistema_id) === targetSystemId)
  )

  if (!matchingRole) return null

  return {
    name: matchingRole.name || matchingRole.nombre || 'Usuario',
    nombre: matchingRole.nombre || matchingRole.name || 'Usuario'
  }
}

const buildFullName = (user) => {
  if (!user) return 'Usuario'

  const persona = normalizePersona(user.persona)
  const personaFullName = [
    persona?.nombres,
    persona?.apellido_paterno,
    persona?.apellido_materno,
  ].filter(Boolean).join(' ').trim()

  if (personaFullName.split(' ').filter(Boolean).length >= 2) {
    return personaFullName
  }

  const userFullName = [
    user.nombres,
    user.apellido_paterno,
    user.apellido_materno,
  ].filter(Boolean).join(' ').trim()

  return userFullName || user.nombre_completo || `${user.nombres || ''} ${user.apellidos || ''}`.trim() || user.name || user.username || 'Usuario'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('sigva_user') || 'null'),
    token: localStorage.getItem('sigva_token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => buildFullName(state.user),
    userPhoto: (state) => normalizePhotoUrl(
      state.user?.persona?.foto_url
      || state.user?.persona?.foto
      || state.user?.foto_url
      || state.user?.foto
      || null
    ),
    userRole: (state) => {
      const user = state.user
      if (!user) return 'Usuario'

      if (user.rol?.name || user.rol?.nombre) return user.rol.name || user.rol.nombre

      const accessMetadata = user.access_metadata || {}
      const sigvaAccess = accessMetadata.sigva || accessMetadata.SIGVA
      if (sigvaAccess && sigvaAccess.roles?.length > 0) return sigvaAccess.roles[0]

      const systemRole = resolveRoleBySystem(user, 3)
      if (systemRole) return systemRole.nombre || systemRole.name

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
          this.setUser(response.data.data.user)

          localStorage.setItem('sigva_token', this.token)
          api.defaults.headers.common.Authorization = `Bearer ${this.token}`

          return {
            success: true,
            mustChangePassword: response.data.data.must_change_password
          }
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al iniciar sesion'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch (error) {
        console.error('Error al cerrar sesion:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('sigva_token')
        localStorage.removeItem('sigva_user')
        delete api.defaults.headers.common.Authorization
      }
    },

    async initializeAuth() {
      if (!this.token) return

      api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      try {
        const response = await api.get('/me')
        const payload = response.data?.data || response.data?.user || response.data
        if (payload) {
          this.setUser(payload)
        }
      } catch (error) {
        console.warn('No se pudo refrescar el usuario actual de SIGVA, se mantiene la sesion local.', error?.message || error)
      }
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('sigva_token', token)
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
      localStorage.removeItem(LOGOUT_BROADCAST_KEY)
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    setUser(user) {
      if (!user) {
        this.user = null
        localStorage.removeItem('sigva_user')
        return
      }

      const accessMetadata = user.access_metadata || {}
      const sigvaAccess = accessMetadata.sigva || accessMetadata.SIGVA || { roles: [], permissions: [] }

      user.permisos = Array.from(new Set([
        ...(user.permisos || []),
        ...(sigvaAccess.permissions || [])
      ]))

      if (sigvaAccess.roles?.length > 0) {
        user.rol = { name: sigvaAccess.roles[0], nombre: sigvaAccess.roles[0], ...user.rol }
      } else {
        const systemRole = resolveRoleBySystem(user, 3)
        if (systemRole) {
          user.rol = { ...systemRole, ...user.rol }
        }
      }

      const normalizedPersona = normalizePersona(user.persona)

      if (normalizedPersona) {
        user.persona = normalizedPersona
        user.nombres = normalizedPersona.nombres || user.nombres
        user.apellido_paterno = normalizedPersona.apellido_paterno || user.apellido_paterno || user.primer_apellido
        user.apellido_materno = normalizedPersona.apellido_materno || user.apellido_materno || user.segundo_apellido
        user.apellidos = [user.apellido_paterno, user.apellido_materno].filter(Boolean).join(' ')
      }

      this.user = user
      localStorage.setItem('sigva_user', JSON.stringify(user))
    }
  }
})
