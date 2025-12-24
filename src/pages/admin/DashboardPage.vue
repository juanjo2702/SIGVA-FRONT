<template>
  <q-page class="dashboard-page">
    <!-- Header con saludo -->
    <div class="dashboard-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h1 class="welcome-title">
            <span class="greeting">{{ greeting }},</span>
            <span class="user-name">{{ userName }}</span>
          </h1>
          <p class="welcome-subtitle">
            <q-icon name="calendar_today" size="18px" class="q-mr-xs" />
            {{ currentDate }}
          </p>
        </div>
        <div class="header-actions">
          <q-btn 
            unelevated 
            color="white" 
            text-color="primary"
            icon="refresh" 
            label="Actualizar" 
            no-caps
            class="refresh-btn"
            @click="cargarDatos"
            :loading="loading"
          />
        </div>
      </div>
    </div>

    <!-- KPI Cards con gradientes -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div 
        class="col-12 col-sm-6 col-lg-3" 
        v-for="(kpi, index) in kpis" 
        :key="kpi.label"
      >
        <div class="kpi-card" :class="`kpi-${kpi.variant}`">
          <div class="kpi-content">
            <div class="kpi-icon-wrapper">
              <q-icon :name="kpi.icon" size="32px" />
            </div>
            <div class="kpi-info">
              <div class="kpi-value">{{ animatedValues[index] }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
            </div>
          </div>
          <div class="kpi-trend" v-if="kpi.trend">
            <q-icon :name="kpi.trend > 0 ? 'trending_up' : 'trending_down'" size="14px" />
            <span>{{ Math.abs(kpi.trend) }}% vs mes anterior</span>
          </div>
          <div class="kpi-decoration"></div>
        </div>
      </div>
    </div>

    <!-- Grid Principal -->
    <div class="row q-col-gutter-lg">
      <!-- Columna izquierda -->
      <div class="col-12 col-lg-8">
        <!-- Solicitudes Pendientes con Tabs -->
        <q-card class="dashboard-card q-mb-lg">
          <q-card-section class="card-header">
            <div class="row items-center justify-between">
              <div class="card-title">
                <div class="title-icon warning">
                  <q-icon name="assignment" />
                </div>
                <div>
                  <h3>Gestión de Solicitudes</h3>
                  <p class="subtitle">Solicitudes que requieren acción</p>
                </div>
              </div>
              <q-btn 
                flat 
                color="primary" 
                label="Ver todas" 
                to="/admin/solicitudes" 
                no-caps
                icon-right="arrow_forward"
                class="view-all-btn"
              />
            </div>
          </q-card-section>

          <!-- Tabs para separar tipos de pendientes -->
          <q-tabs
            v-model="tabActivo"
            class="solicitudes-tabs"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <q-tab name="aprobar" no-caps>
              <div class="tab-content">
                <q-icon name="pending_actions" size="20px" class="q-mr-sm" />
                <span>Por Aprobar</span>
                <q-badge v-if="solicitudesPendientes.length" color="warning" floating>
                  {{ solicitudesPendientes.length }}
                </q-badge>
              </div>
            </q-tab>
            <q-tab name="documento" no-caps>
              <div class="tab-content">
                <q-icon name="description" size="20px" class="q-mr-sm" />
                <span>Pend. Documento</span>
                <q-badge v-if="solicitudesDocumento.length" color="info" floating>
                  {{ solicitudesDocumento.length }}
                </q-badge>
              </div>
            </q-tab>
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tabActivo" animated>
            <!-- Panel: Por Aprobar -->
            <q-tab-panel name="aprobar" class="q-pa-none">
              <q-card-section>
                <div v-if="solicitudesPendientes.length" class="solicitudes-grid">
                  <div 
                    v-for="(sol, index) in solicitudesPendientes" 
                    :key="sol.id"
                    class="solicitud-item"
                    :style="{ animationDelay: `${index * 0.1}s` }"
                  >
                    <div class="solicitud-avatar">
                      <q-avatar size="48px" color="orange-2" text-color="warning">
                        {{ getInitials(sol.empleado?.nombre_completo) }}
                      </q-avatar>
                    </div>
                    <div class="solicitud-info">
                      <div class="solicitud-name">{{ sol.empleado?.nombre_completo }}</div>
                      <div class="solicitud-dates">
                        <q-icon name="event" size="14px" class="q-mr-xs" />
                        {{ formatDate(sol.fecha_inicio) }} - {{ formatDate(sol.fecha_fin) }}
                      </div>
                      <div class="solicitud-meta">
                        <q-chip dense size="sm" color="orange-2" text-color="orange-10">
                          {{ sol.dias_solicitados }} días
                        </q-chip>
                        <q-chip dense size="sm" outline color="grey">
                          {{ sol.empleado?.sede?.nombre || 'Sin sede' }}
                        </q-chip>
                      </div>
                    </div>
                    <div class="solicitud-actions">
                      <q-btn 
                        round 
                        unelevated
                        color="positive" 
                        icon="check" 
                        size="sm"
                        @click="aprobar(sol.id)"
                        :loading="loadingAction === sol.id"
                      >
                        <q-tooltip>Aprobar</q-tooltip>
                      </q-btn>
                      <q-btn 
                        round 
                        unelevated
                        color="negative" 
                        icon="close" 
                        size="sm"
                        @click="mostrarRechazo(sol)"
                      >
                        <q-tooltip>Rechazar</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <div class="empty-icon success">
                    <q-icon name="check_circle" size="48px" />
                  </div>
                  <h4>¡Sin pendientes!</h4>
                  <p>No hay solicitudes esperando aprobación</p>
                </div>
              </q-card-section>
            </q-tab-panel>

            <!-- Panel: Pendiente Documento -->
            <q-tab-panel name="documento" class="q-pa-none">
              <q-card-section>
                <div v-if="solicitudesDocumento.length" class="solicitudes-grid">
                  <div 
                    v-for="(sol, index) in solicitudesDocumento" 
                    :key="sol.id"
                    class="solicitud-item documento"
                    :style="{ animationDelay: `${index * 0.1}s` }"
                  >
                    <div class="solicitud-avatar">
                      <q-avatar size="48px" color="cyan-2" text-color="info">
                        {{ getInitials(sol.empleado?.nombre_completo) }}
                      </q-avatar>
                    </div>
                    <div class="solicitud-info">
                      <div class="solicitud-name">{{ sol.empleado?.nombre_completo }}</div>
                      <div class="solicitud-dates">
                        <q-icon name="event" size="14px" class="q-mr-xs" />
                        {{ formatDate(sol.fecha_inicio) }} - {{ formatDate(sol.fecha_fin) }}
                      </div>
                      <div class="solicitud-meta">
                        <q-chip dense size="sm" color="cyan-2" text-color="cyan-10">
                          {{ sol.dias_solicitados }} días
                        </q-chip>
                        <span class="documento-hint">
                          <q-icon name="info" size="12px" />
                          Esperando formulario físico
                        </span>
                      </div>
                    </div>
                    <div class="solicitud-actions">
                      <q-btn 
                        unelevated
                        color="info" 
                        icon="task_alt"
                        label="Confirmar"
                        size="sm"
                        no-caps
                        @click="confirmarDocumento(sol.id)"
                        :loading="loadingAction === sol.id"
                      />
                    </div>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <div class="empty-icon success">
                    <q-icon name="folder_open" size="48px" />
                  </div>
                  <h4>Sin documentos pendientes</h4>
                  <p>Todos los formularios han sido recibidos</p>
                </div>
              </q-card-section>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>

        <!-- Calendario de vacaciones próximas -->
        <q-card class="dashboard-card">
          <q-card-section class="card-header">
            <div class="card-title">
              <div class="title-icon teal">
                <q-icon name="event_note" />
              </div>
              <div>
                <h3>Próximas Vacaciones</h3>
                <p class="subtitle">Empleados de vacaciones esta semana</p>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div v-if="proximasVacaciones.length" class="vacaciones-timeline">
              <div 
                v-for="vac in proximasVacaciones" 
                :key="vac.id" 
                class="timeline-item"
              >
                <div class="timeline-indicator"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-name">{{ vac.empleado?.nombre_completo }}</span>
                    <q-chip dense size="sm" :color="getStatusColor(vac.estado)" text-color="white">
                      {{ vac.dias_solicitados }} días
                    </q-chip>
                  </div>
                  <div class="timeline-dates">
                    {{ formatDate(vac.fecha_inicio) }} → {{ formatDate(vac.fecha_fin) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state small">
              <q-icon name="beach_access" size="40px" color="grey-4" />
              <p>Sin vacaciones programadas esta semana</p>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Columna derecha -->
      <div class="col-12 col-lg-4">
        <!-- Resumen del año -->
        <q-card class="dashboard-card stats-card q-mb-lg">
          <q-card-section class="card-header">
            <div class="card-title">
              <div class="title-icon primary">
                <q-icon name="analytics" />
              </div>
              <div>
                <h3>Resumen {{ currentYear }}</h3>
                <p class="subtitle">Estadísticas anuales</p>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-ring positive">
                  <svg viewBox="0 0 36 36">
                    <path
                      class="stat-ring-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      class="stat-ring-fill"
                      :stroke-dasharray="`${approvalRate}, 100`"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div class="stat-ring-value">{{ approvalRate }}%</div>
                </div>
                <div class="stat-label">Tasa Aprobación</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ estadisticas.aprobadas || 0 }}</div>
                <div class="stat-label">
                  <span class="stat-dot positive"></span>
                  Aprobadas
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ estadisticas.rechazadas || 0 }}</div>
                <div class="stat-label">
                  <span class="stat-dot negative"></span>
                  Rechazadas
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-number highlight">{{ estadisticas.dias_aprobados || 0 }}</div>
                <div class="stat-label">
                  <span class="stat-dot primary"></span>
                  Días Otorgados
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Alertas -->
        <q-card class="dashboard-card alerts-card">
          <q-card-section class="card-header">
            <div class="card-title">
              <div class="title-icon negative">
                <q-icon name="warning" />
              </div>
              <div>
                <h3>Alertas</h3>
                <p class="subtitle">Saldos negativos</p>
              </div>
            </div>
            <q-badge v-if="empleadosNegativo.length" color="negative" floating>
              {{ empleadosNegativo.length }}
            </q-badge>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div v-if="empleadosNegativo.length" class="alerts-list">
              <div 
                v-for="emp in empleadosNegativo" 
                :key="emp.id" 
                class="alert-item"
              >
                <q-avatar size="36px" color="red-1" text-color="negative">
                  {{ getInitials(emp.nombre_completo) }}
                </q-avatar>
                <div class="alert-info">
                  <div class="alert-name">{{ emp.nombre_completo }}</div>
                  <div class="alert-badge">
                    <q-icon name="remove_circle" size="12px" />
                    {{ emp.saldo_vacaciones }} días
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state small">
              <div class="empty-icon-small success">
                <q-icon name="verified" size="32px" />
              </div>
              <p>Todos los empleados tienen saldo positivo</p>
            </div>
          </q-card-section>
        </q-card>

        <!-- Accesos rápidos -->
        <q-card class="dashboard-card quick-actions q-mt-lg">
          <q-card-section>
            <div class="card-title small q-mb-md">
              <q-icon name="bolt" size="20px" color="warning" />
              <span>Accesos Rápidos</span>
            </div>
            <div class="quick-actions-grid">
              <router-link to="/admin/empleados" class="quick-action-item">
                <q-icon name="person_add" />
                <span>Nuevo Empleado</span>
              </router-link>
              <router-link to="/admin/solicitudes" class="quick-action-item">
                <q-icon name="add_task" />
                <span>Nueva Solicitud</span>
              </router-link>
              <router-link to="/admin/reportes" class="quick-action-item">
                <q-icon name="download" />
                <span>Exportar Datos</span>
              </router-link>
              <router-link to="/admin/calendario" class="quick-action-item">
                <q-icon name="calendar_month" />
                <span>Calendario</span>
              </router-link>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog rechazo -->
    <q-dialog v-model="dialogRechazo">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="dialog-icon negative">
            <q-icon name="cancel" size="32px" />
          </div>
          <h3>Rechazar Solicitud</h3>
          <p>Esta acción notificará al empleado</p>
        </q-card-section>

        <q-card-section>
          <q-input 
            v-model="motivoRechazo" 
            label="Motivo del rechazo" 
            type="textarea" 
            outlined 
            rows="3"
            placeholder="Ingrese el motivo por el cual se rechaza la solicitud..."
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn 
            unelevated 
            color="negative" 
            label="Rechazar Solicitud" 
            @click="rechazar" 
            :loading="loadingAction"
            no-caps
            icon="close"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import adminService from '@/services/adminService'

