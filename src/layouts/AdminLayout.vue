<template>
  <q-layout view="lHh LpR lFf">
    <!-- HEADER -->
    <q-header class="bg-gradient-to-r from-primary to-secondary text-white" height-hint="60">
      <q-toolbar class="h-16 px-6">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="mr-4"
        />

        <q-toolbar-title
          class="flex items-center gap-4 cursor-pointer"
          @click="$router.push('/admin/dashboard')"
        >
          <div class="flex flex-col leading-tight ml-2">
            <span class="font-bold text-lg tracking-wide uppercase">Vacaciones</span>
            <span class="text-[10px] opacity-90 font-light tracking-widest"
              >Universidad Técnica Privada Cosmos</span
            >
          </div>
        </q-toolbar-title>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col items-end mr-2">
            <span class="text-sm font-bold">{{ today }}</span>
            <span class="text-xs opacity-80">Cochabamba, Bolivia</span>
          </div>

          <!-- Public Portal Button in Header -->
          <q-btn
            flat
            round
            dense
            icon="public"
            @click="window.location.href = '/'"
            class="bg-white/10 hover:bg-white/20 transition-all"
          >
            <q-tooltip class="bg-black/80 text-white">Ver Portal Empleado</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR (Drawer) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="260"
      bordered
      class="bg-white"
    >
      <div class="column no-wrap h-full">
        <!-- Brand Area - CLEAN STYLE -->
        <div class="p-6 flex flex-col gap-1">
          <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
             <img src="@/assets/logo_unitepc.png" class="h-10" alt="UNITEPC" />
          </div>
          <div class="text-sm text-gray-400">Sistema de Gestión de Vacaciones</div>
        </div>

        <!-- Menu items -->
        <div class="col px-4 space-y-2 overflow-y-auto mt-2">
          <!-- Back to Public Button -->
          <div
            @click="window.location.href = '/'"
            class="flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer mb-6 bg-gray-50 hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white border border-gray-100 group"
          >
            <q-icon name="public" size="22px" class="text-gray-600 group-hover:text-white group-hover:scale-110 transition-all" />
            <span class="font-bold text-gray-700 group-hover:text-white">Ver Portal Empleado</span>
          </div>



          <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4 mb-2">Menú Principal (SIGVA)</div>

          <!-- Admin Routes -->
          <div
            v-for="item in menuItems"
            :key="item.to"
            @click="setAdminSection(item.to)"
            :class="[
              'flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer mb-1 group',
              route.path === item.to
                ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md scale-[1.02]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary font-medium hover:translate-x-1',
            ]"
          >
            <q-icon :name="item.icon" size="22px" :class="route.path === item.to ? 'text-white' : 'text-gray-400 group-hover:text-primary'" />
            <span>{{ item.label }}</span>
          </div>
        </div>

    <!-- Footer - SIMPLE STYLE -->
        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <div class="row items-center no-wrap gap-3 mb-4">
            <q-avatar
              size="34px"
              class="shadow-sm border border-primary/20 shrink-0"
              color="primary"
              text-color="white"
            >
              <q-img v-if="userPhoto" :src="userPhoto" />
              <span v-else>{{ userName?.[0] || 'A' }}</span>
            </q-avatar>
            <div class="column leading-tight overflow-hidden">
              <div class="font-bold text-gray-900 text-[11px] uppercase truncate">
                {{ userName }}
              </div>
              <div class="text-[10px] text-gray-500 truncate">
                {{ userRole }}
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              @click="volverAlPortal"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white hover:border-transparent transition-all group"
            >
              <q-icon name="home" size="18px" class="group-hover:scale-110 transition-all" />
              <span class="font-bold text-sm">Volver al Portal</span>
            </button>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="sessionTimeoutState.warningVisible" persistent>
      <q-card style="width: 440px; max-width: 92vw; border-radius: 20px;">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="row items-center no-wrap">
            <q-icon name="schedule" size="md" class="q-mr-md" />
            <div class="column">
              <div class="text-h6 text-weight-bold">Sesión por expirar</div>
              <div class="text-caption opacity-80">Detectamos inactividad. Puedes continuar o cerrar tu sesión.</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="text-body1 text-grey-8 q-mb-md">
            Tu sesión se cerrará en
            <span class="text-primary text-weight-bolder">{{ sessionTimeoutState.countdownSeconds }}</span>
            segundos.
          </div>
          <div class="text-caption text-grey-6">
            Si sigues trabajando, presiona <strong>Seguir en línea</strong>.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-xl q-pb-xl q-gutter-sm">
          <q-btn flat no-caps color="negative" label="Cerrar sesión ahora" @click="handleSessionLogoutNow" />
          <q-btn no-caps color="primary" unelevated label="Seguir en línea" @click="handleSessionContinue" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminService from '@/services/adminService'
