<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-lg-10">
        <!-- Loading -->
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
        </div>

        <!-- Formulario -->
        <div v-else-if="datos" ref="formularioRef">
          <!-- Header con acciones -->
          <div class="row items-center justify-between q-mb-md no-print">
            <div>
              <q-btn flat icon="arrow_back" label="Volver" :to="`/empleado/${datos.ci}`" />
            </div>
            <q-btn 
              color="primary" 
              icon="print" 
              label="Imprimir Formulario" 
              @click="imprimir"
              unelevated
            />
          </div>

          <!-- Formulario para imprimir -->
          <q-card class="formulario-vacaciones shadow-2">
            <q-card-section class="q-pa-lg">
              <!-- Título -->
              <div class="text-center q-mb-lg">
                <div class="text-h5 text-weight-bold">SOLICITUD DE VACACIONES</div>
                <div class="text-subtitle2 text-grey-7">SIGVA - Sistema de Gestión de Vacaciones</div>
              </div>

              <!-- Sección 1: Datos de la solicitud -->
              <div class="section q-mb-lg">
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-sm-6">
                    <div class="field-label">Lugar:</div>
                    <div class="field-value">{{ datos.lugar || '_________________' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 text-right">
                    <div class="field-label">Fecha de Solicitud:</div>
                    <div class="field-value">{{ datos.fecha_solicitud }}</div>
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-sm-8">
                    <div class="field-label">Nombre y Apellidos:</div>
                    <div class="field-value text-weight-bold">{{ datos.nombre_completo }}</div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div class="field-label">Código Empleado - CI:</div>
                    <div class="field-value">{{ datos.ci }}</div>
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-sm-4">
                    <div class="field-label">Número de días solicitados:</div>
                    <div class="field-value text-h6 text-primary">{{ datos.dias_solicitados }}</div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div class="field-label">Fecha Inicio:</div>
                    <div class="field-value">{{ datos.fecha_inicio }}</div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div class="field-label">Fecha Fin:</div>
                    <div class="field-value">{{ datos.fecha_fin }}</div>
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12">
                    <div class="field-label">Tipo de Solicitud:</div>
                    <div class="row q-gutter-md q-mt-xs">
                      <q-checkbox 
                        :model-value="datos.tipo === 'completo'" 
                        label="Día Completo" 
                        disable 
                      />
                      <q-checkbox 
                        :model-value="datos.tipo === 'parcial_manana'" 
                        label="Mañana" 
                        disable 
                      />
                      <q-checkbox 
                        :model-value="datos.tipo === 'parcial_tarde'" 
                        label="Tarde" 
                        disable 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-lg" />

              <!-- Sección para firmas (vacía para imprimir) -->
              <div class="section q-mb-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-md">AUTORIZACIONES</div>
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-sm-4 text-center">
                    <div class="firma-linea"></div>
                    <div class="text-caption">Firma del Solicitante</div>
                  </div>
                  <div class="col-12 col-sm-4 text-center">
                    <div class="firma-linea"></div>
                    <div class="text-caption">Visto Bueno Jefe Inmediato</div>
                  </div>
                  <div class="col-12 col-sm-4 text-center">
                    <div class="firma-linea"></div>
                    <div class="text-caption">Autorización RRHH</div>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-lg" />

              <!-- Sección 2: Control de Vacaciones -->
              <div class="section">
                <div class="text-subtitle1 text-weight-bold q-mb-md">CONTROL DE VACACIONES</div>
                
                <div class="row q-col-gutter-md">
                  <div class="col-6 col-sm-4">
                    <div class="control-item">
                      <div class="text-caption text-grey-7">Fecha de Ingreso</div>
                      <div class="text-weight-medium">{{ datos.fecha_ingreso }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="control-item">
                      <div class="text-caption text-grey-7">Gestión</div>
                      <div class="text-weight-medium">{{ datos.gestion }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="control-item">
                      <div class="text-caption text-grey-7">Años de Servicio</div>
                      <div class="text-weight-medium">{{ datos.anos_servicio }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="control-item">
                      <div class="text-caption text-grey-7">Días Correspondientes</div>
                      <div class="text-weight-medium">{{ datos.dias_correspondientes }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="control-item">
                      <div class="text-caption text-grey-7">Días Pendientes</div>
                      <div class="text-weight-medium">{{ datos.dias_pendientes }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="control-item">
                      <div class="text-caption text-grey-7">Días a Utilizar</div>
                      <div class="text-weight-medium text-primary">{{ datos.dias_a_utilizar }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="control-item">
                      <div class="text-caption text-grey-7">Saldo Actual</div>
                      <div class="text-weight-medium">{{ datos.saldo_actual }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="control-item bg-primary-light">
                      <div class="text-caption text-grey-7">Saldo Total Pendiente</div>
                      <div class="text-weight-bold text-h6" :class="datos.saldo_resultante < 0 ? 'text-negative' : 'text-positive'">
                        {{ datos.saldo_resultante }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <q-separator class="q-my-lg" />

              <!-- Firmas de control -->
              <div class="section">
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-sm-6 text-center">
                    <div class="firma-linea"></div>
                    <div class="text-caption">Responsable de Control</div>
                  </div>
                  <div class="col-12 col-sm-6 text-center">
                    <div class="firma-linea"></div>
                    <div class="text-caption">Jefe de RRHH</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import empleadoService from '@/services/empleadoService'

const route = useRoute()
const router = useRouter()

const datos = ref(null)
const loading = ref(true)
const formularioRef = ref(null)

function imprimir() {
  window.print()
}

async function cargarDatos() {
  loading.value = true
  try {
    const response = await empleadoService.obtenerDatosFormulario(route.params.id)
    if (response.success) {
      datos.value = response.data
    }
  } catch (error) {
    console.error('Error cargando datos del formulario:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.formulario-vacaciones {
  max-width: 800px;
  margin: 0 auto;
}

.field-label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 4px;
}

.field-value {
  font-size: 1rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
  min-height: 24px;
}

.firma-linea {
  border-bottom: 1px solid #000;
  height: 60px;
  margin-bottom: 8px;
}

.control-item {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
}

.bg-primary-light {
  background: rgba(25, 118, 210, 0.1);
}

@media print {
  .no-print {
    display: none !important;
  }
  
  .formulario-vacaciones {
    box-shadow: none !important;
    max-width: 100%;
  }
  
  .q-page {
    padding: 0 !important;
  }
}
</style>