const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(true)
const loadingAction = ref(null)
const tabActivo = ref('aprobar')
const solicitudesPendientes = ref([])
const solicitudesDocumento = ref([])
const proximasVacaciones = ref([])
const empleadosNegativo = ref([])
const estadisticas = ref({})
const estadisticasEmpleados = ref({})
const animatedValues = ref([0, 0, 0, 0])

const dialogRechazo = ref(false)
const solicitudRechazo = ref(null)
const motivoRechazo = ref('')

const currentYear = new Date().getFullYear()

const userName = computed(() => {
  const name = authStore.user?.name || 'Usuario'
  return name.split(' ')[0]
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const approvalRate = computed(() => {
  const total = (estadisticas.value.aprobadas || 0) + (estadisticas.value.rechazadas || 0)
  if (total === 0) return 0
  return Math.round((estadisticas.value.aprobadas / total) * 100)
})

// Total de pendientes combina ambos tipos
const totalPendientes = computed(() => {
  return (estadisticas.value.pendientes || 0) + (estadisticas.value.pendientes_documento || 0)
})

const kpis = computed(() => [
  {
    label: 'Empleados Activos',
    value: estadisticasEmpleados.value.total_activos || 0,
    icon: 'groups',
    variant: 'primary',
    trend: 5
  },
  {
    label: 'Por Aprobar',
    value: estadisticas.value.pendientes || 0,
    icon: 'pending_actions',
    variant: 'warning'
  },
  {
    label: 'Pend. Documento',
    value: estadisticas.value.pendientes_documento || 0,
    icon: 'description',
    variant: 'info'
  },
  {
    label: 'Alertas',
    value: estadisticasEmpleados.value.con_saldo_negativo || 0,
    icon: 'warning_amber',
    variant: 'danger'
  }
])

// Animar valores de KPIs
watch(kpis, (newKpis) => {
  newKpis.forEach((kpi, index) => {
    animateValue(index, kpi.value)
  })
}, { deep: true })

function animateValue(index, target) {
  const duration = 1000
  const start = animatedValues.value[index]
  const startTime = performance.now()
  
  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    animatedValues.value[index] = Math.round(start + (target - start) * easeProgress)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function getStatusColor(status) {
  const colors = {
    pendiente: 'warning',
    aprobada: 'positive',
    rechazada: 'negative',
    pendiente_documento: 'info'
  }
  return colors[status] || 'grey'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }
  return new Date(dateStr).toLocaleDateString('es-BO')
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hrs`
  return `Hace ${Math.floor(diff / 86400)} días`
}

function mostrarRechazo(solicitud) {
  solicitudRechazo.value = solicitud
  motivoRechazo.value = ''
  dialogRechazo.value = true
}

async function aprobar(id) {
  loadingAction.value = id
  try {
    await adminService.aprobarSolicitud(id)
    $q.notify({ 
      type: 'positive', 
      message: 'Solicitud aprobada exitosamente',
      icon: 'check_circle'
    })
    cargarDatos()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al aprobar la solicitud' })
  } finally {
    loadingAction.value = null
  }
}

async function rechazar() {
  if (!motivoRechazo.value.trim()) {
    $q.notify({ type: 'warning', message: 'Ingrese el motivo del rechazo' })
    return
  }

  loadingAction.value = true
  try {
    await adminService.rechazarSolicitud(solicitudRechazo.value.id, motivoRechazo.value)
    $q.notify({ 
      type: 'positive', 
      message: 'Solicitud rechazada',
      icon: 'info'
    })
    dialogRechazo.value = false
    cargarDatos()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al rechazar' })
  } finally {
    loadingAction.value = false
  }
}

async function confirmarDocumento(id) {
  loadingAction.value = id
  try {
    await adminService.confirmarDocumento(id)
    $q.notify({ 
      type: 'positive', 
      message: 'Documento confirmado y solicitud aprobada',
      icon: 'task_alt'
    })
    cargarDatos()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al confirmar documento' })
  } finally {
    loadingAction.value = null
  }
}

async function cargarDatos() {
  loading.value = true
  try {
    const [solicitudes, solDocumentos, vacProximas, stats, empStats, empNeg] = await Promise.all([
      adminService.getSolicitudes({ estado: 'pendiente', per_page: 10 }),
      adminService.getSolicitudes({ estado: 'pendiente_documento', per_page: 10 }),
      adminService.getSolicitudes({ estado: 'aprobada', per_page: 5, ordenar: 'fecha_inicio' }),
      adminService.getEstadisticasSolicitudes(),
      adminService.getEstadisticasEmpleados(),
      adminService.getEmpleados({ saldo_negativo: true, per_page: 5 })
    ])

    solicitudesPendientes.value = solicitudes.data?.data || []
    solicitudesDocumento.value = solDocumentos.data?.data || []
    proximasVacaciones.value = vacProximas.data?.data || []
    estadisticas.value = stats.data || {}
    estadisticasEmpleados.value = empStats.data || {}
    empleadosNegativo.value = empNeg.data?.data || []
    
    // Auto-seleccionar tab con pendientes
    if (solicitudesPendientes.value.length === 0 && solicitudesDocumento.value.length > 0) {
      tabActivo.value = 'documento'
    }
  } catch (error) {
    console.error('Error cargando dashboard:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos del dashboard' })
  } finally {
    loading.value = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  min-height: 100vh;
}

/* Header */
.dashboard-header {
  background: linear-gradient(135deg, var(--unitepc-purple) 0%, #4a2475 100%);
  padding: 32px;
  border-radius: 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: 10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 300;
  margin: 0 0 8px 0;
}

.welcome-title .greeting {
  opacity: 0.9;
}

.welcome-title .user-name {
  font-weight: 600;
}

.welcome-subtitle {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  text-transform: capitalize;
}

.refresh-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

/* KPI Cards */
.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.kpi-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.kpi-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.kpi-primary .kpi-icon-wrapper {
  background: linear-gradient(135deg, #663399 0%, #8855bb 100%);
}

.kpi-warning .kpi-icon-wrapper {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.kpi-success .kpi-icon-wrapper {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.kpi-danger .kpi-icon-wrapper {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
}

.kpi-info .kpi-icon-wrapper {
  background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%);
}

.kpi-info .kpi-decoration {
  background: #0891b2;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.kpi-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #10b981;
  margin-top: 12px;
  position: relative;
  z-index: 1;
}

.kpi-decoration {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.05;
}

.kpi-primary .kpi-decoration { background: #663399; }
.kpi-warning .kpi-decoration { background: #f59e0b; }
.kpi-success .kpi-decoration { background: #10b981; }
.kpi-danger .kpi-decoration { background: #ef4444; }

/* Dashboard Cards */
.dashboard-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title.small {
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.card-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
}

.card-title .subtitle {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.title-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.title-icon.primary { background: linear-gradient(135deg, #663399, #8855bb); }
.title-icon.warning { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.title-icon.teal { background: linear-gradient(135deg, #009999, #00aaaa); }
.title-icon.negative { background: linear-gradient(135deg, #ef4444, #f87171); }

.view-all-btn {
  font-weight: 500;
}

/* Solicitudes Grid */
.solicitudes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.solicitud-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
  animation: fadeSlideIn 0.4s ease forwards;
  opacity: 0;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.solicitud-item:hover {
  background: #f1f5f9;
}

.solicitud-info {
  flex: 1;
}

.solicitud-name {
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.solicitud-dates {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.solicitud-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.solicitud-time {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.solicitud-actions {
  display: flex;
  gap: 4px;
}

/* Tabs de solicitudes */
.solicitudes-tabs {
  padding: 0 16px;
}

.solicitudes-tabs .q-tab {
  padding: 12px 20px;
}

.tab-content {
  display: flex;
  align-items: center;
  position: relative;
}

.solicitud-item.documento {
  background: #ecfeff;
  border-left: 3px solid #0891b2;
}

.solicitud-item.documento:hover {
  background: #cffafe;
}

.documento-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #0891b2;
  font-style: italic;
}

/* Timeline */
.vacaciones-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  position: relative;
}

.timeline-indicator {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #009999, #00aaaa);
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 20px;
  width: 2px;
  height: calc(100% + 4px);
  background: #e2e8f0;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.timeline-name {
  font-weight: 500;
  color: #1a1a2e;
}

.timeline-dates {
  font-size: 0.85rem;
  color: #64748b;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-ring {
  width: 80px;
  height: 80px;
  margin: 0 auto 8px;
  position: relative;
}

.stat-ring svg {
  transform: rotate(-90deg);
}

.stat-ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}

.stat-ring-fill {
  fill: none;
  stroke: #10b981;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease;
}

.stat-ring-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-number.highlight {
  color: #663399;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot.positive { background: #10b981; }
.stat-dot.negative { background: #ef4444; }
.stat-dot.primary { background: #663399; }

/* Alerts */
.alerts-card {
  position: relative;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fef2f2;
  border-radius: 10px;
  border-left: 3px solid #ef4444;
}

.alert-info {
  flex: 1;
}

.alert-name {
  font-weight: 500;
  color: #1a1a2e;
  font-size: 0.9rem;
}

.alert-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: #f8fafc;
  border-radius: 12px;
  text-decoration: none;
  color: #475569;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  text-align: center;
}

.quick-action-item:hover {
  background: linear-gradient(135deg, #663399, #8855bb);
  color: white;
  transform: translateY(-2px);
}

.quick-action-item .q-icon {
  font-size: 24px;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state.small {
  padding: 24px 16px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-icon.success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #10b981;
}

.empty-icon-small {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.empty-icon-small.success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #10b981;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  color: #1a1a2e;
}

.empty-state p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Dialog */
.dialog-card {
  min-width: 420px;
  border-radius: 16px;
}

.dialog-header {
  text-align: center;
  padding: 24px 24px 16px;
}

.dialog-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.dialog-icon.negative {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  color: #dc2626;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a1a2e;
}

.dialog-header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-page {
    padding: 16px;
  }
  
  .dashboard-header {
    padding: 24px;
  }
  
  .welcome-title {
    font-size: 1.4rem;
  }
  
  .header-actions {
    margin-top: 16px;
  }
}

@media (max-width: 600px) {
  .kpi-value {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dialog-card {
    min-width: 90vw;
  }
}
</style>
