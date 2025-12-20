<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Header -->
        <q-card class="q-mb-md shadow-2">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-btn flat round icon="arrow_back" :to="`/empleado/${ci}`" class="q-mr-sm" />
              <div class="col">
                <div class="text-h6">Solicitud de Vacaciones</div>
                <div class="text-caption" v-if="empleado">{{ empleado.nombre_completo }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
        </div>

        <!-- Form -->
        <q-card v-else-if="empleado" class="shadow-2">
          <q-card-section>
            <q-form @submit="enviarSolicitud" class="q-gutter-md">
              <!-- Lugar de Solicitud y Reemplazo -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="form.lugar"
                    label="Lugar de Solicitud"
                    outlined
                    hint="Ciudad desde donde solicita"
                  >
                    <template v-slot:prepend>
                      <q-icon name="location_on" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="form.reemplazoId"
                    :options="empleadosReemplazo"
                    option-value="id"
                    option-label="nombre_completo"
                    label="Persona que Reemplaza"
                    emit-value
                    map-options
                    outlined
                    clearable
                    use-input
                    input-debounce="300"
                    @filter="filtrarEmpleados"
                    hint="Opcional - quien cubrirá sus funciones"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person_search" />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">Sin resultados</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Calendario Interactivo -->
              <div class="text-subtitle1 q-mt-md q-mb-sm">
                <q-icon name="calendar_month" class="q-mr-sm" />
                Seleccione los días de vacaciones
              </div>
              
              <CalendarioVacaciones
                v-model="diasSeleccionados"
                :saldo-actual="empleado.saldo_vacaciones"
                :fecha-minima="fechaMinima"
              />

              <!-- Resumen -->
              <q-card flat bordered :class="saldoResultanteClass">
                <q-card-section>
                  <div class="row justify-between items-center">
                    <div>
                      <div class="text-subtitle2">Saldo Actual</div>
                      <div class="text-h6 text-primary">{{ empleado.saldo_vacaciones }} días</div>
                    </div>
                    <q-separator vertical class="q-mx-md" />
                    <div>
                      <div class="text-subtitle2">Días a Solicitar</div>
                      <div class="text-h6 text-negative">{{ totalDias }} días</div>
                    </div>
                    <q-separator vertical class="q-mx-md" />
                    <div>
                      <div class="text-subtitle2 text-weight-bold">Saldo Resultante</div>
                      <div class="text-h5" :class="saldoResultante < 0 ? 'text-negative' : 'text-positive'">
                        {{ saldoResultante }} días
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Warning saldo negativo -->
              <q-banner v-if="saldoResultante < 0" class="bg-warning text-white rounded-borders">
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                Su saldo resultante será negativo. La solicitud aún puede ser procesada pero requiere aprobación especial.
              </q-banner>

              <!-- Aviso 5 días anticipación -->
              <q-banner class="bg-blue-1 rounded-borders">
                <template v-slot:avatar>
                  <q-icon name="schedule" color="primary" />
                </template>
                <span class="text-primary">
                  <strong>Importante:</strong> Las vacaciones deben solicitarse con al menos 5 días de anticipación.
                </span>
              </q-banner>

              <!-- Botón Enviar -->
              <div class="row q-gutter-sm q-mt-md">
                <q-btn
                  type="submit"
                  label="Enviar Solicitud"
                  icon="send"
                  color="primary"
                  size="lg"
                  class="col"
                  :loading="submitting"
                  :disable="diasSeleccionados.length === 0"
                  unelevated
                  no-caps
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import empleadoService from '@/services/empleadoService'
import adminService from '@/services/adminService'
import CalendarioVacaciones from '@/components/CalendarioVacaciones.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const ci = route.params.ci
const empleado = ref(null)
const loading = ref(true)
const submitting = ref(false)
const empleadosReemplazo = ref([])
const empleadosAll = ref([])
const diasSeleccionados = ref([])

// Fecha mínima: 5 días desde hoy
const fechaMinima = computed(() => {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 5)
  return fecha.toISOString().split('T')[0]
})

const form = ref({
  lugar: '',
  reemplazoId: null
})

// Total de días
const totalDias = computed(() => {
  return diasSeleccionados.value.reduce((total, dia) => {
    if (dia.tipo === 'completo') return total + 1
    return total + 0.5
  }, 0)
})

const saldoResultante = computed(() => {
  if (!empleado.value) return 0
  return empleado.value.saldo_vacaciones - totalDias.value
})

const saldoResultanteClass = computed(() => {
  if (saldoResultante.value < 0) return 'bg-red-1'
  if (saldoResultante.value === 0) return 'bg-orange-1'
  return 'bg-green-1'
})

// Filtrar empleados para reemplazo
function filtrarEmpleados(val, update) {
  if (val === '') {
    update(() => {
      empleadosReemplazo.value = empleadosAll.value.filter(e => e.id !== empleado.value?.id).slice(0, 20)
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    empleadosReemplazo.value = empleadosAll.value.filter(e => 
      e.id !== empleado.value?.id && 
      e.nombre_completo.toLowerCase().includes(needle)
    ).slice(0, 20)
  })
}

async function cargarEmpleadosReemplazo() {
  try {
    const response = await adminService.getEmpleados({ per_page: 500 })
    if (response.data) {
      empleadosAll.value = response.data
    }
  } catch (error) {
    console.error('Error cargando empleados:', error)
  }
}

async function enviarSolicitud() {
  if (diasSeleccionados.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Seleccione al menos un día' })
    return
  }

  submitting.value = true
  
  try {
    let reemplazoNombre = null
    if (form.value.reemplazoId) {
      const reemplazoEmpleado = empleadosAll.value.find(e => e.id === form.value.reemplazoId)
      reemplazoNombre = reemplazoEmpleado?.nombre_completo
    }

    const response = await empleadoService.crearSolicitudConDias({
      empleado_id: empleado.value.id,
      dias: diasSeleccionados.value,
      lugar_solicitud: form.value.lugar,
      reemplazo: reemplazoNombre
    })

    if (response.success) {
      $q.notify({
        type: 'positive',
        message: 'Solicitud creada correctamente',
        caption: 'Pendiente de aprobación por RRHH',
        icon: 'check_circle'
      })
      
      router.push(`/empleado/${ci}`)
    }
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.errors?.join(', ') || 'Error al crear la solicitud'
    $q.notify({
      type: 'negative',
      message,
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}

async function cargarEmpleado() {
  loading.value = true
  try {
    const response = await empleadoService.buscarPorCi(ci)
    if (response.success) {
      empleado.value = response.data.empleado
      form.value.lugar = empleado.value.sede || ''
    }
  } catch (error) {
    console.error('Error cargando empleado:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarEmpleado()
  cargarEmpleadosReemplazo()
})
</script>
