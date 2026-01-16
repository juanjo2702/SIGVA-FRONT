<template>
  <q-page class="reportes-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="assessment" size="28px" />
          </div>
          <div>
            <h1>Reportes</h1>
            <p class="subtitle">Genera reportes y estadísticas del sistema</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Reporte Saldos -->
      <div class="col-12 col-md-6">
        <q-card class="report-card">
          <q-card-section class="report-header saldos">
            <q-icon name="account_balance" size="32px" />
            <div>
              <div class="report-title">Saldos de Vacaciones</div>
              <div class="report-subtitle">Estado actual de saldos</div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-checkbox v-model="filtrosSaldos.solo_negativos" label="Solo saldo negativo" class="q-mb-md" />
            <div class="row q-gutter-sm">
              <q-btn color="primary" label="Generar" @click="cargarSaldos" :loading="loadingSaldos" unelevated no-caps />
              <q-btn flat color="primary" icon="download" label="Excel" @click="exportarEmpleados" no-caps />
            </div>
          </q-card-section>

          <q-card-section v-if="reporteSaldos">
            <div class="stats-row">
              <div class="stat positive">
                <div class="stat-value">{{ reporteSaldos.resumen.con_saldo_positivo }}</div>
                <div class="stat-label">Saldo +</div>
              </div>
              <div class="stat warning">
                <div class="stat-value">{{ reporteSaldos.resumen.con_saldo_cero }}</div>
                <div class="stat-label">Saldo 0</div>
              </div>
              <div class="stat negative">
                <div class="stat-value">{{ reporteSaldos.resumen.con_saldo_negativo }}</div>
                <div class="stat-label">Saldo -</div>
              </div>
            </div>

            <q-list separator bordered class="rounded-borders report-list">
              <q-item v-for="emp in reporteSaldos.empleados" :key="emp.id">
                <q-item-section>
                  <q-item-label>{{ emp.apellido_paterno }} {{ emp.apellido_materno }} {{ emp.nombres }}</q-item-label>
                  <q-item-label caption>CI: {{ emp.ci }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="emp.saldo_vacaciones < 0 ? 'negative' : 'positive'">{{ emp.saldo_vacaciones }} días</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reporte Solicitudes -->
      <div class="col-12 col-md-6">
        <q-card class="report-card">
          <q-card-section class="report-header solicitudes">
            <q-icon name="event_note" size="32px" />
            <div>
              <div class="report-title">Solicitudes por Período</div>
              <div class="report-subtitle">Análisis de solicitudes</div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-select v-model="filtrosSolicitudes.ano" :options="anosOptions" label="Año" outlined dense />
              </div>
              <div class="col-6">
                <q-select v-model="filtrosSolicitudes.estado" :options="estadoOptions" label="Estado" outlined dense emit-value map-options />
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn color="secondary" label="Generar" @click="cargarSolicitudes" :loading="loadingSolicitudes" unelevated no-caps />
              <q-btn flat color="secondary" icon="download" label="Excel" @click="exportarSolicitudes" no-caps />
            </div>
          </q-card-section>

          <q-card-section v-if="reporteSolicitudes">
            <div class="stats-row">
              <div class="stat positive">
                <div class="stat-value">{{ reporteSolicitudes.resumen.estados.aprobadas }}</div>
                <div class="stat-label">Aprobadas</div>
              </div>
              <div class="stat warning">
                <div class="stat-value">{{ reporteSolicitudes.resumen.estados.pendientes }}</div>
                <div class="stat-label">Pendientes</div>
              </div>
              <div class="stat negative">
                <div class="stat-value">{{ reporteSolicitudes.resumen.estados.rechazadas }}</div>
                <div class="stat-label">Rechazadas</div>
              </div>
            </div>

            <div class="dias-highlight">
              <div class="dias-value">{{ reporteSolicitudes.resumen.dias_aprobados }}</div>
              <div class="dias-label">Días Otorgados en {{ filtrosSolicitudes.ano }}</div>
            </div>

            <q-list separator bordered class="rounded-borders report-list">
              <q-item v-for="sol in reporteSolicitudes.solicitudes.slice(0, 20)" :key="sol.id">
                <q-item-section>
                  <q-item-label>{{ sol.empleado?.nombre_completo }}</q-item-label>
                  <q-item-label caption>{{ formatDate(sol.fecha_inicio) }} - {{ formatDate(sol.fecha_fin) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="getEstadoColor(sol.estado)">{{ sol.dias_solicitados }} días</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reporte Plan de Vacaciones (Image format) -->
      <div class="col-12 col-md-12">
        <q-card class="report-card">
          <q-card-section class="report-header general">
            <q-icon name="description" size="32px" />
            <div>
              <div class="report-title">Plan Anual de Vacaciones (Excel)</div>
              <div class="report-subtitle">Reporte detallado con saldos, fechas y reemplazos</div>
            </div>
          </q-card-section>

            <div class="row q-col-gutter-md items-end">
              <div class="col-12 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Establecimiento / Sede</div>
                <q-select 
                  v-model="filtrosGeneral.sede_id" 
                  :options="sedesOptions" 
                  outlined 
                  dense 
                  emit-value 
                  map-options
                  bg-color="white"
                >
                  <template v-slot:prepend>
                    <q-icon name="apartment" color="primary" />
                  </template>
                </q-select>
              </div>

              <!-- Selector de modo -->
              <div class="col-12 col-sm-6">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Filtrar por Fechas</div>
                    <q-toggle
                      v-model="filtrosGeneral.modo"
                      true-value="rango"
                      false-value="gestion"
                      color="primary"
                      icon="calendar_month"
                      class="q-mt-xs"
                    />
                  </div>

                  <div class="col-12 col-sm-8">
                    <div v-if="filtrosGeneral.modo === 'gestion'">
                      <div class="text-caption text-grey-7 q-mb-xs">Seleccionar Gestión</div>
                      <q-select v-model="filtrosGeneral.ano" :options="anosOptions" outlined dense bg-color="white">
                        <template v-slot:prepend>
                          <q-icon name="event" color="primary" />
                        </template>
                      </q-select>
                    </div>
                    <div v-else class="row q-col-gutter-xs">
                      <div class="col-6">
                        <div class="text-caption text-grey-7 q-mb-xs">Desde</div>
                        <q-input v-model="filtrosGeneral.fecha_desde" type="date" outlined dense bg-color="white" />
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-7 q-mb-xs">Hasta</div>
                        <q-input v-model="filtrosGeneral.fecha_hasta" type="date" outlined dense bg-color="white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-sm-3">
                <q-btn 
                  color="primary" 
                  icon="download" 
                  label="Generar Reporte" 
                  @click="exportarGeneral" 
                  :loading="loadingGeneral"
                  unelevated
                  no-caps
                  class="full-width"
                  style="height: 40px"
                />
              </div>
            </div>

          <q-card-section class="bg-grey-1 q-ma-md rounded-borders">
            <div class="text-caption text-grey-8">
              <q-icon name="info" size="16px" class="q-mr-xs" />
              Este reporte genera un documento Excel compatible con el formato institucional, incluyendo la antigüedad del empleado, saldo acumulado y cronograma de vacaciones programadas.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import adminService from '@/services/adminService'

const $q = useQuasar()

const loadingSaldos = ref(false)
const loadingSolicitudes = ref(false)
const loadingGeneral = ref(false)
const reporteSaldos = ref(null)
const reporteSolicitudes = ref(null)

const sedesOptions = ref([{ value: 'todos', label: 'Todas las Sedes' }])
const filtrosSaldos = ref({ solo_negativos: false })
const filtrosSolicitudes = ref({ ano: new Date().getFullYear(), estado: 'todos' })
const filtrosGeneral = ref({ 
  ano: new Date().getFullYear(), 
  sede_id: 'todos',
  fecha_desde: '',
  fecha_hasta: '',
  modo: 'gestion'
})

// Watcher para limpiar filtros al cambiar de modo
watch(() => filtrosGeneral.value.modo, (nuevoModo) => {
  if (nuevoModo === 'gestion') {
    filtrosGeneral.value.fecha_desde = ''
    filtrosGeneral.value.fecha_hasta = ''
  }
})

const currentYear = new Date().getFullYear()
const anosOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)
const estadoOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Rechazadas' }
]

function formatDate(d) {
  if (!d) return '-'
  if (typeof d === 'string' && d.includes('-')) {
    const [year, month, day] = d.split('T')[0].split('-')
    return `${parseInt(day)}/${parseInt(month)}/${year}`
  }
  return new Date(d).toLocaleDateString('es-BO')
}

function getEstadoColor(estado) { 
  return { pendiente: 'warning', aprobada: 'positive', rechazada: 'negative' }[estado] || 'grey' 
}

async function cargarSaldos() {
  loadingSaldos.value = true
  try {
    const res = await adminService.getReporteSaldos(filtrosSaldos.value)
    reporteSaldos.value = res.data
  } catch { $q.notify({ type: 'negative', message: 'Error al cargar reporte' }) }
  finally { loadingSaldos.value = false }
}

async function cargarSolicitudes() {
  loadingSolicitudes.value = true
  try {
    const res = await adminService.getReporteSolicitudes(filtrosSolicitudes.value)
    reporteSolicitudes.value = res.data
  } catch { $q.notify({ type: 'negative', message: 'Error al cargar reporte' }) }
  finally { loadingSolicitudes.value = false }
}

async function cargarSedes() {
  try {
    const res = await adminService.getSedes({ all: true })
    if (res.success) {
      sedesOptions.value = [
        { value: 'todos', label: 'Todas las Sedes' },
        ...res.data.map(s => ({ value: s.id, label: s.nombre }))
      ]
    }
  } catch (error) {
    console.error('Error al cargar sedes', error)
  }
}

async function exportarEmpleados() {
  loadingSaldos.value = true
  try {
    await adminService.descargarEmpleados(filtrosSaldos.value)
    $q.notify({ type: 'positive', message: 'Reporte de empleados generado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al exportar empleados' })
  } finally {
    loadingSaldos.value = false
  }
}

async function exportarSolicitudes() {
  loadingSolicitudes.value = true
  try {
    await adminService.descargarSolicitudes(filtrosSolicitudes.value)
    $q.notify({ type: 'positive', message: 'Reporte de solicitudes generado' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al exportar solicitudes' })
  } finally {
    loadingSolicitudes.value = false
  }
}

async function exportarGeneral() {
  loadingGeneral.value = true
  try {
    await adminService.descargarReporteGeneral(filtrosGeneral.value)
    $q.notify({ type: 'positive', message: 'Reporte generado correctamente' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el reporte' })
  } finally {
    loadingGeneral.value = false
  }
}

onMounted(() => {
  cargarSedes()
})
</script>

<style scoped>
.reportes-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-title h1 { font-size: 1.75rem; font-weight: 700; color: white; margin: 0; }
.header-title .subtitle { font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); margin: 4px 0 0; }

.report-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  border-radius: 12px 12px 0 0;
}

.report-header.saldos { background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%); }
.report-header.solicitudes { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); }
.report-header.general { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }

.report-title { font-size: 1.1rem; font-weight: 600; }
.report-subtitle { font-size: 0.8rem; opacity: 0.8; }

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.stat.positive .stat-value { color: #10b981; }
.stat.warning .stat-value { color: #f59e0b; }
.stat.negative .stat-value { color: #ef4444; }

.stat-value { font-size: 1.5rem; font-weight: 700; }
.stat-label { font-size: 0.75rem; color: #64748b; }

.dias-highlight {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}

.dias-value { font-size: 2.5rem; font-weight: 700; color: #0284c7; }
.dias-label { font-size: 0.85rem; color: #0369a1; }

.report-list { max-height: 300px; overflow-y: auto; }

@media (max-width: 768px) {
  .reportes-page { padding: 16px; }
  .page-header { padding: 20px; }
  .header-title h1 { font-size: 1.4rem; }
  .stats-row { flex-direction: column; }
}

@media (max-width: 576px) {
  .page-header { padding: 16px; }
  .header-title h1 { font-size: 1.2rem; }
  .title-icon { width: 44px; height: 44px; }
}
</style>
