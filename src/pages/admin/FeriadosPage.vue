<template>
  <q-page class="feriados-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="event" size="28px" />
          </div>
          <div>
            <h1>Gestión de Feriados</h1>
            <p class="subtitle">Administra los feriados nacionales y departamentales</p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn 
            unelevated 
            color="secondary"
            icon="add" 
            label="Nuevo Feriado" 
            no-caps
            class="action-btn"
            @click="mostrarCrear"
          />
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-grid">
        <q-select 
          v-model="filtros.tipo" 
          :options="tipoOptions" 
          label="Tipo" 
          emit-value 
          map-options 
          outlined 
          dense
          clearable 
          class="filter-item"
          @update:model-value="cargarFeriados"
        >
          <template v-slot:prepend>
            <q-icon name="category" color="primary" />
          </template>
        </q-select>
        
        <q-select 
          v-model="filtros.sede_id" 
          :options="sedesOptions" 
          label="Sede" 
          emit-value 
          map-options 
          outlined
          dense 
          clearable 
          class="filter-item"
          @update:model-value="cargarFeriados"
        >
          <template v-slot:prepend>
            <q-icon name="location_on" color="primary" />
          </template>
        </q-select>
        
        <q-input 
          v-model="filtros.ano" 
          label="Año" 
          type="number" 
          outlined 
          dense
          class="filter-item filter-year"
          @update:model-value="buscarConDebounce"
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today" color="primary" />
          </template>
          <template v-slot:append v-if="loading">
            <q-spinner size="xs" color="primary" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="table-card">
      <q-table :rows="feriados" :columns="columns" row-key="id" :loading="loading" flat :pagination="{ rowsPerPage: 20 }">
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">{{ formatDate(props.row.fecha) }}</q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-badge :color="props.row.tipo === 'nacional' ? 'primary' : 'orange'">
              {{ props.row.tipo === 'nacional' ? 'Nacional' : 'Departamental' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-sede="props">
          <q-td :props="props">{{ props.row.sede?.nombre || '-' }}</q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-icon :name="props.row.activo ? 'check_circle' : 'cancel'" :color="props.row.activo ? 'positive' : 'grey'" />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn size="sm" round flat color="orange" icon="sync" @click="procesarDevoluciones(props.row)" :loading="loadingProc === props.row.id">
              <q-tooltip>Procesar Devoluciones</q-tooltip>
            </q-btn>
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
          <q-input v-model="form.nombre" label="Nombre del feriado *" outlined dense :rules="[val => !!val || 'El nombre es obligatorio']" />
          <q-input v-model="form.fecha" label="Fecha *" type="date" outlined dense :rules="[val => !!val || 'La fecha es obligatoria']" />
          <q-select v-model="form.tipo" :options="[
            { value: 'nacional', label: 'Nacional (aplica a todas las sedes)' },
            { value: 'departamental', label: 'Departamental (solo una sede)' }
          ]" label="Tipo *" emit-value map-options outlined dense />
          <q-select v-if="form.tipo === 'departamental'" v-model="form.sede_id" :options="sedesOptions" label="Sede *" emit-value map-options outlined dense />
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

const buscarConDebounce = useDebounceFn(() => { cargarFeriados() }, 300)

const loading = ref(false)
const loadingGuardar = ref(false)
const loadingProc = ref(null)
const feriados = ref([])
const sedes = ref([])
const dialogForm = ref(false)
const editando = ref(false)
const feriadoActual = ref(null)

const filtros = ref({ tipo: null, sede_id: null, ano: new Date().getFullYear() })
const form = ref({ nombre: '', fecha: '', tipo: 'nacional', sede_id: null, activo: true })

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
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('T')[0].split('-')
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  }
  return new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function resetForm() {
  form.value = { nombre: '', fecha: '', tipo: 'nacional', sede_id: null, activo: true }
  feriadoActual.value = null
  editando.value = false
}

function mostrarCrear() { resetForm(); dialogForm.value = true }

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
    if (data.tipo === 'nacional') data.sede_id = null
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
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al guardar feriado' })
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
    sedes.value = []
    sedesOptions.value = []
  }
}

async function cargarFeriados() {
  loading.value = true
  try {
    const params = { ano: filtros.value.ano, all: true }
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

async function procesarDevoluciones(feriado) {
  loadingProc.value = feriado.id
  try {
    const preview = await adminService.previewAfectadosFeriado(feriado.id)
    if (!preview.data.total_empleados || preview.data.total_empleados === 0) {
      $q.notify({ type: 'info', message: 'No hay empleados con vacaciones en esta fecha.' })
      loadingProc.value = null
      return
    }
    $q.dialog({
      title: 'Procesar Devoluciones',
      message: `Se devolverán ${preview.data.total_dias} días a ${preview.data.total_empleados} empleados. ¿Continuar?`,
      ok: { label: 'Procesar', color: 'primary' },
      cancel: { label: 'Cancelar', flat: true },
      persistent: true
    }).onOk(async () => {
      try {
        const result = await adminService.procesarDevolucionesFeriado(feriado.id)
        $q.notify({ type: 'positive', message: result.message, timeout: 5000 })
      } catch (err) {
        $q.notify({ type: 'negative', message: 'Error al procesar devoluciones' })
      }
    })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al obtener información' })
  } finally {
    loadingProc.value = null
  }
}

onMounted(() => { cargarSedes(); cargarFeriados() })
</script>

<style scoped>
.feriados-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(234, 88, 12, 0.3);
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

.header-actions { display: flex; gap: 12px; }
.action-btn { font-weight: 500; }

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

.filter-item { min-width: 180px; flex: 1; max-width: 220px; }
.filter-year { max-width: 140px; }

.table-card { border-radius: 12px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }

@media (max-width: 768px) {
  .feriados-page { padding: 16px; }
  .page-header { padding: 20px; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .header-title h1 { font-size: 1.4rem; }
  .header-actions { width: 100%; }
  .action-btn { flex: 1; }
  .filters-grid { flex-direction: column; }
  .filter-item, .filter-year { width: 100%; max-width: 100%; }
}

@media (max-width: 576px) {
  .page-header { padding: 16px; }
  .header-title h1 { font-size: 1.2rem; }
  .title-icon { width: 44px; height: 44px; }
}
</style>
