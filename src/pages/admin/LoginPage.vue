<template>
  <div class="login-wrapper flex flex-center bg-grey-2">
    <q-card class="login-card shadow-8" style="width: 400px; border-radius: 16px;">
      <q-card-section class="bg-primary text-white text-center q-py-lg">
        <q-avatar size="80px" color="white" text-color="primary">
          <q-icon name="admin_panel_settings" size="48px" />
        </q-avatar>
        <div class="text-h5 q-mt-md text-weight-bold">SIGVA</div>
        <div class="text-subtitle2">Portal de Recursos Humanos</div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input
            v-model="form.email"
            label="Usuario / CI"
            type="text"
            outlined
            :error="!!error"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            outlined
            :error="!!error"
            :error-message="error"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            label="Iniciar Sesión"
            color="primary"
            size="lg"
            class="full-width"
            :loading="authStore.loading"
            unelevated
            no-caps
          />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <q-btn flat color="primary" label="Volver al portal empleado" to="/" no-caps />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const $q = useQuasar()

const form = ref({
  email: '',
  password: ''
})
const showPassword = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  
  try {
    const result = await authStore.login(form.value.email, form.value.password)
    
    // Verificar si debe cambiar contraseña
    if (result.mustChangePassword) {
      $q.notify({
        type: 'warning',
        message: 'Debes cambiar tu contraseña antes de continuar',
        icon: 'lock_reset'
      })
      router.push('/admin/cambiar-password')
      return
    }
    
    $q.notify({
      type: 'positive',
      message: 'Bienvenido al portal de RRHH',
      icon: 'check_circle'
    })
    
    const redirect = route.query.redirect || '/admin/dashboard'
    router.push(redirect)
  } catch (err) {
    error.value = authStore.error || 'Error al iniciar sesión'
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100%;
}
.login-card {
  overflow: hidden;
}
</style>

