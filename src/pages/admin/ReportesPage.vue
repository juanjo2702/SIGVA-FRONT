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
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import adminService from '@/services/adminService'

const $q = useQuasar()

const loadingSaldos = ref(false)
const loadingSolicitudes = ref(false)
const reporteSaldos = ref(null)
const reporteSolicitudes = ref(null)

const filtrosSaldos = ref({ solo_negativos: false })
const filtrosSolicitudes = ref({ ano: new Date().getFullYear(), estado: 'todos' })

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

function exportarEmpleados() {
  const url = adminService.getExportarEmpleadosUrl(filtrosSaldos.value)
  window.open(url, '_blank')
}

function exportarSolicitudes() {
  const url = adminService.getExportarSolicitudesUrl(filtrosSolicitudes.value)
  window.open(url, '_blank')
}
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
