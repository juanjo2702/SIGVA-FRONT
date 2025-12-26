<template>
  <q-page class="usuarios-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="group" size="28px" />
          </div>
          <div>
            <h1>Gestión de Usuarios</h1>
            <p class="subtitle">Administra los usuarios del sistema SIGVA</p>
          </div>
        </div>
        <div class="header-actions">
          <q-btn 
            unelevated 
            color="secondary"
            icon="person_add" 
            label="Nuevo Usuario" 
            no-caps
            class="action-btn"
            @click="abrirDialogoCrear"
          />
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-grid">
        <q-input 
          v-model="filtros.buscar" 
          label="Buscar por CI o nombre" 
          outlined 
          dense 
          clearable
          class="filter-item search-input"
          @update:model-value="buscar"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
        
        <q-select 
          v-model="filtros.rol_id" 
          label="Rol" 
          :options="opcionesRolFiltro" 
          emit-value 
          map-options 
          outlined
          dense 
          clearable 
          class="filter-item"
          @update:model-value="cargarUsuarios"
        >
          <template v-slot:prepend>
            <q-icon name="admin_panel_settings" color="primary" />
          </template>
        </q-select>
        
        <q-select 
          v-model="filtros.activo" 
          label="Estado" 
          :options="opcionesEstado" 
          emit-value 
          map-options 
          outlined
          dense 
          clearable 
          class="filter-item"
          @update:model-value="cargarUsuarios"
        >
          <template v-slot:prepend>
            <q-icon name="toggle_on" color="primary" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="table-card">
      <q-table :rows="usuarios" :columns="columnas" row-key="id" :loading="loading" :pagination="paginacion" @request="onRequest" flat>
        <template v-slot:body-cell-nombre_completo="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nombre_completo }}</div>
            <div class="text-caption text-grey-6">CI: {{ props.row.ci }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-rol="props">
          <q-td :props="props">
            <q-badge :color="props.row.rol?.nombre?.toLowerCase().includes('admin') ? 'primary' : 'secondary'" :label="props.row.rol?.nombre || 'Sin rol'" />
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-badge :color="props.row.activo ? 'positive' : 'negative'" :label="props.row.activo ? 'Activo' : 'Inactivo'" />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn flat round dense icon="edit" color="primary" @click="abrirDialogoEditar(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="lock_reset" color="warning" @click="confirmarResetPassword(props.row)">
              <q-tooltip>Restablecer contraseña</q-tooltip>
            </q-btn>
            <q-btn v-if="props.row.activo && props.row.id !== authStore.user?.id" flat round dense icon="person_off" color="negative" @click="confirmarDesactivar(props.row)">
              <q-tooltip>Desactivar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width text-center q-pa-lg text-grey-6">
            <q-icon name="group_off" size="48px" />
            <div class="q-mt-sm">No se encontraron usuarios</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar -->
    <q-dialog v-model="dialogoUsuario" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="guardarUsuario" class="q-gutter-md">
            <q-input v-model="formUsuario.ci" label="CI *" outlined dense :rules="[val => !!val || 'El CI es obligatorio']" :disable="modoEdicion" />
            <q-input v-model="formUsuario.name" label="Nombres *" outlined dense :rules="[val => !!val || 'El nombre es obligatorio']" />
            <q-input v-model="formUsuario.apellido_paterno" label="Apellido Paterno *" outlined dense :rules="[val => !!val || 'El apellido paterno es obligatorio']" />
            <q-input v-model="formUsuario.apellido_materno" label="Apellido Materno" outlined dense />
            <q-select v-model="formUsuario.rol_id" label="Rol *" :options="rolesDisponibles" option-value="id" option-label="nombre" emit-value map-options outlined dense :rules="[val => !!val || 'El rol es obligatorio']" />
            <q-toggle v-if="modoEdicion" v-model="formUsuario.activo" label="Usuario activo" />
            <div v-if="!modoEdicion" class="text-caption text-grey-6">
              <q-icon name="info" /> La contraseña inicial será el CI del usuario
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated :label="modoEdicion ? 'Guardar' : 'Crear'" color="primary" :loading="guardando" @click="guardarUsuario" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import rolService from '@/services/rolService'
import { useDebounceFn } from '@vueuse/core'
import { useNotify } from '@/composables/useNotify'

const $q = useQuasar()
const notify = useNotify()
const authStore = useAuthStore()

const usuarios = ref([])
const rolesDisponibles = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogoUsuario = ref(false)
const modoEdicion = ref(false)

const filtros = ref({ buscar: '', rol_id: null, activo: null })
const paginacion = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const opcionesRolFiltro = computed(() => {
  const roles = Array.isArray(rolesDisponibles.value) ? rolesDisponibles.value : []
  return [{ label: 'Todos', value: null }, ...roles.map(r => ({ label: r.nombre, value: r.id }))]
})

const opcionesEstado = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' }
]

