<template>
  <div class="login-wrapper">
    <q-card class="login-card shadow-20">
      <!-- Header con logo -->
      <q-card-section class="login-header">
        <div class="logo-wrapper">
          <img src="/logo-unitepc.png" alt="UNITEPC" class="logo" />
        </div>
        <div class="text-h4 text-weight-bold q-mt-md">SIGVA</div>
        <div class="text-body2 text-purple-3">Sistema de Gestión de Vacaciones</div>
      </q-card-section>

      <!-- Formulario -->
      <q-card-section class="q-px-lg q-py-xl">
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input v-model="form.ci" label="Usuario / CI" type="text" outlined :error="!!error">
            <template v-slot:prepend>
              <q-icon name="person" color="purple" />
            </template>
          </q-input>

          <q-input v-model="form.password" label="Contraseña" :type="showPassword ? 'text' : 'password'" outlined
            :error="!!error" :error-message="error">
            <template v-slot:prepend>
              <q-icon name="lock" color="purple" />
            </template>
            <template v-slot:append>
              <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="showPassword = !showPassword" />
            </template>
          </q-input>

          <q-btn type="submit" label="Iniciar Sesión" color="primary" size="lg" class="full-width q-mt-md"
            :loading="authStore.loading" unelevated no-caps />
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-section class="text-center">
        <q-btn flat color="grey-7" label="Volver al portal empleado" to="/" no-caps icon="arrow_back" />
      </q-card-section>
    </q-card>

    <div class="footer-text">© {{ new Date().getFullYear() }} UNITEPC - Todos los derechos reservados</div>
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
  ci: '',
  password: ''
})
const showPassword = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''

  try {
    const result = await authStore.login(form.value.ci, form.value.password)

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
      message: 'Bienvenido al portal de Talento Humano',
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #663399 0%, #4a2475 50%, #009999 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #663399 0%, #552288 100%);
  text-align: center;
  padding: 40px 30px 30px;
  color: white;
}

.logo-wrapper {
  background: white;
  border-radius: 16px;
  padding: 12px 20px;
  display: inline-block;
}

.logo {
  height: 50px;
  width: auto;
}

.text-purple-3 {
  color: rgba(255, 255, 255, 0.75);
}

.footer-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-top: 24px;
}
</style>
