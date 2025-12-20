<template>
  <div class="change-password-wrapper flex flex-center bg-grey-2">
    <q-card class="shadow-8" style="width: 450px; border-radius: 16px;">
      <q-card-section class="bg-warning text-white text-center q-py-lg">
        <q-avatar size="80px" color="white" text-color="warning">
          <q-icon name="lock_reset" size="48px" />
        </q-avatar>
        <div class="text-h5 q-mt-md text-weight-bold">Cambiar Contraseña</div>
        <div class="text-subtitle2">Por seguridad, debes cambiar tu contraseña</div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.password_actual"
            label="Contraseña Actual"
            :type="showActual ? 'text' : 'password'"
            outlined
            :error="!!errors.password_actual"
            :error-message="errors.password_actual"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showActual ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showActual = !showActual"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.password_nuevo"
            label="Nueva Contraseña"
            :type="showNuevo ? 'text' : 'password'"
            outlined
            :error="!!errors.password_nuevo"
            :error-message="errors.password_nuevo"
            hint="Mínimo 6 caracteres"
          >
            <template v-slot:prepend>
              <q-icon name="lock_outline" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showNuevo ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNuevo = !showNuevo"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.password_nuevo_confirmation"
            label="Confirmar Nueva Contraseña"
            :type="showConfirm ? 'text' : 'password'"
            outlined
            :error="!!errors.password_nuevo_confirmation"
            :error-message="errors.password_nuevo_confirmation"
          >
            <template v-slot:prepend>
              <q-icon name="lock_outline" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirm = !showConfirm"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            label="Cambiar Contraseña"
            color="warning"
            size="lg"
            class="full-width"
            :loading="loading"
            unelevated
            no-caps
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const form = ref({
  password_actual: '',
  password_nuevo: '',
  password_nuevo_confirmation: ''
})

const showActual = ref(false)
const showNuevo = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const errors = ref({})

async function handleSubmit() {
  errors.value = {}
  
  // Validación básica
  if (form.value.password_nuevo !== form.value.password_nuevo_confirmation) {
    errors.value.password_nuevo_confirmation = 'Las contraseñas no coinciden'
    return
  }

  if (form.value.password_nuevo.length < 6) {
    errors.value.password_nuevo = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  loading.value = true

  try {
    await api.post('/cambiar-password', form.value)
    
    // Actualizar el estado del usuario
    authStore.user.must_change_password = false
    
    $q.notify({
      type: 'positive',
      message: 'Contraseña actualizada correctamente',
      icon: 'check_circle'
    })
    
    router.push('/admin/dashboard')
  } catch (err) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      errors.value.password_actual = err.response?.data?.message || 'Error al cambiar la contraseña'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-wrapper {
  min-height: 100vh;
  width: 100%;
}
</style>
