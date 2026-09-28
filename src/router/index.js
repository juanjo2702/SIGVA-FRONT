import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // =============================================
  // Portal Empleado (público)
  // =============================================
  {
    path: '/',
    component: () => import('@/layouts/EmpleadoLayout.vue'),
    children: [
      {
        path: '',
        name: 'buscar',
        component: () => import('@/pages/empleado/BuscarEmpleadoPage.vue'),
        meta: { title: 'SIGVA - Buscar Empleado' }
      },
      {
        path: 'empleado/:ci',
        name: 'informacion',
        component: () => import('@/pages/empleado/InformacionEmpleadoPage.vue'),
        meta: { title: 'SIGVA - Información del Empleado' }
      },
      {
        path: 'solicitud/:ci',
        name: 'solicitud',
        component: () => import('@/pages/empleado/SolicitudVacacionesPage.vue'),
        meta: { title: 'SIGVA - Solicitud de Vacaciones' }
      },
      {
        path: 'formulario/:id',
        name: 'formulario',
        component: () => import('@/pages/empleado/FormularioPage.vue'),
        meta: { title: 'SIGVA - Formulario de Vacaciones' }
      }
    ]
  },

  // =============================================
  // Portal Administrador RRHH
  // =============================================
  {
    path: '/admin/login',
    name: 'login',
    component: () => import('@/pages/admin/LoginPage.vue'),
    meta: { title: 'SIGVA - Iniciar Sesión' }
  },
  {
    path: '/admin/cambiar-password',
    name: 'cambiar-password',
    component: () => import('@/pages/admin/CambiarPasswordPage.vue'),
    meta: { title: 'SIGVA - Cambiar Contraseña', requiresAuth: true }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/admin/DashboardPage.vue'),
        meta: { title: 'SIGVA - Dashboard' }
      },
      {
        path: 'solicitudes',
        name: 'solicitudes',
        component: () => import('@/pages/admin/SolicitudesPage.vue'),
        meta: { title: 'SIGVA - Solicitudes' }
      },
      {
        path: 'empleados',
        name: 'empleados',
        component: () => import('@/pages/admin/EmpleadosPage.vue'),
        meta: { title: 'SIGVA - Empleados' }
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/pages/admin/ReportesPage.vue'),
        meta: { title: 'SIGVA - Reportes' }
      },
      {
        path: 'feriados',
        name: 'feriados',
        component: () => import('@/pages/admin/FeriadosPage.vue'),
        meta: { title: 'SIGVA - Feriados' }
      },
      {
        path: 'calendario',
        name: 'calendario-compartido',
        component: () => import('@/pages/admin/CalendarioCompartidoPage.vue'),
        meta: { title: 'SIGVA - Calendario de Vacaciones' }
      },
      {
        path: 'documentacion',
        name: 'documentacion',
        component: () => import('@/pages/admin/DocumentacionPage.vue'),
        meta: { title: 'SIGVA - Documentación' }
      }
    ]
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue')
  }
]

