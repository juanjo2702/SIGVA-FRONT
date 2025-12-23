<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Gestión de Empleados</div>
      <div class="row q-gutter-sm">
        <q-btn color="secondary" icon="upload_file" label="Importar Excel" @click="dialogImport = true" unelevated no-caps />
        <q-btn color="primary" icon="add" label="Nuevo Empleado" @click="abrirFormulario()" unelevated no-caps />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md shadow-2">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-4">
            <q-input v-model="filtros.buscar" label="Buscar (CI, Nombre)" outlined dense clearable @keyup.enter="cargarEmpleados">
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-3">
            <q-checkbox v-model="filtros.saldo_negativo" label="Solo saldo negativo" />
          </div>
          <div class="col-12 col-sm-2">
            <q-btn color="primary" icon="search" label="Buscar" @click="cargarEmpleados" unelevated no-caps />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card class="shadow-2">
      <q-table
        :rows="empleados"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        flat
      >
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nombre_completo }}</div>
            <div class="text-caption text-grey">{{ props.row.cargo }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-saldo="props">
          <q-td :props="props">
            <q-badge :color="props.row.saldo_vacaciones < 0 ? 'negative' : props.row.saldo_vacaciones === 0 ? 'warning' : 'positive'">
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

    <!-- Dialog Formulario -->
    <q-dialog v-model="dialogForm" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ empleadoEditar ? 'Editar' : 'Nuevo' }} Empleado</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarEmpleado" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="form.apellido_paterno" label="Primer Apellido *" outlined dense :rules="[v => !!v || 'Requerido']" />
              </div>
              <div class="col-6">
                <q-input v-model="form.apellido_materno" label="Segundo Apellido" outlined dense />
              </div>
            </div>
            <q-input v-model="form.nombres" label="Nombres *" outlined dense :rules="[v => !!v || 'Requerido']" />
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="form.ci" label="C.I. *" outlined dense :rules="[v => !!v || 'Requerido']" />
              </div>
              <div class="col-6">
                <q-input v-model="form.cargo" label="Cargo *" outlined dense :rules="[v => !!v || 'Requerido']" />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select
                  v-model="form.genero"
                  label="Género"
                  :options="opcionesGenero"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="form.tipo_contrato"
                  label="Tipo de Contrato"
                  :options="opcionesTipoContrato"
                  emit-value
                  map-options
                  outlined
                  dense
                />
              </div>
            </div>
            <q-select
              v-model="form.sede_id"
              label="Sede"
              :options="sedesOptions"
              emit-value
              map-options
              outlined
              dense
              clearable
            />
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="form.fecha_ingreso" label="Fecha Ingreso *" type="date" outlined dense :rules="[v => !!v || 'Requerido']" />
              </div>
              <div class="col-6" v-if="!empleadoEditar">
                <q-input v-model.number="form.saldo_vacaciones" label="Saldo Inicial" type="number" step="0.5" outlined dense />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarEmpleado" :loading="loadingAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Ajuste Saldo -->
    <q-dialog v-model="dialogAjuste">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Ajustar Saldo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p><strong>{{ empleadoAjuste?.nombre_completo }}</strong></p>
          <p class="q-mb-md">Saldo actual: <strong>{{ empleadoAjuste?.saldo_vacaciones }}</strong> días</p>
          
          <q-input v-model.number="ajuste.nuevo_saldo" label="Nuevo Saldo" type="number" step="0.5" outlined />
          <q-input v-model="ajuste.descripcion" label="Motivo del ajuste *" type="textarea" rows="2" outlined class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Ajustar" @click="guardarAjuste" :loading="loadingAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Importar Excel -->
    <q-dialog v-model="dialogImport">
      <q-card style="min-width: 550px">
        <q-card-section class="row items-center bg-secondary text-white">
          <q-icon name="upload_file" size="md" class="q-mr-sm" />
          <div class="text-h6">Importar Empleados desde Excel</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pb-none">
          <!-- Paso 1: Seleccionar Sede -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              <q-icon name="looks_one" color="primary" class="q-mr-xs" />
              Seleccionar Sede
            </div>
            <q-select
              v-model="importSedeId"
              label="Sede a asignar a todos los empleados *"
              :options="sedesOptions"
              emit-value
              map-options
              outlined
              dense
              :rules="[v => !!v || 'Seleccione una sede']"
            >
              <template v-slot:prepend><q-icon name="business" /></template>
            </q-select>
            <div class="text-caption text-grey-7 q-mt-xs">
              Todos los empleados importados serán asignados a esta sede
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Paso 2: Archivo -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              <q-icon name="looks_two" color="primary" class="q-mr-xs" />
              Seleccionar Archivo
            </div>
            <q-file 
              v-model="archivoImport" 
              label="Archivo Excel (.xlsx, .xls, .csv)" 
              accept=".xlsx,.xls,.csv" 
              outlined
              dense
            >
              <template v-slot:prepend><q-icon name="attach_file" /></template>
              <template v-slot:append v-if="archivoImport">
                <q-icon name="check_circle" color="positive" />
              </template>
            </q-file>
          </div>

          <q-separator class="q-my-md" />

          <!-- Información de columnas -->
          <q-expansion-item
            icon="help_outline"
            label="Columnas requeridas en el Excel"
            caption="Click para ver formato"
            header-class="text-primary"
          >
            <q-card flat bordered class="q-mt-sm">
              <q-card-section class="q-pa-sm">
                <div class="text-caption">
                  <ul class="q-ma-none q-pl-md">
                    <li><strong>1° Apellido</strong> - Apellido paterno (obligatorio)</li>
                    <li><strong>2° Apellido</strong> - Apellido materno (opcional)</li>
                    <li><strong>Nombres</strong> - Nombres del empleado (obligatorio)</li>
                    <li><strong>CI</strong> - Carnet de identidad (obligatorio)</li>
                    <li><strong>Género</strong> - Masculino / Femenino (opcional)</li>
                    <li><strong>Tipo Contrato</strong> - Completo / Medio Tiempo (opcional)</li>
                    <li><strong>Cargo</strong> - Cargo del empleado (opcional)</li>
                    <li><strong>Fecha de Ingreso</strong> - DD/MM/AAAA (obligatorio)</li>
                    <li><strong>Saldo de Días</strong> - Saldo inicial de vacaciones (opcional)</li>
                  </ul>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <div class="q-mt-md">
            <q-btn 
              flat 
              color="primary" 
              icon="download" 
              label="Descargar Plantilla de Ejemplo" 
              @click="descargarPlantilla" 
              :loading="loadingPlantilla"
              no-caps
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn 
            color="primary" 
            icon="upload" 
            label="Importar Empleados" 
            @click="importarExcel" 
            :loading="loadingImport" 
            :disable="!archivoImport || !importSedeId"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Historial -->
    <q-dialog v-model="dialogHistorial" maximized>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Historial: {{ empleadoHistorial?.nombre_completo }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-timeline color="primary">
            <q-timeline-entry v-for="h in historial" :key="h.id" :subtitle="formatDateTime(h.created_at)">
              <template v-slot:title>
                {{ traducirTipoCambio(h.tipo_cambio) }}
              </template>
              <div>
                {{ h.dias_anteriores }} → {{ h.dias_nuevos }} días 
                (<span :class="h.dias_cambio >= 0 ? 'text-positive' : 'text-negative'">
                  {{ h.dias_cambio >= 0 ? '+' : '' }}{{ h.dias_cambio }}
                </span>)
              </div>
              <div class="text-caption text-grey" v-if="h.descripcion">{{ h.descripcion }}</div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Programar Vacaciones -->
    <q-dialog v-model="dialogProgramar">
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="beach_access" size="sm" class="q-mr-sm" />
          <div class="text-h6">Programar Vacaciones</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <div class="text-subtitle1 text-weight-medium">{{ empleadoProgramar?.nombre_completo }}</div>
            <div class="text-caption">
              CI: {{ empleadoProgramar?.ci }} | 
              {{ empleadoProgramar?.genero || 'Sin género' }} | 
              {{ empleadoProgramar?.tipo_contrato === 'medio_tiempo' ? 'Medio Tiempo' : 'Tiempo Completo' }}
            </div>
            <q-badge :color="empleadoProgramar?.saldo_vacaciones < 0 ? 'negative' : 'positive'" class="q-mt-xs">
              Saldo: {{ empleadoProgramar?.saldo_vacaciones }} días
            </q-badge>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Calendario interactivo -->
          <CalendarioVacaciones
            v-if="empleadoProgramar"
            :empleado="empleadoProgramar"
            v-model="programar.dias"
            @change="onCalendarioChange"
          />

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Reemplazo</div>
          <q-toggle
            v-model="programar.tiene_reemplazo"
            label="¿Hay reemplazo para este empleado?"
          />
          <q-input
            v-if="programar.tiene_reemplazo"
            v-model="programar.nombre_reemplazo"
            label="Nombre del Reemplazo *"
            outlined
            dense
            class="q-mt-sm"
          />

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Opciones del Formulario</div>
          <q-toggle
            v-model="programar.mostrar_por_etapas"
            label="Mostrar por etapas en el formulario"
          />
          <div class="text-caption text-grey-7">
            Si está activo, el formulario mostrará cada bloque de días consecutivos como una etapa separada.
          </div>

          <q-banner class="bg-info text-white q-mt-md" rounded>
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            Las vacaciones quedarán pendientes hasta que el empleado entregue el documento firmado.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn 
            color="primary" 
            label="Programar Vacaciones" 
            @click="guardarProgramacion" 
            :loading="loadingProgramar"
            :disable="!programar.dias || programar.dias.length === 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import adminService from '@/services/adminService'
import CalendarioVacaciones from '@/components/CalendarioVacaciones.vue'

const $q = useQuasar()

const loading = ref(false)
const loadingAction = ref(false)
const loadingImport = ref(false)
const loadingProgramar = ref(false)
const loadingPlantilla = ref(false)
const empleados = ref([])

const filtros = ref({ buscar: '', saldo_negativo: false })
const pagination = ref({ page: 1, rowsPerPage: 15, rowsNumber: 0 })

const dialogForm = ref(false)
const dialogAjuste = ref(false)
const dialogImport = ref(false)
const dialogHistorial = ref(false)
const dialogProgramar = ref(false)

const empleadoEditar = ref(null)
const empleadoAjuste = ref(null)
const empleadoHistorial = ref(null)
const empleadoProgramar = ref(null)
const historial = ref([])
const archivoImport = ref(null)
const importSedeId = ref(null)
const sedes = ref([])

const form = ref({ apellido_paterno: '', apellido_materno: '', nombres: '', ci: '', genero: null, tipo_contrato: 'completo', sede_id: null, cargo: '', fecha_ingreso: '', saldo_vacaciones: 0 })
const ajuste = ref({ nuevo_saldo: 0, descripcion: '' })
const programar = ref({ dias: [], tiene_reemplazo: false, nombre_reemplazo: '', mostrar_por_etapas: false })
const calendarioInfo = ref({ total: 0, saldoResultante: 0 })

const today = computed(() => new Date().toISOString().split('T')[0])

const tiposVacacion = [
  { label: 'Día Completo', value: 'completo' },
  { label: 'Medio Día - Mañana', value: 'parcial_manana' },
  { label: 'Medio Día - Tarde', value: 'parcial_tarde' }
]

const opcionesGenero = [
  { label: 'Masculino', value: 'Masculino' },
  { label: 'Femenino', value: 'Femenino' }
]

const opcionesTipoContrato = [
  { label: 'Tiempo Completo', value: 'completo' },
  { label: 'Medio Tiempo', value: 'medio_tiempo' }
]

const sedesOptions = computed(() => 
  sedes.value.map(s => ({ label: s.nombre, value: s.id }))
)

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

function formatDate(d) { return d ? new Date(d).toLocaleDateString('es-BO') : '-' }
function formatDateTime(d) { return d ? new Date(d).toLocaleString('es-BO') : '-' }

function traducirTipoCambio(tipo) {
  return { suma_anual: 'Suma Anual', solicitud_aprobada: 'Solicitud Aprobada', ajuste_manual: 'Ajuste Manual', importacion: 'Importación' }[tipo] || tipo
}

function abrirFormulario(emp = null) {
  empleadoEditar.value = emp
  if (emp) {
    form.value = { ...emp, sede_id: emp.sede_id || emp.sede?.id || null }
  } else {
    form.value = { apellido_paterno: '', apellido_materno: '', nombres: '', ci: '', genero: null, tipo_contrato: 'completo', sede_id: null, cargo: '', fecha_ingreso: '', saldo_vacaciones: 0 }
  }
  dialogForm.value = true
}

function abrirAjuste(emp) {
  empleadoAjuste.value = emp
  ajuste.value = { nuevo_saldo: emp.saldo_vacaciones, descripcion: '' }
  dialogAjuste.value = true
}

async function verHistorial(emp) {
  empleadoHistorial.value = emp
  try {
    const res = await adminService.getHistorialEmpleado(emp.id)
    historial.value = res.data?.historial || []
  } catch { historial.value = [] }
  dialogHistorial.value = true
}

function abrirProgramar(emp) {
  empleadoProgramar.value = emp
  programar.value = { 
    dias: [], 
    tiene_reemplazo: false,
    nombre_reemplazo: '',
    mostrar_por_etapas: false
  }
  calendarioInfo.value = { total: 0, saldoResultante: emp.saldo_vacaciones }
  dialogProgramar.value = true
}

function onCalendarioChange(info) {
  calendarioInfo.value = info
}

async function guardarProgramacion() {
  if (!programar.value.dias || programar.value.dias.length === 0) {
    $q.notify({ type: 'warning', message: 'Seleccione al menos un día en el calendario' })
    return
  }

  if (programar.value.tiene_reemplazo && !programar.value.nombre_reemplazo.trim()) {
    $q.notify({ type: 'warning', message: 'Ingrese el nombre del reemplazo' })
    return
  }

  loadingProgramar.value = true
  try {
    const res = await adminService.programarVacaciones({
      empleado_id: empleadoProgramar.value.id,
      dias: programar.value.dias,
      tiene_reemplazo: programar.value.tiene_reemplazo,
      nombre_reemplazo: programar.value.nombre_reemplazo || null,
      mostrar_por_etapas: programar.value.mostrar_por_etapas || false
    })
    
    $q.notify({ 
      type: 'positive', 
      message: res.message || 'Vacaciones programadas. Pendiente documento.' 
    })
    
    dialogProgramar.value = false
    cargarEmpleados()
  } catch (e) {
    const errors = e.response?.data?.errors
    if (errors && Array.isArray(errors)) {
      $q.notify({ type: 'negative', message: errors.join(', ') })
    } else {
      $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al programar vacaciones' })
    }
  } finally {
    loadingProgramar.value = false
  }
}

async function guardarEmpleado() {
  loadingAction.value = true
  try {
    if (empleadoEditar.value) {
      await adminService.actualizarEmpleado(empleadoEditar.value.id, form.value)
    } else {
      await adminService.crearEmpleado(form.value)
    }
    $q.notify({ type: 'positive', message: 'Empleado guardado' })
    dialogForm.value = false
    cargarEmpleados()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error' })
  } finally { loadingAction.value = false }
}

async function guardarAjuste() {
  if (!ajuste.value.descripcion.trim()) {
    $q.notify({ type: 'warning', message: 'Ingrese el motivo' })
    return
  }
  loadingAction.value = true
  try {
    await adminService.ajustarSaldo(empleadoAjuste.value.id, ajuste.value.nuevo_saldo, ajuste.value.descripcion)
    $q.notify({ type: 'positive', message: 'Saldo ajustado' })
    dialogAjuste.value = false
    cargarEmpleados()
  } catch { $q.notify({ type: 'negative', message: 'Error' }) }
  finally { loadingAction.value = false }
}

async function importarExcel() {
  if (!importSedeId.value) {
    $q.notify({ type: 'warning', message: 'Seleccione una sede para asignar a los empleados' })
    return
  }
  loadingImport.value = true
  try {
    const res = await adminService.importarEmpleados(archivoImport.value, importSedeId.value)
    $q.notify({ type: 'positive', message: `Importados: ${res.data.creados} nuevos, ${res.data.actualizados} actualizados` })
    dialogImport.value = false
    archivoImport.value = null
    importSedeId.value = null
    cargarEmpleados()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error importando' })
  } finally { loadingImport.value = false }
}

async function descargarPlantilla() {
  loadingPlantilla.value = true
  try {
    await adminService.descargarPlantillaEmpleados()
    $q.notify({ type: 'positive', message: 'Plantilla descargada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error descargando plantilla' })
  } finally { loadingPlantilla.value = false }
}

async function onRequest(props) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  await cargarEmpleados()
}

async function cargarEmpleados() {
  loading.value = true
  try {
    const res = await adminService.getEmpleados({
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      buscar: filtros.value.buscar || undefined,
      saldo_negativo: filtros.value.saldo_negativo || undefined
    })
    empleados.value = res.data?.data || []
    pagination.value.rowsNumber = res.data?.total || 0
  } catch { $q.notify({ type: 'negative', message: 'Error cargando' }) }
  finally { loading.value = false }
}

async function cargarSedes() {
  try {
    const res = await adminService.getSedes()
    sedes.value = res.data || []
  } catch { sedes.value = [] }
}

onMounted(() => {
  cargarEmpleados()
  cargarSedes()
})
</script>
