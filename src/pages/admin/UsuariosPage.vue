<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="q-ma-none">Gestión de Usuarios</h4>
        <p class="text-grey-7 q-mb-none">Administra los usuarios del sistema SIGVA</p>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="person_add" label="Nuevo Usuario" unelevated no-caps @click="abrirDialogoCrear" />
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="filtros.buscar" label="Buscar por CI o nombre" outlined dense clearable
              @update:model-value="buscar">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filtros.rol_id" label="Rol" :options="opcionesRolFiltro" emit-value map-options outlined
              dense clearable @update:model-value="cargarUsuarios" />
          </div>
          <div class="col-12 col-md-3">
            <q-select v-model="filtros.activo" label="Estado" :options="opcionesEstado" emit-value map-options outlined
              dense clearable @update:model-value="cargarUsuarios" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card flat bordered>
      <q-table :rows="usuarios" :columns="columnas" row-key="id" :loading="loading" :pagination="paginacion"
        @request="onRequest" flat bordered>
        <template v-slot:body-cell-nombre_completo="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.nombre_completo }}</div>
            <div class="text-caption text-grey-6">CI: {{ props.row.ci }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-rol="props">
          <q-td :props="props">
            <q-badge :color="props.row.rol?.nombre?.toLowerCase().includes('admin') ? 'primary' : 'secondary'"
              :label="props.row.rol?.nombre || 'Sin rol'" />
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-badge :color="props.row.activo ? 'positive' : 'negative'"
              :label="props.row.activo ? 'Activo' : 'Inactivo'" />
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
            <q-btn v-if="props.row.activo && props.row.id !== authStore.user?.id" flat round dense icon="person_off"
              color="negative" @click="confirmarDesactivar(props.row)">
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
          <div class="text-h6">
            {{ modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="guardarUsuario" class="q-gutter-md">
            <q-input v-model="formUsuario.ci" label="CI *" outlined dense
              :rules="[val => !!val || 'El CI es obligatorio']" :disable="modoEdicion" />

            <q-input v-model="formUsuario.name" label="Nombres *" outlined dense
              :rules="[val => !!val || 'El nombre es obligatorio']" />

            <q-input v-model="formUsuario.apellido_paterno" label="Apellido Paterno *" outlined dense
              :rules="[val => !!val || 'El apellido paterno es obligatorio']" />

            <q-input v-model="formUsuario.apellido_materno" label="Apellido Materno" outlined dense />

            <q-select v-model="formUsuario.rol_id" label="Rol *" :options="rolesDisponibles" option-value="id"
              option-label="nombre" emit-value map-options outlined dense
              :rules="[val => !!val || 'El rol es obligatorio']" />

            <q-toggle v-if="modoEdicion" v-model="formUsuario.activo" label="Usuario activo" />

            <div v-if="!modoEdicion" class="text-caption text-grey-6">
              <q-icon name="info" /> La contraseña inicial será el CI del usuario
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated :label="modoEdicion ? 'Guardar' : 'Crear'" color="primary" :loading="guardando"
            @click="guardarUsuario" />
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

// Estado
const usuarios = ref([])
const rolesDisponibles = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogoUsuario = ref(false)
const modoEdicion = ref(false)

// Filtros
const filtros = ref({
  buscar: '',
  rol_id: null,
  activo: null
})

// Paginación
const paginacion = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Opciones para filtros
const opcionesRolFiltro = computed(() => {
  const roles = Array.isArray(rolesDisponibles.value) ? rolesDisponibles.value : []
  return [
    { label: 'Todos', value: null },
    ...roles.map(r => ({ label: r.nombre, value: r.id }))
  ]
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

// Formulario
const formUsuario = ref({
  ci: '',
  name: '',
  apellido_paterno: '',
  apellido_materno: '',
  rol_id: null,
  activo: true
})

// Métodos
async function cargarRoles() {
  try {
    const response = await rolService.getRolesParaSelect()
    rolesDisponibles.value = response.data
  } catch (error) {
    console.error('Error cargando roles:', error)
  }
}

async function cargarUsuarios() {
  loading.value = true
  try {
    const params = {
      page: paginacion.value.page,
      por_pagina: paginacion.value.rowsPerPage,
      buscar: filtros.value.buscar || undefined,
      rol_id: filtros.value.rol_id || undefined,
      activo: filtros.value.activo ?? undefined
    }

    const response = await userService.getUsuarios(params)
    usuarios.value = response.data.data
    paginacion.value.rowsNumber = response.data.total
  } catch (error) {
    notify.error('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

function onRequest(props) {
  paginacion.value.page = props.pagination.page
  paginacion.value.rowsPerPage = props.pagination.rowsPerPage
  cargarUsuarios()
}

const buscar = useDebounceFn(() => {
  paginacion.value.page = 1
  cargarUsuarios()
}, 300)

function abrirDialogoCrear() {
  modoEdicion.value = false
  formUsuario.value = {
    ci: '',
    name: '',
    apellido_paterno: '',
    apellido_materno: '',
    rol_id: rolesDisponibles.value[0]?.id || null,
    activo: true
  }
  dialogoUsuario.value = true
}

function abrirDialogoEditar(usuario) {
  modoEdicion.value = true
  formUsuario.value = {
    ...usuario,
    rol_id: usuario.rol_id || usuario.rol?.id
  }
  dialogoUsuario.value = true
}

async function guardarUsuario() {
  guardando.value = true
  try {
    if (modoEdicion.value) {
      await userService.actualizarUsuario(formUsuario.value.id, formUsuario.value)
      $q.notify({
        type: 'positive',
        message: 'Usuario actualizado correctamente',
        icon: 'check_circle'
      })
    } else {
      await userService.crearUsuario(formUsuario.value)
      $q.notify({
        type: 'positive',
        message: 'Usuario creado correctamente. La contraseña es el CI.',
        icon: 'check_circle'
      })
    }
    dialogoUsuario.value = false
    cargarUsuarios()
  } catch (error) {
    const mensaje = error.response?.data?.message || 'Error al guardar usuario'
    notify.error(mensaje)
  } finally {
    guardando.value = false
  }
}

function confirmarResetPassword(usuario) {
  $q.dialog({
    title: 'Restablecer Contraseña',
    message: `¿Restablecer la contraseña de ${usuario.nombre_completo} a su CI (${usuario.ci})?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Restablecer', color: 'warning' },
    persistent: true
  }).onOk(async () => {
    try {
      await userService.resetPassword(usuario.id)
      notify.success('Contraseña restablecida correctamente')
    } catch (error) {
      notify.error('Error al restablecer contraseña')
    }
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
    try {
      await userService.desactivarUsuario(usuario.id)
      notify.success('Usuario desactivado correctamente')
      cargarUsuarios()
    } catch (error) {
      notify.error(error.response?.data?.message || 'Error al desactivar usuario')
    }
  })
}

onMounted(async () => {
  await cargarRoles()
  cargarUsuarios()
})
</script>
