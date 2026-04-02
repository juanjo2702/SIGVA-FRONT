<template>
  <q-page class="flex flex-center bg-gradient overflow-hidden">
    <!-- Top Bar: Logo e Inicio de Sesión -->
    <div class="absolute-top full-width q-pa-lg flex justify-between items-center z-top">
      <div class="logo-top shadow-10">
        <img src="/logo-unitepc.png" alt="UNITEPC" />
      </div>
      <q-btn 
        outline 
        rounded 
        color="white" 
        label="Iniciar Sesión" 
        no-caps 
        class="login-btn-top"
        @click="goToLogin"
      />
    </div>

    <!-- Fondo Decorativo -->
    <div class="decor-grid"></div>
    <div class="decor-lines">
      <svg class="full-width full-height" width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" stroke-width="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
    </div>

    <div class="search-container animate-fade">
      <!-- Hero Section Style - Más compacto -->
      <div class="hero-section q-mb-lg">
        <h1 class="hero-title">
          Gestiona tus <br/>
          <span class="text-gradient">Vacaciones</span>
        </h1>
        
        <p class="hero-subtitle">
          Consulta tu saldo y realiza tus solicitudes de forma rápida.
        </p>
      </div>

      <!-- Card de búsqueda Estilizada -->
      <q-card class="search-card shadow-24">
        <q-card-section class="q-pa-xl">
          <q-form @submit="buscarEmpleado" class="q-gutter-y-md">
            <div class="input-group">
              <label class="input-label">Número de Documento</label>
              <q-input
                v-model="ci"
                outlined
                rounded
                dense
                placeholder="Ingresa tu CI"
                :error="!!errorCi"
                :error-message="errorCi"
                :loading="loading"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="input-group">
              <label class="input-label">Fecha de Ingreso</label>
              <q-input
                v-model="fechaIngreso"
                outlined
                rounded
                dense
                type="date"
                :error="!!errorFecha"
                :error-message="errorFecha"
                :loading="loading"
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-input>
            </div>

            <q-btn
              type="submit"
              label="CONSULTAR INFORMACIÓN"
              class="full-width q-py-md btn-consultar q-mt-md"
              :loading="loading"
              unelevated
              no-caps
            />
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Badge informativo moderno -->
      <div class="portal-info-badge q-mt-xl animate-fade">
        <q-icon name="info" size="xs" class="q-mr-sm" />
        <span>Si no recuerda su fecha de ingreso o sus datos están incorrectos, por favor contacta a <strong>Talento Humano</strong>.</span>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import empleadoService from '@/services/empleadoService'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

onMounted(() => {
    // Redirección SSO automática si ya está autenticado como administrador
    if (authStore.isAuthenticated) {
        router.push('/admin/dashboard')
    }
})

const ci = ref('')
const fechaIngreso = ref('')
const loading = ref(false)
const errorCi = ref('')
const errorFecha = ref('')

const goToLogin = () => {
    const currentUrl = window.location.origin
    const returnToUrl = encodeURIComponent(`${currentUrl}/admin/dashboard`)
    const ssoUrl = `${import.meta.env.VITE_SSO_FRONT_URL}/#/login?returnTo=${returnToUrl}`
    window.location.href = ssoUrl
}

async function buscarEmpleado() {
  // Limpiar errores
  errorCi.value = ''
  errorFecha.value = ''

  // Validar campos
  if (!ci.value.trim()) {
    errorCi.value = 'Por favor ingrese su CI'
    return
  }

  if (!fechaIngreso.value) {
    errorFecha.value = 'Por favor ingrese su fecha de ingreso'
    return
  }

  loading.value = true

  try {
    const response = await empleadoService.buscarEmpleado(ci.value.trim(), fechaIngreso.value)
    
    if (response.success) {
      // Guardar datos en sessionStorage para las páginas siguientes
      sessionStorage.setItem('empleadoSearch', JSON.stringify({
        ci: ci.value.trim(),
        fechaIngreso: fechaIngreso.value,
        empleado: response.data.empleado
      }))
      
      router.push(`/empleado/${ci.value.trim()}`)
    }
  } catch (err) {
    if (err.response?.status === 404) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró un empleado con el CI y fecha de ingreso proporcionados',
        icon: 'error',
        position: 'top'
      })
    } else if (err.response?.status === 422) {
      // Errores de validación
      const errors = err.response.data.errors || {}
      if (errors.ci) errorCi.value = errors.ci[0]
      if (errors.fecha_ingreso) errorFecha.value = errors.fecha_ingreso[0]
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al buscar empleado. Intente nuevamente.',
        icon: 'error',
        position: 'top'
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #663399 0%, #4a2475 50%, #009999 100%);
  min-height: 100vh;
  position: relative;
}

.decor-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

.decor-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.08;
  pointer-events: none;
}

.search-container {
  width: 100%;
  max-width: 800px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* Top Bar Items */
.logo-top {
  background: white;
  padding: 8px 20px;
  border-radius: 12px;
}

.logo-top img {
  height: 35px;
  display: block;
}

/* Hero Section Typography */
.hero-section {
  text-align: center;
  max-width: 650px;
}

.hero-title {
  color: white;
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1;
  margin: 0;
  letter-spacing: -2px;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  margin-top: 15px;
  line-height: 1.4;
}

.text-gradient {
  background: linear-gradient(to right, #00f2fe 0%, #4facfe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Form Styles */
.search-card {
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  background: white;
}

.input-label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #663399;
  letter-spacing: 1px;
  margin-bottom: 6px;
  margin-left: 12px;
}

.btn-consultar {
  background: linear-gradient(135deg, #663399 0%, #552288 100%);
  color: white;
  font-weight: 900;
  letter-spacing: 1px;
  border-radius: 12px;
}

.portal-info-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 50px;
  color: white;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  max-width: 90%;
  text-align: center;
}

/* Animations */
.animate-fade {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 600px) {
  .hero-title { font-size: 2.2rem; }
  .hero-subtitle { font-size: 0.95rem; }
  .search-card { border-radius: 20px; }
  .logo-top img { height: 28px; }
  .portal-info-badge { font-size: 0.8rem; padding: 10px 18px; }
}
</style>
