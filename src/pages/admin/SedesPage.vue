<template>
  <q-page class="sedes-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="apartment" size="28px" />
          </div>
          <div>
            <h1>Gestión de Sedes</h1>
            <p class="subtitle">Administra las ubicaciones y campus universitarios</p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn 
            unelevated 
            color="secondary"
            icon="add" 
            label="Nueva Sede" 
            no-caps
            class="action-btn"
            @click="mostrarCrear"
          />
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="table-card">
      <q-table
        :rows="sedes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-activo="props">
          <q-td :props="props" align="center">
            <q-badge :color="props.row.activo ? 'positive' : 'grey'" class="q-px-md q-py-xs rounded-full">
              {{ props.row.activo ? 'Activa' : 'Inactiva' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div class="flex gap-2 justify-center">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="mostrarEditar(props.row)">
                <q-tooltip>Editar Sede</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)">
                <q-tooltip>Eliminar Sede</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal Form -->
    <q-dialog v-model="dialogForm" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 450px; border-radius: 16px;">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="text-h6 text-weight-bold flex items-center gap-2">
            <q-icon :name="editando ? 'edit' : 'add_business'" />
            {{ editando ? 'Editar Sede' : 'Nueva Sede' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg q-px-lg">
          <q-form @submit="guardar" class="q-gutter-y-md">
            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase">Nombre de la Sede</label>
              <q-input
                v-model="form.nombre"
                outlined
                dense
                placeholder="Ej: Cochabamba - Central"
                :rules="[val => !!val || 'El nombre es obligatorio']"
              />
            </div>

            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase">Departamento / Ubicación</label>
              <q-input
                v-model="form.departamento"
                outlined
                dense
                placeholder="Ej: Cochabamba"
                :rules="[val => !!val || 'El departamento es obligatorio']"
              />
            </div>

            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase">Sigla (Identificador)</label>
              <q-input
                v-model="form.abreviacion"
                outlined
                dense
                maxlength="10"
                placeholder="Ej: CBBA"
                :rules="[val => !!val || 'La sigla es obligatoria']"
              />
            </div>

            <div class="flex items-center q-mt-md">
              <q-toggle v-model="form.activo" label="Sede Activa" color="positive" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup rounded no-caps />
          <q-btn 
            label="Guardar Sede" 
            color="primary" 
            @click="guardar" 
            :loading="loadingGuardar" 
            rounded 
            unelevated 
            no-caps
            class="q-px-xl text-weight-bold" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import adminService from '@/services/adminService'

const $q = useQuasar()

const loading = ref(false)
const loadingGuardar = ref(false)
const sedes = ref([])
const dialogForm = ref(false)
const editando = ref(false)
const sedeActual = ref(null)

const form = ref({
  nombre: '',
  abreviacion: '',
  departamento: '',
  activo: true
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'abreviacion', label: 'Sigla', field: 'abreviacion', align: 'left' },
  { name: 'departamento', label: 'Departamento', field: 'departamento', align: 'left', sortable: true },
  { name: 'activo', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

function resetForm() {
  form.value = {
    nombre: '',
    abreviacion: '',
    departamento: '',
    activo: true
  }
  sedeActual.value = null
  editando.value = false
}

function mostrarCrear() {
  resetForm()
  dialogForm.value = true
}

function mostrarEditar(sede) {
  sedeActual.value = sede
  editando.value = true
  form.value = {
    nombre: sede.nombre,
    abreviacion: sede.abreviacion,
    departamento: sede.departamento,
    activo: !!sede.activo
  }
  dialogForm.value = true
}

async function guardar() {
  if (!form.value.nombre || !form.value.abreviacion || !form.value.departamento) {
    $q.notify({ type: 'warning', message: 'Complete todos los campos obligatorios' })
    return
  }

  loadingGuardar.value = true
  try {
    if (editando.value) {
      await adminService.actualizarSede(sedeActual.value.id, form.value)
      $q.notify({ type: 'positive', message: 'Sede actualizada correctamente' })
    } else {
      await adminService.crearSede(form.value)
      $q.notify({ type: 'positive', message: 'Sede creada correctamente' })
    }
    dialogForm.value = false
    cargarSedes()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar sede'
    $q.notify({ type: 'negative', message })
  } finally {
    loadingGuardar.value = false
  }
}

function confirmarEliminar(sede) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar la sede "${sede.nombre}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(async () => {
    try {
      await adminService.eliminarSede(sede.id)
      $q.notify({ type: 'positive', message: 'Sede eliminada correctamente' })
      cargarSedes()
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar sede'
      $q.notify({ type: 'negative', message })
    }
  })
}

async function cargarSedes() {
  loading.value = true
  try {
    const response = await adminService.getSedes({ all: true })
    // Adaptar si viene envuelto en objeto data
    sedes.value = response.data || response || []
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar sedes' })
  } finally {
    loading.value = false
  }
}

onMounted(cargarSedes)
</script>

<style scoped>
.sedes-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #663399 0%, #441177 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(102, 51, 153, 0.3);
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
}

/* Table Card */
.table-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.q-table__card) {
  box-shadow: none;
}

:deep(.q-table thead tr) {
  background: #f1f5f9;
}

:deep(.q-table th) {
  font-weight: 700;
  text-transform: uppercase;
  color: #475569;
  letter-spacing: 0.5px;
}

/* Responsive */
@media (max-width: 768px) {
  .sedes-page { padding: 16px; }
  .page-header { padding: 20px; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .header-title h1 { font-size: 1.4rem; }
  .header-actions { width: 100%; }
}
</style>
