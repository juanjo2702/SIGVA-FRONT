<template>
  <q-page class="empleados-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="badge" size="28px" />
          </div>
          <div>
            <h1>Gestión de Empleados</h1>
            <p class="subtitle">Administra el personal y sus vacaciones</p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn unelevated color="white" text-color="primary" icon="upload_file" label="Importar" no-caps
            class="action-btn" @click="dialogImport = true" />
          <q-btn unelevated color="secondary" icon="add" label="Nuevo Empleado" no-caps class="action-btn"
            @click="abrirFormulario()" />
        </div>
      </div>
    </div>

    <!-- Filtros mejorados -->
    <div class="filters-section">
      <div class="filters-grid">
        <q-input v-model="filtros.buscar" label="Buscar (CI, Nombre)" outlined dense clearable
          class="filter-item search-input" @update:model-value="buscarConDebounce">
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
          <template v-slot:append v-if="loading">
            <q-spinner size="xs" color="primary" />
          </template>
        </q-input>

        <q-select v-model="filtros.sede_id" :options="sedesOptions" label="Sede" emit-value map-options outlined dense
          clearable class="filter-item" @update:model-value="cargarEmpleados">
          <template v-slot:prepend>
            <q-icon name="location_on" color="primary" />
          </template>
        </q-select>

        <q-checkbox v-model="filtros.saldo_negativo" label="Solo saldo negativo" class="filter-checkbox"
          @update:model-value="cargarEmpleados" />
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="shadow-2">
      <q-table :rows="empleados" :columns="columns" row-key="id" :loading="loading" v-model:pagination="pagination"
        @request="onRequest" :rows-per-page-options="[10, 15, 25, 50, 100]" flat>
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nombre_completo }}</div>
            <div class="text-caption text-grey">{{ props.row.cargo }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-saldo="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.saldo_vacaciones < 0 ? 'negative' : props.row.saldo_vacaciones === 0 ? 'warning' : 'positive'">
              {{ props.row.saldo_vacaciones }} días
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn-group flat>
              <q-btn size="sm" flat icon="beach_access" color="primary" @click="abrirProgramar(props.row)">
                <q-tooltip>Programar Vacaciones</q-tooltip>
              </q-btn>
              <q-btn size="sm" flat icon="edit" @click="abrirFormulario(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn size="sm" flat icon="tune" @click="abrirAjuste(props.row)">
                <q-tooltip>Ajustar Saldo</q-tooltip>
              </q-btn>
              <q-btn size="sm" flat icon="history" @click="verHistorial(props.row)">
                <q-tooltip>Historial</q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialogs usando componentes extraídos -->
    <DialogEmpleadoForm v-model="dialogForm" :empleado="empleadoEditar" :sedes="sedes" :loading="loadingAction"
      @save="guardarEmpleado" />

    <DialogAjusteSaldo v-model="dialogAjuste" :empleado="empleadoAjuste" :loading="loadingAction"
      @save="guardarAjuste" />

    <DialogImportExcel v-model="dialogImport" :sedes="sedes" :loading="loadingImport"
      :loading-template="loadingPlantilla" @import="importarExcel" @download-template="descargarPlantilla" />

    <DialogHistorial v-model="dialogHistorial" :empleado="empleadoHistorial" :historial="historial"
      :solicitudes="solicitudesEmpleado" :loading="loadingHistorial" />

    <DialogProgramarVacaciones v-model="dialogProgramar" :empleado="empleadoProgramar" :loading="loadingProgramar"
      @save="guardarProgramacion" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import adminService from '@/services/adminService'
import { useNotify } from '@/composables/useNotify'
import {
  DialogEmpleadoForm,
  DialogAjusteSaldo,
  DialogImportExcel,
  DialogHistorial,
  DialogProgramarVacaciones
} from '@/components/empleados'

// Composables
const notify = useNotify()

// State
const loading = ref(false)
const empleados = ref([])
const filtros = ref({ buscar: '', saldo_negativo: false, sede_id: null })
const sedes = ref([])

// Computed
const sedesOptions = computed(() => [
  { value: null, label: 'Todas las sedes' },
  ...sedes.value.map(s => ({ value: s.id, label: s.nombre }))
])
const pagination = ref({
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

// Dialog states
const dialogForm = ref(false)
const dialogAjuste = ref(false)
const dialogImport = ref(false)
const dialogHistorial = ref(false)
const dialogProgramar = ref(false)

// Loading states
const loadingAction = ref(false)
const loadingImport = ref(false)
const loadingPlantilla = ref(false)
const loadingHistorial = ref(false)
const loadingProgramar = ref(false)

// Dialog data
const empleadoEditar = ref(null)
const empleadoAjuste = ref(null)
const empleadoHistorial = ref(null)
const empleadoProgramar = ref(null)
const historial = ref([])
const solicitudesEmpleado = ref([])

// Table columns
const columns = [
  { name: 'ci', label: 'C.I.', field: 'ci', align: 'left' },
  { name: 'nombre', label: 'Nombre', align: 'left' },
  { name: 'genero', label: 'Género', field: row => row.genero || '-', align: 'center' },
  { name: 'contrato', label: 'Contrato', field: row => row.tipo_contrato === 'medio_tiempo' ? 'Medio T.' : 'Completo', align: 'center' },
  { name: 'sede', label: 'Sede', field: row => row.sede?.nombre || '-', align: 'left' },
  { name: 'fecha_ingreso', label: 'Ingreso', field: row => formatDate(row.fecha_ingreso), align: 'left' },
  { name: 'saldo', label: 'Saldo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

// Debounce search
const buscarConDebounce = useDebounceFn(() => {
  pagination.value.page = 1
  cargarEmpleados()
}, 300)

// Format functions
function formatDate(d) {
  if (!d) return '-'
  if (typeof d === 'string' && d.includes('-')) {
    const [year, month, day] = d.split('T')[0].split('-')
    return `${parseInt(day)}/${parseInt(month)}/${year}`
  }
  return new Date(d).toLocaleDateString('es-BO')
}

// Dialog handlers
function abrirFormulario(emp = null) {
  empleadoEditar.value = emp
  dialogForm.value = true
}

function abrirAjuste(emp) {
  empleadoAjuste.value = emp
  dialogAjuste.value = true
}

async function verHistorial(emp) {
  empleadoHistorial.value = emp
  loadingHistorial.value = true
  dialogHistorial.value = true
  try {
    const res = await adminService.getHistorialEmpleado(emp.id)
    historial.value = Array.isArray(res.data?.historial) ? res.data.historial : []
    solicitudesEmpleado.value = Array.isArray(res.data?.solicitudes) ? res.data.solicitudes : []
  } catch {
    historial.value = []
    notify.error('Error al cargar historial')
  } finally {
    loadingHistorial.value = false
  }
}

function abrirProgramar(emp) {
  empleadoProgramar.value = emp
  dialogProgramar.value = true
}

// CRUD handlers
async function guardarEmpleado(formData, isEditing) {
  loadingAction.value = true
  try {
    if (isEditing && empleadoEditar.value) {
      await adminService.actualizarEmpleado(empleadoEditar.value.id, formData)
    } else {
      await adminService.crearEmpleado(formData)
    }
    notify.success('Empleado guardado')
    dialogForm.value = false
    cargarEmpleados()
  } catch (e) {
    notify.error(e.response?.data?.message || 'Error al guardar')
  } finally {
    loadingAction.value = false
  }
}

async function guardarAjuste(formData) {
  if (!formData.descripcion?.trim()) {
    notify.warning('Ingrese el motivo')
    return
  }
  loadingAction.value = true
  try {
    await adminService.ajustarSaldo(empleadoAjuste.value.id, formData.nuevo_saldo, formData.descripcion)
    notify.success('Saldo ajustado')
    dialogAjuste.value = false
    cargarEmpleados()
  } catch {
    notify.error('Error al ajustar saldo')
  } finally {
    loadingAction.value = false
  }
}

async function guardarProgramacion(formData) {
  if (!formData.dias || formData.dias.length === 0) {
    notify.warning('Seleccione al menos un día')
    return
  }
  if (formData.tiene_reemplazo && !formData.nombre_reemplazo?.trim()) {
    notify.warning('Ingrese el nombre del reemplazo')
    return
  }
  loadingProgramar.value = true
  try {
    const res = await adminService.programarVacaciones({
      empleado_id: empleadoProgramar.value.id,
      dias: formData.dias,
      tiene_reemplazo: formData.tiene_reemplazo,
      nombre_reemplazo: formData.nombre_reemplazo || null
    })
    notify.success(res.message || 'Vacaciones programadas')
    dialogProgramar.value = false
    cargarEmpleados()
  } catch (e) {
    const errors = e.response?.data?.errors
    if (errors && Array.isArray(errors)) {
      notify.error(errors.join(', '))
    } else {
      notify.error(e.response?.data?.message || 'Error al programar vacaciones')
    }
  } finally {
    loadingProgramar.value = false
  }
}

async function importarExcel({ archivo, sedeId }) {
  loadingImport.value = true
  try {
    const res = await adminService.importarEmpleados(archivo, sedeId)
    notify.success(`Importados: ${res.data.creados} nuevos, ${res.data.actualizados} actualizados`)
    dialogImport.value = false
    cargarEmpleados()
  } catch (e) {
    notify.error(e.response?.data?.message || 'Error importando')
  } finally {
    loadingImport.value = false
  }
}

async function descargarPlantilla() {
  loadingPlantilla.value = true
  try {
    await adminService.descargarPlantillaEmpleados()
    notify.success('Plantilla descargada')
  } catch {
    notify.error('Error descargando plantilla')
  } finally {
    loadingPlantilla.value = false
  }
}

// Table request handler
async function onRequest(props) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  await cargarEmpleados()
}

async function cargarEmpleados() {
  loading.value = true
  console.log('[DEBUG] cargarEmpleados - Filtros:', JSON.parse(JSON.stringify(filtros.value)))
  console.log('[DEBUG] cargarEmpleados - Sedes loaded:', sedes.value.length)
  if (sedes.value.length > 0) console.log('[DEBUG] First Sede:', sedes.value[0])
  try {
    const res = await adminService.getEmpleados({
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      buscar: filtros.value.buscar || undefined,
      saldo_negativo: filtros.value.saldo_negativo || undefined,
      sede_id: filtros.value.sede_id || undefined
    })
    empleados.value = Array.isArray(res.data?.data) ? res.data.data : []
    pagination.value.rowsNumber = res.data?.total || 0
  } catch {
    notify.error('Error cargando empleados')
  } finally {
    loading.value = false
  }
}

async function cargarSedes() {
  try {
    const res = await adminService.getSedes({ all: true })
    sedes.value = Array.isArray(res.data) ? res.data : []
  } catch {
    sedes.value = []
  }
}

onMounted(() => {
  cargarEmpleados()
  cargarSedes()
})
</script>

<style scoped>
.empleados-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(30, 136, 229, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
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

.header-title h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.header-title .subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filters-grid {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
  flex: 1;
  max-width: 280px;
}

.search-input {
  flex: 2;
  max-width: 350px;
}

.filter-checkbox {
  margin-left: 8px;
}

/* Table Card */
.empleados-page :deep(.q-card) {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .empleados-page {
    padding: 16px;
  }

  .page-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-title h1 {
    font-size: 1.4rem;
  }

  .header-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
  }

  .filters-grid {
    flex-direction: column;
  }

  .filter-item,
  .search-input {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .page-header {
    padding: 16px;
  }

  .header-title h1 {
    font-size: 1.2rem;
  }

  .title-icon {
    width: 44px;
    height: 44px;
  }
}
</style>
