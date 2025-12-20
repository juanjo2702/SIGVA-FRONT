<template>
  <q-page class="q-pa-md">
    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="kpi in kpis" :key="kpi.label">
        <q-card class="shadow-2">
          <q-card-section>
            <div class="row items-center no-wrap">
              <q-avatar :color="kpi.color" text-color="white" size="56px">
                <q-icon :name="kpi.icon" size="28px" />
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-h4 text-weight-bold">{{ kpi.value }}</div>
                <div class="text-grey-7">{{ kpi.label }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Solicitudes Pendientes -->
      <div class="col-12 col-md-8">
        <q-card class="shadow-2">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                <q-icon name="pending_actions" color="warning" class="q-mr-sm" />
                Solicitudes Pendientes
              </div>
              <q-btn flat color="primary" label="Ver todas" to="/admin/solicitudes" no-caps />
            </div>

            <q-list separator v-if="solicitudesPendientes.length">
              <q-item v-for="sol in solicitudesPendientes" :key="sol.id">
                <q-item-section avatar>
                  <q-avatar color="warning" text-color="white">
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ sol.empleado?.nombre_completo }}</q-item-label>
                  <q-item-label caption>
                    {{ formatDate(sol.fecha_inicio) }} - {{ formatDate(sol.fecha_fin) }} 
                    ({{ sol.dias_solicitados }} días)
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn size="sm" round flat color="positive" icon="check" @click="aprobar(sol.id)">
                      <q-tooltip>Aprobar</q-tooltip>
                    </q-btn>
                    <q-btn size="sm" round flat color="negative" icon="close" @click="mostrarRechazo(sol)">
                      <q-tooltip>Rechazar</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-else class="text-center text-grey-6 q-pa-lg">
              <q-icon name="check_circle" size="48px" />
              <div class="q-mt-sm">No hay solicitudes pendientes</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Alertas -->
      <div class="col-12 col-md-4">
        <q-card class="shadow-2">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="warning" color="negative" class="q-mr-sm" />
              Alertas
            </div>

            <q-list separator v-if="empleadosNegativo.length">
              <q-item v-for="emp in empleadosNegativo" :key="emp.id">
                <q-item-section avatar>
                  <q-avatar color="negative" text-color="white">
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ emp.nombre_completo }}</q-item-label>
                  <q-item-label caption class="text-negative">
                    Saldo: {{ emp.saldo_vacaciones }} días
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <div v-else class="text-center text-grey-6 q-pa-lg">
              <q-icon name="thumb_up" size="48px" />
              <div class="q-mt-sm">Sin alertas</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Estadísticas rápidas -->
        <q-card class="shadow-2 q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="analytics" color="primary" class="q-mr-sm" />
              Este Año
            </div>

            <q-list dense>
              <q-item>
                <q-item-section>Solicitudes Aprobadas</q-item-section>
                <q-item-section side class="text-positive text-weight-bold">
                  {{ estadisticas.aprobadas || 0 }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Solicitudes Rechazadas</q-item-section>
                <q-item-section side class="text-negative text-weight-bold">
                  {{ estadisticas.rechazadas || 0 }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Días Otorgados</q-item-section>
                <q-item-section side class="text-primary text-weight-bold">
                  {{ estadisticas.dias_aprobados || 0 }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog rechazo -->
    <q-dialog v-model="dialogRechazo">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Rechazar Solicitud</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="motivoRechazo"
            label="Motivo del rechazo"
            type="textarea"
            outlined
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" label="Rechazar" @click="rechazar" :loading="loadingAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import adminService from '@/services/adminService'

const $q = useQuasar()

const loading = ref(true)
const loadingAction = ref(false)
const solicitudesPendientes = ref([])
const empleadosNegativo = ref([])
const estadisticas = ref({})
const estadisticasEmpleados = ref({})

const dialogRechazo = ref(false)
const solicitudRechazo = ref(null)
const motivoRechazo = ref('')

const kpis = computed(() => [
  {
    label: 'Empleados Activos',
    value: estadisticasEmpleados.value.total_activos || 0,
    icon: 'people',
    color: 'primary'
  },
  {
    label: 'Solicitudes Pendientes',
    value: estadisticas.value.pendientes || 0,
    icon: 'pending_actions',
    color: 'warning'
  },
  {
    label: 'Días Promedio',
    value: estadisticasEmpleados.value.saldo_promedio || 0,
    icon: 'event_available',
    color: 'positive'
  },
  {
    label: 'Saldo Negativo',
    value: estadisticasEmpleados.value.con_saldo_negativo || 0,
    icon: 'warning',
    color: 'negative'
  }
])

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function mostrarRechazo(solicitud) {
  solicitudRechazo.value = solicitud
  motivoRechazo.value = ''
  dialogRechazo.value = true
}

async function aprobar(id) {
  loadingAction.value = true
  try {
    await adminService.aprobarSolicitud(id)
    $q.notify({ type: 'positive', message: 'Solicitud aprobada' })
    cargarDatos()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al aprobar' })
  } finally {
    loadingAction.value = false
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
    $q.notify({ type: 'positive', message: 'Solicitud rechazada' })
    dialogRechazo.value = false
    cargarDatos()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al rechazar' })
  } finally {
    loadingAction.value = false
  }
}

async function cargarDatos() {
  loading.value = true
  try {
    const [solicitudes, stats, empStats, empNeg] = await Promise.all([
      adminService.getSolicitudes({ estado: 'pendiente', per_page: 5 }),
      adminService.getEstadisticasSolicitudes(),
      adminService.getEstadisticasEmpleados(),
      adminService.getEmpleados({ saldo_negativo: true, per_page: 5 })
    ])

    solicitudesPendientes.value = solicitudes.data?.data || []
    estadisticas.value = stats.data || {}
    estadisticasEmpleados.value = empStats.data || {}
    empleadosNegativo.value = empNeg.data?.data || []
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(cargarDatos)
</script>
