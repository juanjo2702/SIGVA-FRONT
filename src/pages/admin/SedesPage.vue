<template>
  <q-page class="sedes-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="business" size="28px" />
          </div>
          <div>
            <h1>Gestión de Sedes</h1>
            <p class="subtitle">Administra las sedes de la organización</p>
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
          <q-td :props="props">
            <q-badge :color="props.row.activo ? 'positive' : 'grey'">
              {{ props.row.activo ? 'Activa' : 'Inactiva' }}
            </q-badge>
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
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ editando ? 'Editar Sede' : 'Nueva Sede' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.nombre"
            label="Nombre *"
            outlined
            dense
            :rules="[val => !!val || 'El nombre es obligatorio']"
          />
          <q-input
            v-model="form.abreviacion"
            label="Abreviación *"
            outlined
            dense
            maxlength="10"
            :rules="[val => !!val || 'La abreviación es obligatoria']"
          />
          <q-input
            v-model="form.departamento"
            label="Departamento *"
            outlined
            dense
            :rules="[val => !!val || 'El departamento es obligatorio']"
          />
          <q-toggle v-model="form.activo" label="Activa" />
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
  { name: 'abreviacion', label: 'Abreviación', field: 'abreviacion', align: 'left' },
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
    activo: sede.activo
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
    cancel: true,
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
    sedes.value = response.data || []
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
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
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

.action-btn {
  font-weight: 500;
}

/* Table Card */
.table-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .sedes-page {
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
