<template>
  <q-page class="flex flex-center bg-gradient">
    <div class="search-container">
      <!-- Logo y título centrados -->
      <div class="header-section">
        <div class="logo-wrapper">
          <img src="/logo-unitepc.png" alt="UNITEPC" class="logo-img" />
        </div>
        <h1 class="app-title">SIGVA</h1>
        <p class="app-subtitle">Sistema de Gestión de Vacaciones</p>
      </div>

      <!-- Card de búsqueda -->
      <q-card class="full-width shadow-8" style="border-radius: 16px;">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-center q-mb-md">
            <q-icon name="person_search" color="primary" class="q-mr-sm" />
            Consultar Información
          </div>
          
          <p class="text-grey-7 text-center q-mb-lg">
            Ingrese su Cédula de Identidad y Fecha de Ingreso para consultar su saldo de vacaciones y realizar solicitudes.
          </p>

          <q-form @submit="buscarEmpleado" class="q-gutter-md">
            <q-input
              v-model="ci"
              label="Cédula de Identidad (CI)"
              outlined
              :error="!!errorCi"
              :error-message="errorCi"
              :loading="loading"
              hide-bottom-space
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="badge" />
              </template>
            </q-input>

            <q-input
              v-model="fechaIngreso"
              label="Fecha de Ingreso"
              outlined
              type="date"
              :error="!!errorFecha"
              :error-message="errorFecha"
              :loading="loading"
              hide-bottom-space
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Consultar"
              icon="search"
              color="primary"
              size="lg"
              class="full-width"
              :loading="loading"
              unelevated
              no-caps
            />
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Nota informativa -->
      <q-card flat class="bg-white-alpha text-white" style="border-radius: 12px;">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="info" size="24px" />
            <div class="col">
              <span class="text-body2">
                Si no recuerda su fecha de ingreso o sus datos están incorrectos, comuníquese con Talento Humano.
              </span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import empleadoService from '@/services/empleadoService'

const router = useRouter()
const $q = useQuasar()

const ci = ref('')
const fechaIngreso = ref('')
const loading = ref(false)
const errorCi = ref('')
const errorFecha = ref('')

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
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 50%, #002984 100%);
  min-height: 100vh;
  padding: 24px 16px;
}

.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 450px;
  width: 100%;
}

/* Header Section - Centrado */
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 8px;
}

.logo-wrapper {
  width: 120px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  margin-bottom: 20px;
}

.logo-img {
  width: 100%;
  height: auto;
  display: block;
}

.app-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin: 8px 0 0;
  font-weight: 400;
}

.bg-white-alpha {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

/* Responsive */
@media (max-width: 480px) {
  .bg-gradient {
    padding: 16px 12px;
  }

  .search-container {
    gap: 20px;
  }

  .logo-wrapper {
    width: 100px;
    padding: 12px;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
  }
}
</style>
