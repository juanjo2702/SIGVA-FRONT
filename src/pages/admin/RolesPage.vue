<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none">Gestión de Roles</h4>
        <p class="text-grey-7 q-mb-none">Administra los roles del sistema</p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Rol"
          unelevated
          no-caps
          @click="abrirDialogoCrear"
        />
      </div>
    </div>

    <!-- Tabla -->
    <q-card flat bordered>
      <q-table
        :rows="roles"
        :columns="columnas"
        row-key="id"
        :loading="loading"
        :pagination="paginacion"
        @request="onRequest"
        flat
        bordered
      >
        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.activo ? 'positive' : 'negative'"
              :label="props.row.activo ? 'Activo' : 'Inactivo'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-usuarios_count="props">
          <q-td :props="props">
            <q-badge color="info" :label="props.row.usuarios_count || 0" />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              @click="abrirDialogoEditar(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="!props.row.usuarios_count"
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmarEliminar(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width text-center q-pa-lg text-grey-6">
            <q-icon name="badge" size="48px" />
            <div class="q-mt-sm">No se encontraron roles</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar -->
    <q-dialog v-model="dialogoRol" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ modoEdicion ? 'Editar Rol' : 'Nuevo Rol' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="guardarRol" class="q-gutter-md">
            <q-input
              v-model="formRol.nombre"
              label="Nombre del Rol *"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es obligatorio']"
            />

            <q-input
              v-model="formRol.descripcion"
              label="Descripción"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <q-toggle
              v-if="modoEdicion"
              v-model="formRol.activo"
              label="Rol activo"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            unelevated
            :label="modoEdicion ? 'Guardar' : 'Crear'"
            color="primary"
            :loading="guardando"
            @click="guardarRol"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import rolService from '@/services/rolService'

const $q = useQuasar()

// Estado
const roles = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogoRol = ref(false)
const modoEdicion = ref(false)

// Paginación
const paginacion = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'usuarios_count', label: 'Usuarios', field: 'usuarios_count', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Formulario
const formRol = ref({
  nombre: '',
  descripcion: '',
  activo: true
})

// Métodos
async function cargarRoles() {
  loading.value = true
  try {
    const params = {
      page: paginacion.value.page,
      por_pagina: paginacion.value.rowsPerPage
    }

    const response = await rolService.getRoles(params)
    roles.value = response.data.data
    paginacion.value.rowsNumber = response.data.total
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar roles',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

function onRequest(props) {
  paginacion.value.page = props.pagination.page
  paginacion.value.rowsPerPage = props.pagination.rowsPerPage
  cargarRoles()
}

function abrirDialogoCrear() {
  modoEdicion.value = false
  formRol.value = {
    nombre: '',
    descripcion: '',
    activo: true
  }
  dialogoRol.value = true
}

function abrirDialogoEditar(rol) {
  modoEdicion.value = true
  formRol.value = { ...rol }
  dialogoRol.value = true
}

async function guardarRol() {
  guardando.value = true
  try {
    if (modoEdicion.value) {
      await rolService.actualizarRol(formRol.value.id, formRol.value)
      $q.notify({
        type: 'positive',
        message: 'Rol actualizado correctamente',
        icon: 'check_circle'
      })
    } else {
      await rolService.crearRol(formRol.value)
      $q.notify({
        type: 'positive',
        message: 'Rol creado correctamente',
        icon: 'check_circle'
      })
    }
    dialogoRol.value = false
    cargarRoles()
  } catch (error) {
    const mensaje = error.response?.data?.message || 'Error al guardar rol'
    $q.notify({
      type: 'negative',
      message: mensaje,
      icon: 'error'
    })
  } finally {
    guardando.value = false
  }
}

function confirmarEliminar(rol) {
  $q.dialog({
    title: 'Eliminar Rol',
    message: `¿Deseas eliminar el rol "${rol.nombre}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try {
      await rolService.eliminarRol(rol.id)
      $q.notify({
        type: 'positive',
        message: 'Rol eliminado correctamente',
        icon: 'check_circle'
      })
      cargarRoles()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar rol',
        icon: 'error'
      })
    }
  })
}

onMounted(() => {
  cargarRoles()
})
</script>