import { useInactivity } from '@/composables/useInactivity'
import { sessionTimeoutManager, sessionTimeoutState } from '@/shared/sessionTimeoutManager'

const authStore = useAuthStore()
useInactivity()
const leftDrawerOpen = ref(false)
const route = useRoute()
const router = useRouter()

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const today = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const userName = computed(() => authStore.userName)
const userPhoto = computed(() => authStore.userPhoto)
const userRole = computed(() => authStore.userRole)


// ====== Menu Items (filtered by permissions) ======
const allMenuItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', permission: 'vacaciones_dashboard' },
  { to: '/admin/solicitudes', icon: 'event_note', label: 'Solicitudes', permission: 'solicitudes' },
  { to: '/admin/calendario', icon: 'calendar_month', label: 'Calendario', permission: 'calendario' },
  { to: '/admin/empleados', icon: 'people', label: 'Empleados', permission: 'empleados' },
  { to: '/admin/feriados', icon: 'event', label: 'Feriados', permission: 'feriados' },
  { to: '/admin/reportes', icon: 'assessment', label: 'Reportes', permission: 'reportes' },
  { to: '/admin/documentacion', icon: 'menu_book', label: 'Documentación', permission: 'documentacion' },
]

const menuItems = computed(() => {
  const user = authStore.user
  const accessMetadata = user?.access_metadata || {}
  const sigvaAccess = accessMetadata['sigva'] || accessMetadata['SIGVA'] || { roles: [], permissions: [] }
  
  // Combine all possible sources of permissions
  const userPermisos = [
    ...(user?.permisos || []),
    ...(sigvaAccess.permissions || [])
  ]
  
  const roles = [
    ...(sigvaAccess.roles || []).map(r => r.toUpperCase()),
    (userRole.value || '').toUpperCase()
  ]
  const isGlobalAdmin = roles.some(r => ['DIRECTOR', 'ADMINISTRADOR', 'ADMIN', 'SUPER ADMIN'].includes(r))

  // If Global Admin or specifically has 'all', show all items
  if (isGlobalAdmin || userPermisos.includes('all') || userPermisos.includes('*')) {
      return allMenuItems
  }

  return allMenuItems.filter(item => userPermisos.includes(item.permission))
})

const setAdminSection = (path) => {
  router.push(path)
  leftDrawerOpen.value = false
}

const volverAlPortal = () => {
  const isDev = import.meta.env ? import.meta.env.DEV : process.env.DEV
  const ssoUrl = import.meta.env.VITE_SSO_FRONT_URL
  window.location.href = ssoUrl
}

const handleSessionContinue = async () => {
  await sessionTimeoutManager.continueSession()
}

const handleSessionLogoutNow = async () => {
  await sessionTimeoutManager.logoutNow()
}

const pendingCount = ref(0)

async function loadPendingCount() {
  try {
    const response = await adminService.getEstadisticasSolicitudes()
    pendingCount.value = response.data?.pendientes || 0
  } catch (error) {
    console.error('Error cargando pendientes:', error)
  }
}

onMounted(() => {
  authStore.initializeAuth()
  loadPendingCount()
})
</script>
