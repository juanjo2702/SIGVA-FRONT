<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Gestión de Empleados</div>
      <div class="row q-gutter-sm">
        <q-btn color="secondary" icon="upload_file" label="Importar Excel" @click="dialogImport = true" unelevated
          no-caps />
        <q-btn color="primary" icon="add" label="Nuevo Empleado" @click="abrirFormulario()" unelevated no-caps />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md shadow-2">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-6 col-md-5">
            <q-input v-model="filtros.buscar" label="Buscar (CI, Nombre)" outlined dense clearable
              @update:model-value="buscarConDebounce">
              <template v-slot:prepend><q-icon name="search" /></template>
              <template v-slot:append v-if="pagination.loading"><q-spinner size="xs" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-checkbox v-model="filtros.saldo_negativo" label="Solo saldo negativo"
              @update:model-value="cargarEmpleados" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card class="shadow-2">
      <q-table :rows="pagination.data" :columns="columns" row-key="id" :loading="pagination.loading"
        :pagination="pagination.pagination" @request="onTableRequest" flat>
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
      :loading="loadingHistorial" />

    <DialogProgramarVacaciones v-model="dialogProgramar" :empleado="empleadoProgramar" :loading="loadingProgramar"
      @save="guardarProgramacion" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import adminService from '@/services/adminService'
import { useNotify } from '@/composables/useNotify'
import { usePagination } from '@/composables/usePagination'
import {
  DialogEmpleadoForm,
  DialogAjusteSaldo,
  DialogImportExcel,
  DialogHistorial,
  DialogProgramarVacaciones
} from '@/components/empleados'

// Composables
const notify = useNotify()
const pagination = usePagination(
  (params) => adminService.getEmpleados(params),
  15
)

// State
const filtros = ref({ buscar: '', saldo_negativo: false })
const sedes = ref([])

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
    historial.value = res.data?.historial || []
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
async function onTableRequest(props) {
  pagination.onRequest(props)
  await cargarEmpleados()
}

async function cargarEmpleados() {
  try {
    await pagination.cargar({
      buscar: filtros.value.buscar || undefined,
      saldo_negativo: filtros.value.saldo_negativo || undefined
    })
  } catch {
    notify.error('Error cargando empleados')
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
