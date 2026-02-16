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
            <p class="subtitle">Administra los roles y privilegios del sistema SIGVA</p>
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
        <template v-slot:body-cell-usuarios_count="props">
          <q-td :props="props" align="center">
            <q-badge color="info" :label="props.row.usuarios_count || 0" />
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props" align="center">
            <q-badge :color="props.row.activo ? 'positive' : 'grey'" class="q-px-md q-py-xs rounded-full">
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div class="flex gap-2 justify-center">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="abrirDialogoEditar(props.row)">
                <q-tooltip>Editar Rol</q-tooltip>
              </q-btn>
              <q-btn v-if="!props.row.usuarios_count" flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)">
                <q-tooltip>Eliminar Rol</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar -->
    <q-dialog v-model="dialogoRol" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 450px; border-radius: 16px;">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="text-h6 text-weight-bold flex items-center gap-2">
            <q-icon :name="modoEdicion ? 'edit' : 'add_moderator'" />
            {{ modoEdicion ? 'Editar Rol' : 'Nuevo Rol' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg q-px-lg">
          <q-form @submit="guardarRol" class="q-gutter-y-md">
            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider">Nombre del Rol</label>
              <q-input
                v-model="formRol.nombre"
                outlined
                dense
                placeholder="Ej: Administrador, Supervisor..."
                :rules="[val => !!val || 'El nombre es obligatorio']"
              />
            </div>

            <div class="input-group">
              <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider">Descripción</label>
              <q-input
                v-model="formRol.descripcion"
                outlined
                dense
                type="textarea"
                rows="2"
                placeholder="Breve descripción de las funciones"
              />
            </div>

            <div class="flex items-center q-mt-md">
              <q-toggle v-model="formRol.activo" label="Rol Activo" color="positive" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup rounded no-caps />
          <q-btn 
            label="Guardar Rol" 
            color="primary" 
            @click="guardarRol" 
            :loading="guardando" 
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
  { name: 'activo', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const formRol = ref({ nombre: '', descripcion: '', activo: true })

async function cargarRoles() {
  loading.value = true
  try {
    const params = { page: paginacion.value.page, por_pagina: paginacion.value.rowsPerPage }
    const response = await rolService.getRoles(params)
    // Adaptar si viene envuelto o directo (Paginator Laravel)
    const data = response.data || response
    roles.value = data.data || data || []
    paginacion.value.rowsNumber = data.total || roles.value.length
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
  formRol.value = { ...rol, activo: !!rol.activo }
  dialogoRol.value = true
}

async function guardarRol() {
  if (!formRol.value.nombre) return
  
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
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar el rol "${rol.nombre}"?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
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
  .roles-page { padding: 16px; }
  .page-header { padding: 20px; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .header-title h1 { font-size: 1.4rem; }
  .header-actions { width: 100%; }
}
</style>
