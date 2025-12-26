<template>
  <q-page class="roles-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="admin_panel_settings" size="28px" />
          </div>
          <div>
            <h1>Gestión de Roles</h1>
            <p class="subtitle">Administra los roles del sistema</p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn 
            unelevated 
            color="secondary"
            icon="add" 
            label="Nuevo Rol" 
            no-caps
            class="action-btn"
            @click="abrirDialogoCrear"
          />
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="table-card">
      <q-table
        :rows="roles"
        :columns="columnas"
        row-key="id"
        :loading="loading"
        :pagination="paginacion"
        @request="onRequest"
        flat
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
            <q-btn flat round dense icon="edit" color="primary" @click="abrirDialogoEditar(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn v-if="!props.row.usuarios_count" flat round dense icon="delete" color="negative" @click="confirmarEliminar(props.row)">
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
          <div class="text-h6">{{ modoEdicion ? 'Editar Rol' : 'Nuevo Rol' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="guardarRol" class="q-gutter-md">
            <q-input v-model="formRol.nombre" label="Nombre del Rol *" outlined dense :rules="[val => !!val || 'El nombre es obligatorio']" />
            <q-input v-model="formRol.descripcion" label="Descripción" outlined dense type="textarea" rows="2" />
            <q-toggle v-if="modoEdicion" v-model="formRol.activo" label="Rol activo" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated :label="modoEdicion ? 'Guardar' : 'Crear'" color="primary" :loading="guardando" @click="guardarRol" />
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

const roles = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogoRol = ref(false)
const modoEdicion = ref(false)

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

const formRol = ref({ nombre: '', descripcion: '', activo: true })

async function cargarRoles() {
  loading.value = true
  try {
    const params = { page: paginacion.value.page, por_pagina: paginacion.value.rowsPerPage }
    const response = await rolService.getRoles(params)
    roles.value = response.data.data
    paginacion.value.rowsNumber = response.data.total
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar roles' })
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
  formRol.value = { nombre: '', descripcion: '', activo: true }
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
      $q.notify({ type: 'positive', message: 'Rol actualizado correctamente' })
    } else {
      await rolService.crearRol(formRol.value)
      $q.notify({ type: 'positive', message: 'Rol creado correctamente' })
    }
    dialogoRol.value = false
    cargarRoles()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al guardar rol' })
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
      $q.notify({ type: 'positive', message: 'Rol eliminado correctamente' })
      cargarRoles()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al eliminar rol' })
    }
  })
}

onMounted(() => { cargarRoles() })
</script>

<style scoped>
.roles-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(13, 148, 136, 0.3);
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
.table-card { border-radius: 12px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }

@media (max-width: 768px) {
  .roles-page { padding: 16px; }
  .page-header { padding: 20px; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .header-title h1 { font-size: 1.4rem; }
  .header-actions { width: 100%; }
  .action-btn { flex: 1; }
}

@media (max-width: 576px) {
  .page-header { padding: 16px; }
  .header-title h1 { font-size: 1.2rem; }
  .title-icon { width: 44px; height: 44px; }
}
</style>
