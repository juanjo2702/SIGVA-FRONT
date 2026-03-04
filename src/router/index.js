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

  // --- SSO: Leer token de la URL (viene de SISPO) ---
  const urlToken = to.query.token
  if (urlToken) {
    console.log('SSO: Token detected in URL. Authenticating...')
    
    // Guardar token en el store y localStorage
    authStore.token = urlToken
    localStorage.setItem('token', urlToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`

    // Obtener datos del usuario con el token
    try {
      const response = await api.get('/me')
      if (response.data?.data) {
        authStore.user = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
      
      // Limpiar URL y continuar
      const cleanQuery = { ...to.query }
      delete cleanQuery.token
      return next({ path: to.path, query: cleanQuery, replace: true })
    } catch (e) {
      console.error('SSO: Token verification failed', e)
      authStore.logout()
      return next({ name: 'login' })
    }
  }

  // Verificar autenticación
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log('Not authenticated, redirecting to SISPO Login')
      const sispoLoginUrl = 'https://postulacionesunitepc.xpertiaplus.com/#/login'
      window.location.href = sispoLoginUrl
      return
    }
  }

  next()
})

export default router
