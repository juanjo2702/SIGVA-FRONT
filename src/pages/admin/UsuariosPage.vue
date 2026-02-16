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
            <p class="subtitle">Administra los accesos y perfiles del personal SIGVA</p>
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
            @click="openDialog()"
          />
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="table-card">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 15 }"
      >
        <template v-slot:body-cell-nombre_completo="props">
          <q-td :props="props">
            <div class="column">
              <span class="text-weight-bold text-primary">{{ props.row.name }} {{ props.row.apellido_paterno }} {{ props.row.apellido_materno }}</span>
              <span class="text-caption text-grey-7">CI: {{ props.row.ci }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-rol="props">
          <q-td :props="props">
            <q-chip outline color="primary" icon="security" size="sm" class="text-weight-bold">
              {{ props.row.rol?.nombre || 'S/R' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-sede="props">
          <q-td :props="props">
            <div v-if="props.row.sede" class="flex items-center gap-1">
              <q-icon name="apartment" color="secondary" size="xs" />
              <span class="text-body2">{{ props.row.sede?.nombre }}</span>
            </div>
            <q-badge v-else color="grey-3" text-color="grey-8" label="NACIONAL" class="q-px-sm" />
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props" align="center">
            <q-badge :color="props.row.activo ? 'positive' : 'grey'" class="q-px-md q-py-xs rounded-full">
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-password_actual="props">
          <q-td :props="props" align="center">
            <div class="flex items-center justify-center gap-2">
              <template v-if="!props.row.password_segura">
                <code class="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 font-mono text-xs">{{ props.row.password_actual }}</code>
                <q-icon name="report_problem" color="warning" size="xs">
                  <q-tooltip>Insegura: Igual al CI</q-tooltip>
                </q-icon>
              </template>
              <template v-else>
                <q-icon name="verified_user" color="positive" size="xs">
                  <q-tooltip>Contraseña Personalizada</q-tooltip>
                </q-icon>
                <q-btn flat round dense size="xs" color="orange" icon="refresh" @click="resetPassword(props.row)" :loading="resettingId === props.row.id">
                   <q-tooltip>Resetear a CI</q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" align="center">
            <div class="flex gap-2 justify-center">
              <q-btn flat round color="orange" icon="rule" size="sm" @click="openPermissionsDialog(props.row)">
                <q-tooltip>Permisos Individuales</q-tooltip>
              </q-btn>
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)">
                <q-tooltip>Editar Usuario</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar Usuario</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal Form -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 550px; border-radius: 20px;">
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="text-h6 text-weight-bold flex items-center gap-3">
             <q-icon :name="isEdit ? 'manage_accounts' : 'person_add'" size="md" />
             {{ isEdit ? 'Actualizar Usuario' : 'Registrar Nuevo Usuario' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <q-form ref="userForm" @submit="save" class="q-gutter-y-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-4">
                <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Nombres</label>
                <q-input v-model="form.name" outlined dense placeholder="Nombres" :rules="[val => !!val || 'Campo requerido']" />
              </div>
              <div class="col-12 col-sm-4">
                <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Apellido Paterno</label>
                <q-input v-model="form.apellido_paterno" outlined dense placeholder="Paterno" :rules="[val => !!val || 'Campo requerido']" />
              </div>
              <div class="col-12 col-sm-4">
                <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Apellido Materno</label>
                <q-input v-model="form.apellido_materno" outlined dense placeholder="Materno" />
              </div>
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-sm-6">
                <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">CI (Usuario)</label>
                <q-input v-model="form.ci" outlined dense placeholder="Documento de Identidad" :rules="[val => !!val || 'Campo requerido']" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Rol de Sistema</label>
                <q-select v-model="form.rol_id" :options="rolesOptions" option-value="id" option-label="nombre" outlined dense emit-value map-options :rules="[val => !!val || 'Campo requerido']" />
              </div>
            </div>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-sm-6">
                <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Email (Opcional)</label>
                <q-input v-model="form.email" outlined dense placeholder="correo@ejemplo.com" type="email" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-caption text-weight-bold text-grey-7 uppercase tracking-wider q-mb-xs block">Sede Asignada</label>
                <q-select v-model="form.sede_id" :options="sedesOptions" option-value="id" option-label="nombre" outlined dense emit-value map-options clearable hint="Vacio para acceso Nacional" />
              </div>
            </div>

            <div class="flex items-center justify-between q-mt-md bg-grey-1 q-pa-md rounded-lg">
              <q-toggle v-model="form.activo" label="Usuario Habilitado" color="positive" />
              <div v-if="!isEdit" class="text-caption text-grey-6 flex items-center gap-1">
                <q-icon name="info" /> Pass inicial: CI
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-lg border-t">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup rounded no-caps class="q-px-md" />
          <q-btn label="Guardar Usuario" color="primary" @click="save" :loading="saving" rounded unelevated no-caps class="q-px-xl text-weight-bold" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Permisos Individuales -->
    <q-dialog v-model="permDialog" persistent transition-show="rotate" transition-hide="rotate">
      <q-card style="min-width: 750px; border-radius: 20px;">
        <q-card-section class="bg-primary text-white q-pa-lg shadow-5">
          <div class="flex items-center gap-4">
            <div class="q-pa-sm bg-white/20 rounded-xl">
              <q-icon name="admin_panel_settings" size="md" />
            </div>
            <div>
              <div class="text-h6 text-weight-bold uppercase tracking-tighter">Permisos Personalizados</div>
              <div class="text-subtitle2 opacity-80">{{ selectedUser?.name }} {{ selectedUser?.apellido_paterno }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl bg-grey-1" style="max-height: 65vh; overflow-y: auto;">
          <div v-if="permLoading" class="flex flex-center q-pa-xl">
            <q-spinner-tail color="primary" size="64px" />
          </div>

          <div v-else>
            <div class="bg-indigo-50 q-pa-md rounded-xl border border-indigo-100 mb-8 flex items-center gap-3">
               <q-icon name="info" color="primary" size="sm" />
               <span class="text-caption text-indigo-900">Los permisos en <strong class="bg-primary/20 px-1 rounded">VIOLETA</strong> están heredados por el rol actual. Puedes añadir excepciones aquí.</span>
            </div>

            <div v-for="(perms, system) in groupedPermissions" :key="system" class="mb-10 animate-fade">
              <div class="text-subtitle2 font-bold text-primary flex items-center gap-2 mb-4 border-b pb-2 uppercase tracking-widest">
                <q-icon name="apps" size="xs" />
                SISTEMA: {{ system }}
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="perm in perms"
                  :key="perm.id"
                  class="flex items-center justify-between p-4 rounded-xl transition-all border-2"
                  :class="isInherited(perm.id) ? 'bg-primary/5 border-primary/20' : 'bg-white border-transparent shadow-sm'"
                >
                  <div class="column">
                    <span class="text-weight-bold" :class="isInherited(perm.id) ? 'text-primary' : 'text-grey-9'">
                      {{ perm.name }}
                    </span>
                    <span class="text-[10px] text-grey-6 leading-tight">{{ perm.description }}</span>
                  </div>

                  <q-toggle
                    v-model="individualPermIds"
                    :val="perm.id"
                    color="primary"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-lg bg-white">
          <q-btn flat label="Cerrar" color="grey-8" v-close-popup rounded no-caps />
          <q-btn
            label="Aplicar Cambios"
            color="primary"
            @click="saveIndividualPermissions"
            :loading="savingPerms"
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
import userService from '@/services/userService'
import rolService from '@/services/rolService'
import { adminService } from '@/services/adminService'

const $q = useQuasar()
const rows = ref([])
const rolesOptions = ref([])
const sedesOptions = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const userForm = ref(null)
const resettingId = ref(null)

// Permisos Individuales
const permDialog = ref(false)
const permLoading = ref(false)
const savingPerms = ref(false)
const selectedUser = ref(null)
const individualPermIds = ref([])
const rolePermIds = ref([])
const allAvailablePermissions = ref([])
const groupedPermissions = ref({})

const form = ref({
  id: null,
  rol_id: null,
  sede_id: null,
  name: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci: '',
  email: '',
  activo: true
})

const columns = [
  { name: 'nombre_completo', label: 'Funcionario / Usuario', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol Asignado', align: 'left', sortable: true },
  { name: 'sede', label: 'Sede', align: 'left', sortable: true },
  { name: 'password_actual', label: 'Seguridad', align: 'center' },
  { name: 'activo', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const loadData = async () => {
  loading.value = true
  try {
    const [userRes, rolesRes, sedesRes] = await Promise.all([
      userService.getUsuarios({ por_pagina: 100 }),
      rolService.getRolesParaSelect(),
      adminService.getSedes()
    ])
    // Adaptar respuestas
    rows.value = userRes.data.data || userRes.data || []
    rolesOptions.value = rolesRes.data || rolesRes || []
    sedesOptions.value = sedesRes.data || sedesRes || []
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

const openDialog = (item = null) => {
  if (item) {
    isEdit.value = true
    form.value = {
      ...item,
      password: ''
    }
  } else {
    isEdit.value = false
    form.value = {
      id: null,
      rol_id: null,
      sede_id: null,
      name: '',
      apellido_paterno: '',
      apellido_materno: '',
      ci: '',
      email: '',
      activo: true
    }
  }
  dialog.value = true
}

const save = async () => {
  const valid = await userForm.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const dataToSend = { ...form.value }
    delete dataToSend.password_actual
    delete dataToSend.password_segura

    if (isEdit.value) {
      await userService.actualizarUsuario(form.value.id, dataToSend)
      $q.notify({ type: 'positive', message: 'Usuario actualizado correctamente' })
    } else {
      await userService.crearUsuario(dataToSend)
      $q.notify({ type: 'positive', message: 'Usuario creado correctamente' })
    }
    dialog.value = false
    loadData()
  } catch (error) {
    console.error(error)
    const msg = error.response?.data?.message || 'Error al guardar datos'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar desactivación',
    message: `¿Deseas desactivar al usuario ${item.name}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Desactivar', color: 'negative', unelevated: true },
    persistent: true
  }).onOk(async () => {
    try {
      await userService.desactivarUsuario(item.id)
      $q.notify({ type: 'positive', message: 'Usuario desactivado' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo desactivar' })
    }
  })
}

const resetPassword = async (user) => {
  $q.dialog({
    title: 'Resetear Contraseña',
    message: `¿Resetear la contraseña de ${user.name} a su CI (${user.ci})?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Sí, Resetear', color: 'orange', unelevated: true },
    persistent: true
  }).onOk(async () => {
    resettingId.value = user.id
    try {
      await userService.resetPassword(user.id)
      $q.notify({ type: 'positive', message: 'Contraseña reseteada al CI' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'Error al resetear contraseña' })
    } finally {
      resettingId.value = null
    }
  })
}

const openPermissionsDialog = async (user) => {
  selectedUser.value = user
  permDialog.value = true
  permLoading.value = true
  try {
    const res = await userService.getPermissions(user.id)
    allAvailablePermissions.value = res.data.all_permissions
    individualPermIds.value = res.data.individual_permission_ids
    rolePermIds.value = res.data.role_permission_ids

    const groups = {}
    allAvailablePermissions.value.forEach(p => {
      const systemName = p.systems?.display_name || 'Global'
      if (!groups[systemName]) groups[systemName] = []
      groups[systemName].push(p)
    })
    groupedPermissions.value = groups
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar permisos' })
    permDialog.value = false
  } finally {
    permLoading.value = false
  }
}

const isInherited = (permId) => {
  return rolePermIds.value.includes(permId)
}

const saveIndividualPermissions = async () => {
  savingPerms.value = true
  try {
    await userService.sincronizarPermisos(selectedUser.value.id, individualPermIds.value)
    $q.notify({ type: 'positive', message: 'Permisos individuales guardados' })
    permDialog.value = false
    loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar permisos' })
  } finally {
    savingPerms.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.usuarios-page {
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

/* Form Helper */
.block {
  display: block;
}

/* Responsive */
@media (max-width: 768px) {
  .usuarios-page { padding: 16px; }
  .page-header { padding: 20px; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .header-title h1 { font-size: 1.4rem; }
  .header-actions { width: 100%; }
}
</style>
