<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">
        <q-icon name="event" class="q-mr-sm" />
        Gestión de Feriados
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo Feriado" @click="mostrarCrear" no-caps unelevated />
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md shadow-2">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-4">
            <q-select v-model="filtros.tipo" :options="tipoOptions" label="Tipo" emit-value map-options outlined dense
              clearable @update:model-value="cargarFeriados" />
          </div>
          <div class="col-12 col-sm-4">
            <q-select v-model="filtros.sede_id" :options="sedesOptions" label="Sede" emit-value map-options outlined
              dense clearable @update:model-value="cargarFeriados" />
          </div>
          <div class="col-12 col-sm-3">
            <q-input v-model="filtros.ano" label="Año" type="number" outlined dense
              @update:model-value="buscarConDebounce">
              <template v-slot:append v-if="loading"><q-spinner size="xs" /></template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card class="shadow-2">
      <q-table :rows="feriados" :columns="columns" row-key="id" :loading="loading" flat
        :pagination="{ rowsPerPage: 20 }">
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha) }}
          </q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-badge :color="props.row.tipo === 'nacional' ? 'primary' : 'orange'">
              {{ props.row.tipo === 'nacional' ? 'Nacional' : 'Departamental' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-sede="props">
          <q-td :props="props">
            {{ props.row.sede?.nombre || '-' }}
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-icon :name="props.row.activo ? 'check_circle' : 'cancel'"
              :color="props.row.activo ? 'positive' : 'grey'" />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn size="sm" round flat color="primary" icon="edit" @click="mostrarEditar(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn size="sm" round flat color="negative" icon="delete" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog crear/editar -->
    <q-dialog v-model="dialogForm" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ editando ? 'Editar Feriado' : 'Nuevo Feriado' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.nombre" label="Nombre del feriado *" outlined dense
            :rules="[val => !!val || 'El nombre es obligatorio']" />

          <q-input v-model="form.fecha" label="Fecha *" type="date" outlined dense
            :rules="[val => !!val || 'La fecha es obligatoria']" />

          <q-select v-model="form.tipo" :options="[
            { value: 'nacional', label: 'Nacional (aplica a todas las sedes)' },
            { value: 'departamental', label: 'Departamental (solo una sede)' }
          ]" label="Tipo *" emit-value map-options outlined dense />

          <q-select v-if="form.tipo === 'departamental'" v-model="form.sede_id" :options="sedesOptions" label="Sede *"
            emit-value map-options outlined dense
            :rules="[val => !!val || 'La sede es obligatoria para feriados departamentales']" />

          <q-toggle v-model="form.activo" label="Activo" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardar" :loading="loadingGuardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useDebounceFn } from '@vueuse/core'
import adminService from '@/services/adminService'

const $q = useQuasar()

// Debounce para filtro de año
const buscarConDebounce = useDebounceFn(() => {
  cargarFeriados()
}, 300)

const loading = ref(false)
const loadingGuardar = ref(false)
const feriados = ref([])
const sedes = ref([])
const dialogForm = ref(false)
const editando = ref(false)
const feriadoActual = ref(null)

const filtros = ref({
  tipo: null,
  sede_id: null,
  ano: new Date().getFullYear()
})

const form = ref({
  nombre: '',
  fecha: '',
  tipo: 'nacional',
  sede_id: null,
  activo: true
})

const tipoOptions = [
  { value: 'nacional', label: 'Nacionales' },
  { value: 'departamental', label: 'Departamentales' }
]

const sedesOptions = ref([])

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', align: 'center' },
  { name: 'sede', label: 'Sede', align: 'left' },
  { name: 'activo', label: 'Activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  // Parsear fecha sin problemas de timezone
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('T')[0].split('-')
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  }
  return new Date(dateStr).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function resetForm() {
  form.value = {
    nombre: '',
    fecha: '',
    tipo: 'nacional',
    sede_id: null,
    activo: true
  }
  feriadoActual.value = null
  editando.value = false
}

function mostrarCrear() {
  resetForm()
  dialogForm.value = true
}

function mostrarEditar(feriado) {
  feriadoActual.value = feriado
  editando.value = true
  form.value = {
    nombre: feriado.nombre,
    fecha: feriado.fecha?.split('T')[0] || feriado.fecha,
    tipo: feriado.tipo,
    sede_id: feriado.sede_id,
    activo: feriado.activo
  }
  dialogForm.value = true
}

async function guardar() {
  if (!form.value.nombre || !form.value.fecha || !form.value.tipo) {
    $q.notify({ type: 'warning', message: 'Complete todos los campos obligatorios' })
    return
  }

  if (form.value.tipo === 'departamental' && !form.value.sede_id) {
    $q.notify({ type: 'warning', message: 'Seleccione una sede para el feriado departamental' })
    return
  }

  loadingGuardar.value = true
  try {
    const data = { ...form.value }
    if (data.tipo === 'nacional') {
      data.sede_id = null
    }

    if (editando.value) {
      await adminService.actualizarFeriado(feriadoActual.value.id, data)
      $q.notify({ type: 'positive', message: 'Feriado actualizado correctamente' })
    } else {
      await adminService.crearFeriado(data)
      $q.notify({ type: 'positive', message: 'Feriado creado correctamente' })
    }
    dialogForm.value = false
    cargarFeriados()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar feriado'
    $q.notify({ type: 'negative', message })
  } finally {
    loadingGuardar.value = false
  }
}

function confirmarEliminar(feriado) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar "${feriado.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await adminService.eliminarFeriado(feriado.id)
      $q.notify({ type: 'positive', message: 'Feriado eliminado correctamente' })
      cargarFeriados()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar feriado' })
    }
  })
}

async function cargarSedes() {
  try {
    const response = await adminService.getSedes({ all: true })
    sedes.value = Array.isArray(response.data) ? response.data : []
    sedesOptions.value = sedes.value.map(s => ({ value: s.id, label: s.nombre }))
  } catch (error) {
    console.error('Error cargando sedes:', error)
    sedes.value = []
    sedesOptions.value = []
  }
}

async function cargarFeriados() {
  loading.value = true
  try {
    const params = {
      ano: filtros.value.ano,
      all: true
    }
    if (filtros.value.tipo) params.tipo = filtros.value.tipo
    if (filtros.value.sede_id) params.sede_id = filtros.value.sede_id

    const response = await adminService.getFeriados(params)
    feriados.value = response.data || []
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar feriados' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarSedes()
  cargarFeriados()
})
</script>
