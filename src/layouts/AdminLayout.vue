<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <!-- Logo -->
        <q-item class="q-py-lg">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="48px">
              <q-icon name="beach_access" size="28px" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-h6 text-weight-bold text-primary">SIGVA</q-item-label>
            <q-item-label caption>Portal RRHH</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <!-- Navigation -->
        <q-item 
          v-for="item in menuItems" 
          :key="item.to"
          :to="item.to" 
          clickable 
          v-ripple
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <!-- User info and logout -->
        <q-item>
          <q-item-section avatar>
            <q-avatar color="secondary" text-color="white">
              <q-icon name="person" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ authStore.userName }}</q-item-label>
            <q-item-label caption>Administrador</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="handleLogout" class="text-negative">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Cerrar Sesión</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Header -->
    <q-header class="bg-white text-grey-8" bordered>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title class="text-weight-medium">
          {{ pageTitle }}
        </q-toolbar-title>
        <q-space />
        <q-btn flat round icon="notifications" class="q-mr-sm">
          <q-badge color="negative" floating v-if="pendingCount > 0">
            {{ pendingCount }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Main content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import adminService from '@/services/adminService'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const leftDrawerOpen = ref(false)
const pendingCount = ref(0)

const menuItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/solicitudes', icon: 'event_note', label: 'Solicitudes' },
  { to: '/admin/empleados', icon: 'people', label: 'Empleados' },
  { to: '/admin/reportes', icon: 'assessment', label: 'Reportes' }
]

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    solicitudes: 'Gestión de Solicitudes',
    empleados: 'Gestión de Empleados',
    reportes: 'Reportes'
  }
  return titles[route.name] || 'SIGVA'
})

async function handleLogout() {
  await authStore.logout()
  router.push('/admin/login')
}

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
