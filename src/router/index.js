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

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard para rutas protegidas
router.beforeEach((to, from, next) => {
  // Actualizar título de la página
  document.title = to.meta.title || 'SIGVA'

  // Verificar autenticación
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