const columnas = [
  { name: 'nombre_completo', label: 'Usuario', field: 'nombre_completo', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const formUsuario = ref({ ci: '', name: '', apellido_paterno: '', apellido_materno: '', rol_id: null, activo: true })

async function cargarRoles() {
  try { const response = await rolService.getRolesParaSelect(); rolesDisponibles.value = response.data } 
  catch (error) { console.error('Error cargando roles:', error) }
}

async function cargarUsuarios() {
  loading.value = true
  try {
    const params = { page: paginacion.value.page, por_pagina: paginacion.value.rowsPerPage, buscar: filtros.value.buscar || undefined, rol_id: filtros.value.rol_id || undefined, activo: filtros.value.activo ?? undefined }
    const response = await userService.getUsuarios(params)
    usuarios.value = response.data.data
    paginacion.value.rowsNumber = response.data.total
  } catch (error) { notify.error('Error al cargar usuarios') } 
  finally { loading.value = false }
}

function onRequest(props) {
  paginacion.value.page = props.pagination.page
  paginacion.value.rowsPerPage = props.pagination.rowsPerPage
  cargarUsuarios()
}

const buscar = useDebounceFn(() => { paginacion.value.page = 1; cargarUsuarios() }, 300)

function abrirDialogoCrear() {
  modoEdicion.value = false
  formUsuario.value = { ci: '', name: '', apellido_paterno: '', apellido_materno: '', rol_id: rolesDisponibles.value[0]?.id || null, activo: true }
  dialogoUsuario.value = true
}

function abrirDialogoEditar(usuario) {
  modoEdicion.value = true
  formUsuario.value = { ...usuario, rol_id: usuario.rol_id || usuario.rol?.id }
  dialogoUsuario.value = true
}

async function guardarUsuario() {
  guardando.value = true
  try {
    if (modoEdicion.value) {
      await userService.actualizarUsuario(formUsuario.value.id, formUsuario.value)
      $q.notify({ type: 'positive', message: 'Usuario actualizado correctamente' })
    } else {
      await userService.crearUsuario(formUsuario.value)
      $q.notify({ type: 'positive', message: 'Usuario creado correctamente. La contraseña es el CI.' })
    }
    dialogoUsuario.value = false
    cargarUsuarios()
  } catch (error) { notify.error(error.response?.data?.message || 'Error al guardar usuario') } 
  finally { guardando.value = false }
}

function confirmarResetPassword(usuario) {
  $q.dialog({
    title: 'Restablecer Contraseña',
    message: `¿Restablecer la contraseña de ${usuario.nombre_completo} a su CI (${usuario.ci})?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Restablecer', color: 'warning' },
    persistent: true
  }).onOk(async () => {
    try { await userService.resetPassword(usuario.id); notify.success('Contraseña restablecida correctamente') } 
    catch (error) { notify.error('Error al restablecer contraseña') }
  })
}

function confirmarDesactivar(usuario) {
  $q.dialog({
    title: 'Desactivar Usuario',
    message: `¿Deseas desactivar al usuario ${usuario.nombre_completo}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Desactivar', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    try { await userService.desactivarUsuario(usuario.id); notify.success('Usuario desactivado correctamente'); cargarUsuarios() } 
    catch (error) { notify.error(error.response?.data?.message || 'Error al desactivar usuario') }
  })
}

onMounted(async () => { await cargarRoles(); cargarUsuarios() })
</script>

<style scoped>
.usuarios-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
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

.header-title h1 { font-size: 1.75rem; font-weight: 700; color: white; margin: 0; }
.header-title .subtitle { font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); margin: 4px 0 0; }
.header-actions { display: flex; gap: 12px; }
.action-btn { font-weight: 500; }

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filters-grid { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.filter-item { min-width: 180px; flex: 1; max-width: 220px; }
.search-input { flex: 2; max-width: 320px; }
.table-card { border-radius: 12px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }

@media (max-width: 768px) {
  .usuarios-page { padding: 16px; }
  .page-header { padding: 20px; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .header-title h1 { font-size: 1.4rem; }
  .header-actions { width: 100%; }
  .action-btn { flex: 1; }
  .filters-grid { flex-direction: column; }
  .filter-item, .search-input { width: 100%; max-width: 100%; }
}

@media (max-width: 576px) {
  .page-header { padding: 16px; }
  .header-title h1 { font-size: 1.2rem; }
  .title-icon { width: 44px; height: 44px; }
}
</style>
