<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">
        <q-icon name="business" class="q-mr-sm" />
        Gestión de Sedes
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nueva Sede" @click="mostrarCrear" no-caps unelevated />
    </div>

    <!-- Tabla -->
    <q-card class="shadow-2">
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
