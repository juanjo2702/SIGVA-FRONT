<template>
  <q-page class="flex flex-center bg-gradient">
    <div class="column items-center q-gutter-lg" style="max-width: 500px; width: 100%;">
      <!-- Logo y título -->
      <div class="text-center q-mb-lg">
        <q-avatar size="100px" color="primary" text-color="white" class="shadow-4">
          <q-icon name="beach_access" size="60px" />
        </q-avatar>
        <h4 class="text-white text-weight-bold q-mt-md q-mb-none">SIGVA</h4>
        <p class="text-white text-subtitle1">Sistema de Gestión de Vacaciones</p>
      </div>

      <!-- Card de búsqueda -->
      <q-card class="full-width shadow-8" style="border-radius: 16px;">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-center q-mb-md">
            <q-icon name="person_search" color="primary" class="q-mr-sm" />
            Consultar Información
          </div>
          
          <p class="text-grey-7 text-center q-mb-lg">
            Ingrese su número de Cédula de Identidad para consultar su saldo de vacaciones y realizar solicitudes.
          </p>

          <q-form @submit="buscarEmpleado" class="q-gutter-md">
            <q-input
              v-model="ci"
              label="Cédula de Identidad (CI)"
              outlined
              :error="!!error"
              :error-message="error"
              :loading="loading"
              hide-bottom-space
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="badge" />
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
                Si es la primera vez que consulta, verifique que sus datos estén actualizados en RRHH.
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
const loading = ref(false)
const error = ref('')

async function buscarEmpleado() {
  if (!ci.value.trim()) {
    error.value = 'Por favor ingrese su CI'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await empleadoService.buscarPorCi(ci.value.trim())
    
    if (response.success) {
      router.push(`/empleado/${ci.value.trim()}`)
    }
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'No se encontró un empleado con el CI proporcionado'
    } else {
      error.value = 'Error al buscar empleado. Intente nuevamente.'
    }
    $q.notify({
      type: 'negative',
      message: error.value,
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 50%, #002984 100%);
  min-height: 100vh;
}

.bg-white-alpha {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}
</style>
