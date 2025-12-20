<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Reportes</div>

    <div class="row q-col-gutter-md">
      <!-- Reporte Saldos -->
      <div class="col-12 col-md-6">
        <q-card class="shadow-2">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="account_balance" color="primary" class="q-mr-sm" />
              Saldos de Vacaciones
            </div>
            
            <q-checkbox v-model="filtrosSaldos.solo_negativos" label="Solo saldo negativo" class="q-mb-md" />
            
            <q-btn color="primary" label="Generar Reporte" @click="cargarSaldos" :loading="loadingSaldos" unelevated no-caps class="q-mr-sm" />
            <q-btn flat color="primary" icon="download" label="Exportar Excel" @click="exportarEmpleados" no-caps />
          </q-card-section>

          <q-card-section v-if="reporteSaldos">
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4 text-center">
                <div class="text-h5 text-positive">{{ reporteSaldos.resumen.con_saldo_positivo }}</div>
                <div class="text-caption">Saldo +</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h5 text-warning">{{ reporteSaldos.resumen.con_saldo_cero }}</div>
                <div class="text-caption">Saldo 0</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h5 text-negative">{{ reporteSaldos.resumen.con_saldo_negativo }}</div>
                <div class="text-caption">Saldo -</div>
              </div>
            </div>

            <q-list separator bordered class="rounded-borders" style="max-height: 400px; overflow: auto;">
              <q-item v-for="emp in reporteSaldos.empleados" :key="emp.id">
                <q-item-section>
                  <q-item-label>{{ emp.apellido_paterno }} {{ emp.apellido_materno }} {{ emp.nombres }}</q-item-label>
                  <q-item-label caption>CI: {{ emp.ci }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="emp.saldo_vacaciones < 0 ? 'negative' : 'positive'">
                    {{ emp.saldo_vacaciones }} días
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reporte Solicitudes -->
      <div class="col-12 col-md-6">
        <q-card class="shadow-2">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="event_note" color="secondary" class="q-mr-sm" />
              Solicitudes por Período
            </div>
            
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-select v-model="filtrosSolicitudes.ano" :options="anosOptions" label="Año" outlined dense />
              </div>
              <div class="col-6">
                <q-select v-model="filtrosSolicitudes.estado" :options="estadoOptions" label="Estado" outlined dense emit-value map-options />
              </div>
            </div>
            
            <q-btn color="secondary" label="Generar Reporte" @click="cargarSolicitudes" :loading="loadingSolicitudes" unelevated no-caps class="q-mr-sm" />
            <q-btn flat color="secondary" icon="download" label="Exportar Excel" @click="exportarSolicitudes" no-caps />
          </q-card-section>

          <q-card-section v-if="reporteSolicitudes">
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4 text-center">
                <div class="text-h5 text-positive">{{ reporteSolicitudes.resumen.estados.aprobadas }}</div>
                <div class="text-caption">Aprobadas</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h5 text-warning">{{ reporteSolicitudes.resumen.estados.pendientes }}</div>
                <div class="text-caption">Pendientes</div>
              </div>
              <div class="col-4 text-center">
                <div class="text-h5 text-negative">{{ reporteSolicitudes.resumen.estados.rechazadas }}</div>
                <div class="text-caption">Rechazadas</div>
              </div>
            </div>

            <div class="text-center q-mb-md">
              <div class="text-h4 text-primary">{{ reporteSolicitudes.resumen.dias_aprobados }}</div>
              <div class="text-caption">Días Otorgados en {{ filtrosSolicitudes.ano }}</div>
            </div>

            <q-list separator bordered class="rounded-borders" style="max-height: 300px; overflow: auto;">
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
import { ref, computed } from 'vue'
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

function formatDate(d) { return d ? new Date(d).toLocaleDateString('es-BO') : '-' }
function getEstadoColor(estado) { return { pendiente: 'warning', aprobada: 'positive', rechazada: 'negative' }[estado] || 'grey' }

async function cargarSaldos() {
  loadingSaldos.value = true
  try {
    const res = await adminService.getReporteSaldos(filtrosSaldos.value)
    reporteSaldos.value = res.data
  } catch { $q.notify({ type: 'negative', message: 'Error' }) }
  finally { loadingSaldos.value = false }
}

async function cargarSolicitudes() {
  loadingSolicitudes.value = true
  try {
    const res = await adminService.getReporteSolicitudes(filtrosSolicitudes.value)
    reporteSolicitudes.value = res.data
  } catch { $q.notify({ type: 'negative', message: 'Error' }) }
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