import api from '@/services/api'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard para rutas protegidas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Actualizar título de la página
  document.title = to.meta.title || 'SIGVA'

  // --- SSO: Leer token de la URL (viene del Portal SSO) ---
  // Primero intentar desde vue-router query, si no, desde window.location.search (hash mode compat)
  let urlToken = to.query.token
  let userEncoded = to.query.user
  
  if (!urlToken || !userEncoded) {
    const searchParams = new URLSearchParams(window.location.search)
    urlToken = urlToken || searchParams.get('token')
    userEncoded = userEncoded || searchParams.get('user')
  }
  
  if (urlToken && userEncoded) {
    console.log('SSO: Token detected in URL. Authenticating in SIGVA...')
    
    try {
      // Guardar token en el store y localStorage
      const tokenValue = decodeURIComponent(String(urlToken))
      authStore.setToken(tokenValue)
      localStorage.removeItem('sigva_last_401')
      localStorage.removeItem('sigva_401_count')

      let userData = null
      try {
        const base64Str = decodeURIComponent(String(userEncoded)).replace(/ /g, '+')
        const binary = atob(base64Str)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        const decodedStr = new TextDecoder().decode(bytes)
        userData = JSON.parse(decodedStr)
      } catch {
        const fallbackStr = decodeURIComponent(escape(atob(decodeURIComponent(String(userEncoded)).replace(/ /g, '+'))))
        userData = JSON.parse(fallbackStr)
      }
      
      // === VERIFICACIÓN Y NORMALIZACIÓN PARA SIGVA (STRICT RBAC) ===
      const accessMetadata = userData.access_metadata || {}
      const sigvaAccess = accessMetadata['sigva'] || accessMetadata['SIGVA'] || null
      
      const isGlobalAdmin = !!userData.is_global_admin || (userData.roles || []).some(r => {
        const sysId = Number(r?.sistema_id ?? 0)
        const rName = String(r?.nombres || r?.name || r?.nombre || '').toUpperCase()
        return sysId === 1 && ['ADMINISTRADOR', 'ADMIN', 'SUPER ADMIN', 'SUPERADMIN', 'DIRECTOR (ENCARGADO)'].includes(rName)
      })

      const sigvaRole = (userData.roles || []).find(r => Number(r?.sistema_id) === 3)
      const hasSigvaAccess = isGlobalAdmin || !!sigvaRole || (sigvaAccess && ((sigvaAccess.roles && sigvaAccess.roles.length > 0) || (sigvaAccess.permissions && sigvaAccess.permissions.length > 0)))

      if (!hasSigvaAccess) {
        console.warn('SSO: Usuario no tiene permisos para acceder a SIGVA')
        alert('Acceso no autorizado: No tienes permisos para acceder al sistema SIGVA.')
        authStore.logout()
        const ssoUrl = import.meta.env.VITE_SSO_FRONT_URL || 'http://localhost:9000'
        window.location.href = ssoUrl
        return next(false)
      }
      
      userData.permisos = sigvaAccess?.permissions || []
      
      let assignedRole = 'Usuario'
      if (isGlobalAdmin) {
        assignedRole = 'Administrador'
      } else if (sigvaAccess && sigvaAccess.roles && sigvaAccess.roles.length > 0) {
        assignedRole = sigvaAccess.roles[0]
      } else if (sigvaRole) {
        assignedRole = sigvaRole.nombres || sigvaRole.name || sigvaRole.nombre || 'RRHH'
      }
      userData.rol = { name: assignedRole, nombre: assignedRole }
      
      if (userData.persona) {
        userData.nombres = userData.persona.nombres
        const ap1 = userData.persona.apellido_paterno || userData.persona.primer_apellido || ''
        const ap2 = userData.persona.apellido_materno || userData.persona.segundo_apellido || ''
        userData.apellidos = `${ap1} ${ap2}`.trim()
      } else if (userData.name && !userData.nombres) {
        userData.nombres = userData.name
      }
      
      authStore.setUser(userData)
      
      console.log('SSO: Authentication successful and normalized. Redirecting to dashboard...')

      // Limpiar la URL del navegador para quitar el token visible
      window.history.replaceState({}, '', '/admin/dashboard')
      return next({ path: '/admin/dashboard', replace: true })
    } catch (e) {
      console.error('SSO: Token verification failed', e)
      authStore.logout()
      return next({ path: '/admin/login', query: {}, replace: true })
    }
  }

  // Verificar autenticación
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log('Not authenticated, redirecting to Central SSO')
      const ssoLoginUrl = `${import.meta.env.VITE_SSO_FRONT_URL}/login`
      const returnToUrl = encodeURIComponent(`${window.location.origin}/admin/dashboard`)
      window.location.href = `${ssoLoginUrl}?returnTo=${returnToUrl}`
      return next(false)
    }

    // Verificar autorización activa para SIGVA
    const currentUser = authStore.user
    if (currentUser) {
      const cMeta = currentUser.access_metadata || {}
      const cSigva = cMeta['sigva'] || cMeta['SIGVA']
      const cIsGlobal = !!currentUser.is_global_admin || (currentUser.roles || []).some(r => {
        const sysId = Number(r?.sistema_id ?? 0)
        const rName = String(r?.nombres || r?.name || r?.nombre || '').toUpperCase()
        return sysId === 1 && ['ADMINISTRADOR', 'ADMIN', 'SUPER ADMIN', 'SUPERADMIN', 'DIRECTOR (ENCARGADO)'].includes(rName)
      })
      const cHasRole = (currentUser.roles || []).some(r => Number(r?.sistema_id) === 3)
      const cAllowed = cIsGlobal || cHasRole || (cSigva && ((cSigva.roles && cSigva.roles.length > 0) || (cSigva.permissions && cSigva.permissions.length > 0)))

      if (!cAllowed) {
        alert('Acceso no autorizado: No tienes permisos para acceder al sistema SIGVA.')
        authStore.logout()
        const ssoUrl = import.meta.env.VITE_SSO_FRONT_URL || 'http://localhost:9000'
        window.location.href = ssoUrl
        return next(false)
      }
    }
  }

  next()
})

export default router
