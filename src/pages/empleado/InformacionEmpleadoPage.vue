<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Loading -->
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
        </div>

        <!-- Content -->
        <div v-else-if="empleado">
          <!-- Header Card -->
          <q-card class="q-mb-md shadow-2">
            <q-card-section class="bg-primary text-white">
              <div class="row items-center">
                <q-avatar size="72px" color="white" text-color="primary" class="q-mr-md">
                  <q-icon name="person" size="40px" />
                </q-avatar>
                <div class="col">
                  <div class="text-h5 text-weight-bold">{{ empleado.nombre_completo }}</div>
                  <div class="text-subtitle1">{{ empleado.cargo }}</div>
                  <q-badge color="white" text-color="primary" class="q-mt-xs">
                    CI: {{ empleado.ci }}
                  </q-badge>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Saldo Card -->
          <q-card class="q-mb-md shadow-2">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="calendar_today" color="primary" class="q-mr-sm" />
                Saldo de Vacaciones
              </div>

              <div class="row q-col-gutter-md">
                <!-- Saldo disponible -->
                <div class="col-12 col-sm-6">
                  <q-card flat bordered :class="saldoClass">
                    <q-card-section class="text-center">
                      <div class="text-h2 text-weight-bold">{{ empleado.saldo_vacaciones }}</div>
                      <div class="text-subtitle1">Días Disponibles</div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Info adicional -->
                <div class="col-12 col-sm-6">
                  <q-list dense>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="work" color="grey-7" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Años de Servicio</q-item-label>
                        <q-item-label caption>{{ empleado.anos_servicio }} años</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="calendar_month" color="grey-7" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Días Correspondientes</q-item-label>
                        <q-item-label caption>{{ empleado.dias_correspondientes }} días/año</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="event" color="grey-7" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Fecha de Ingreso</q-item-label>
                        <q-item-label caption>{{ formatDate(empleado.fecha_ingreso) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Acciones -->
          <q-card class="q-mb-md shadow-2">
            <q-card-section>
              <q-btn
                color="primary"
                icon="add_circle"
                label="Solicitar Vacaciones"
                size="lg"
                class="full-width q-mb-sm"
                unelevated
                no-caps
                @click="irASolicitud"
              />
              
              <q-btn
                flat
                color="grey-7"
                icon="arrow_back"
                label="Volver a buscar"
                class="full-width"
                no-caps
                to="/"
              />
            </q-card-section>
          </q-card>

          <!-- Vacaciones Programadas por RRHH -->
          <q-card v-if="vacacionesProgramadas.length" class="shadow-2 q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="event_available" color="orange" class="q-mr-sm" />
                Vacaciones Programadas por RRHH
                <q-badge color="orange" class="q-ml-sm">{{ vacacionesProgramadas.length }}</q-badge>
              </div>

              <q-list separator>
                <q-item v-for="solicitud in vacacionesProgramadas" :key="solicitud.id">
                  <q-item-section avatar>
                    <q-avatar :color="getEstadoColor(solicitud.estado)" text-color="white" size="40px">
                      <q-icon :name="getEstadoIcon(solicitud.estado)" size="20px" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ formatDate(solicitud.fecha_inicio) }} - {{ formatDate(solicitud.fecha_fin) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ solicitud.dias_solicitados }} días - {{ traducirTipo(solicitud.tipo) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-xs">
                      <q-btn 
                        flat 
                        round 
                        dense 
                        icon="description" 
                        color="primary"
                        @click="descargarFormulario(solicitud.id)"
                        :loading="loadingFormulario === solicitud.id"
                      >
                        <q-tooltip>Descargar Formulario</q-tooltip>
                      </q-btn>
                      <q-badge :color="getEstadoColor(solicitud.estado)">
                        {{ traducirEstado(solicitud.estado) }}
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Solicitudes Propias -->
          <q-card v-if="solicitudesPropias.length" class="shadow-2">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="history" color="primary" class="q-mr-sm" />
                Mis Solicitudes
                <q-badge color="primary" class="q-ml-sm">{{ solicitudesPropias.length }}</q-badge>
              </div>

              <q-list separator>
                <q-item v-for="solicitud in solicitudesPropias" :key="solicitud.id">
                  <q-item-section avatar>
                    <q-avatar :color="getEstadoColor(solicitud.estado)" text-color="white" size="40px">
                      <q-icon :name="getEstadoIcon(solicitud.estado)" size="20px" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ formatDate(solicitud.fecha_inicio) }} - {{ formatDate(solicitud.fecha_fin) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ solicitud.dias_solicitados }} días - {{ traducirTipo(solicitud.tipo) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center q-gutter-xs">
                      <q-btn 
                        flat 
                        round 
                        dense 
                        icon="description" 
                        color="primary"
                        @click="descargarFormulario(solicitud.id)"
                        :loading="loadingFormulario === solicitud.id"
                      >
                        <q-tooltip>Descargar Formulario</q-tooltip>
                      </q-btn>
                      <q-badge :color="getEstadoColor(solicitud.estado)">
                        {{ traducirEstado(solicitud.estado) }}
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- Error -->
        <q-card v-else class="shadow-2">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="error_outline" size="64px" color="negative" />
            <div class="text-h6 q-mt-md">Empleado no encontrado</div>
            <q-btn flat color="primary" label="Volver a buscar" to="/" class="q-mt-md" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog formulario oficial UNITEPC (mismo que RRHH) -->
    <q-dialog v-model="dialogFormulario" maximized>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white no-print">
          <q-icon name="description" size="sm" class="q-mr-sm" />
          <div class="text-h6">Formulario de Vacaciones</div>
          <q-space />
          <q-btn icon="picture_as_pdf" flat round @click="descargarPDF" :loading="loadingPDF">
            <q-tooltip>Descargar PDF (sin URL)</q-tooltip>
          </q-btn>
          <q-btn icon="print" flat round @click="imprimirFormulario">
            <q-tooltip>Imprimir</q-tooltip>
          </q-btn>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="datosFormulario && datosFormulario.solicitud" class="q-pa-md" id="formulario-print">
          <div class="formulario-oficial" style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 11px;">
            
            <!-- HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
              <div style="width: 140px;">
                <img src="/logo-unitepc.png" alt="UNITEPC" style="width: 140px; height: auto;" />
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-weight: bold; font-size: 14px;">DPTO. TALENTO HUMANO</div>
                <div style="font-weight: bold; font-size: 16px;">SOLICITUD DE VACACIONES</div>
              </div>
              <div style="text-align: right;">
                <span style="font-weight: bold;">No.</span>
                <span style="border: 1px solid #000; padding: 2px 15px; margin-left: 5px;">{{ datosFormulario.solicitud?.id }}</span>
              </div>
            </div>

            <!-- FECHA LUGAR -->
            <div style="text-align: right; margin-bottom: 10px;">
              <table style="display: inline-table; border-collapse: collapse; font-size: 10px;">
                <tr>
                  <td style="border: 1px solid #000; padding: 2px 5px; font-weight: bold;">Lugar</td>
                  <td style="border: 1px solid #000; padding: 2px 5px; font-weight: bold;">Día</td>
                  <td style="border: 1px solid #000; padding: 2px 5px; font-weight: bold;">Mes</td>
                  <td style="border: 1px solid #000; padding: 2px 5px; font-weight: bold;">Año</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 2px 8px;">{{ datosFormulario.empleado?.sede || 'CBBA' }}</td>
                  <td style="border: 1px solid #000; padding: 2px 8px;">{{ new Date().getDate() }}</td>
                  <td style="border: 1px solid #000; padding: 2px 8px;">{{ new Date().getMonth() + 1 }}</td>
                  <td style="border: 1px solid #000; padding: 2px 8px;">{{ new Date().getFullYear() }}</td>
                </tr>
              </table>
            </div>

            <!-- DATOS EMPLEADO -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
              <tr>
                <td style="padding: 5px; border: 1px solid #000;">
                  <strong>Nombres y Apellidos:</strong>
                  <span style="margin-left: 10px; text-transform: uppercase;">{{ datosFormulario.empleado?.nombre_completo }}</span>
                </td>
                <td style="padding: 5px; border: 1px solid #000; width: 200px;">
                  <strong>Código de empleado-C.I.:</strong>
                  <span style="margin-left: 5px;">{{ datosFormulario.empleado?.ci }}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 5px; border: 1px solid #000;">
                  <strong>Cargo:</strong>
                  <span style="margin-left: 10px;">{{ datosFormulario.empleado?.cargo || '_________________' }}</span>
                </td>
                <td style="padding: 5px; border: 1px solid #000;">
                  <strong>Área:</strong>
                  <span style="margin-left: 10px;">{{ datosFormulario.empleado?.sede || '_________________' }}</span>
                </td>
              </tr>
            </table>

            <!-- DIAS DE VACACION -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
              <tr>
                <td style="border: 1px solid #000; padding: 3px; width: 80px; text-align: center;">
                  <div style="font-weight: bold; font-size: 9px;">No. de días</div>
                  <div style="font-size: 14px; font-weight: bold;">{{ datosFormulario.solicitud?.dias_solicitados }}</div>
                </td>
                <td style="border: 1px solid #000; padding: 3px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 2px; text-align: center;"></td>
                      <td style="padding: 2px; text-align: center; font-size: 9px; font-weight: bold;">día</td>
                      <td style="padding: 2px; text-align: center; font-size: 9px; font-weight: bold;">mes</td>
                      <td style="padding: 2px; text-align: center; font-size: 9px; font-weight: bold;">año</td>
                      <td style="padding: 2px; text-align: center;"></td>
                      <td style="padding: 2px; text-align: center; font-size: 9px; font-weight: bold;">día</td>
                      <td style="padding: 2px; text-align: center; font-size: 9px; font-weight: bold;">mes</td>
                      <td style="padding: 2px; text-align: center; font-size: 9px; font-weight: bold;">año</td>
                    </tr>
                    <tr>
                      <td style="padding: 2px; font-weight: bold;">del</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud?.fecha_inicio).dia }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud?.fecha_inicio).mes }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud?.fecha_inicio).anio }}</td>
                      <td style="padding: 2px; font-weight: bold; padding-left: 15px;">al</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud?.fecha_fin).dia }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud?.fecha_fin).mes }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud?.fecha_fin).anio }}</td>
                    </tr>
                  </table>
                </td>
                <td style="border: 1px solid #000; padding: 3px; width: 150px;">
                  <div style="display: flex; justify-content: space-around;">
                    <span>Mañana <span style="border: 1px solid #000; padding: 0 5px;">{{ tieneTipoParcial('manana') ? 'X' : '' }}</span></span>
                    <span>Tarde <span style="border: 1px solid #000; padding: 0 5px;">{{ tieneTipoParcial('tarde') ? 'X' : '' }}</span></span>
                  </div>
                </td>
                <td rowspan="2" style="border: 1px solid #000; padding: 5px; width: 100px; text-align: center; vertical-align: bottom;">
                  <strong>Firma empleado</strong>
                </td>
              </tr>
              <tr>
                <td colspan="3" style="border: 1px solid #000; padding: 5px;">
                  <strong>MOTIVO:</strong>
                  Vacación programada <span style="border: 1px solid #000; padding: 0 5px; margin-left: 5px;">X</span>
                </td>
              </tr>
            </table>

            <!-- ADJUNTOS -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
              <tr>
                <td style="padding: 5px; border: 1px solid #000;">
                  <span style="border: 1px solid #000; padding: 0 8px; margin-right: 10px;"></span>
                  Adjunta informe de actividades pendientes (Si corresponde)
                </td>
                <td style="padding: 5px; border: 1px solid #000;">
                  <span style="border: 1px solid #000; padding: 0 8px; margin-right: 10px;"></span>
                  Otros ___________________________
                </td>
              </tr>
            </table>

            <!-- REEMPLAZO -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr>
                <td style="padding: 5px; border: 1px solid #000;" colspan="2">
                  <em><strong>Nombre de la persona que REEMPLAZA:</strong></em>
                  <span style="margin-left: 10px; border-bottom: 1px dashed #000; display: inline-block; min-width: 300px;">
                    {{ datosFormulario.solicitud?.reemplazo !== 'Sin Reemplazo' ? datosFormulario.solicitud?.reemplazo : '' }}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 5px; border: 1px solid #000;">Reemplazo con designación de interino (a. i.) mediante memorándum</td>
                <td style="padding: 5px; border: 1px solid #000; font-weight: bold; text-align: center;" rowspan="2">Comentarios</td>
              </tr>
              <tr>
                <td style="padding: 5px; border: 1px solid #000;">Reemplazo solo de funciones con memorándum</td>
              </tr>
            </table>

            <!-- AUTORIZACION -->
            <div style="text-align: center; font-weight: bold; font-size: 14px; margin: 15px 0;">AUTORIZACIÓN DE VACACIONES</div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
              <tr>
                <td style="padding: 5px;">
                  <span style="border: 1px solid #000; padding: 0 5px; margin-right: 5px;">{{ datosFormulario.solicitud?.estado === 'Aprobada' ? 'X' : '' }}</span>
                  Se acepta
                </td>
                <td style="padding: 5px;">
                  <span style="border: 1px solid #000; padding: 0 5px; margin-right: 5px;">{{ datosFormulario.solicitud?.estado === 'Rechazada' ? 'X' : '' }}</span>
                  Se rechaza
                </td>
              </tr>
            </table>

            <div style="margin-bottom: 15px;">
              <span>Justificación:</span>
              <span style="border-bottom: 1px solid #000; display: inline-block; width: 90%;">vacacion programada</span>
            </div>

            <div style="font-weight: bold; margin-bottom: 20px;">Vo.Bo.</div>

            <!-- FIRMAS VoBo -->
            <table style="width: 100%; margin-bottom: 20px;">
              <tr>
                <td style="text-align: center; width: 33%;">
                  <div style="border-top: 1px solid #000; width: 150px; margin: 0 auto;"></div>
                  <div><strong>Inmediato Superior</strong></div>
                </td>
                <td style="text-align: center; width: 33%;">
                  <div style="border-top: 1px solid #000; width: 150px; margin: 0 auto;"></div>
                  <div><strong>Jefatura de R.S.C y G. T.H</strong></div>
                </td>
                <td style="text-align: center; width: 33%;">
                  <div style="border-top: 1px solid #000; width: 150px; margin: 0 auto;"></div>
                  <div><strong>DAF</strong></div>
                </td>
              </tr>
            </table>

            <!-- CONTROL DE VACACIONES -->
            <div style="text-align: center; font-weight: bold; font-size: 12px;">CONTROL DE VACACIONES</div>
            <div style="text-align: center; font-size: 9px; margin-bottom: 10px;">(Para uso exclusivo de Recursos Humanos y Personal)</div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
              <tr>
                <td style="padding: 5px;">
                  Fecha de ingreso:
                </td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 40px;">
                  {{ getFechaPartes(datosFormulario.empleado?.fecha_ingreso).dia }}
                </td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 40px;">
                  {{ getFechaPartes(datosFormulario.empleado?.fecha_ingreso).mes }}
                </td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 50px;">
                  {{ getFechaPartes(datosFormulario.empleado?.fecha_ingreso).anio }}
                </td>
                <td style="width: 50%;"></td>
              </tr>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
              <tr>
                <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">Gestiones</td>
                <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">años de<br>servicios</td>
                <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">días que le<br>corresponden</td>
                <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">días<br>pendientes</td>
                <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">días a<br>utilizar</td>
                <td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">saldo<br>actual</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ new Date().getFullYear() }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.empleado?.anos_servicio }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.empleado?.dias_correspondientes || getDiasCorrespondientes(datosFormulario.empleado?.anos_servicio) }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.saldo?.actual }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.solicitud?.dias_solicitados }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.saldo?.despues }}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
              </tr>
            </table>

            <div style="text-align: right; margin-bottom: 15px;">
              <strong>SALDO TOTAL PENDIENTE</strong>
              <span style="border: 1px solid #000; padding: 3px 15px; margin-left: 10px;">{{ datosFormulario.saldo?.despues }}</span>
            </div>

            <div style="font-weight: bold;">JEFE DE R.S.C Y GESTION DE TALENTO<br>HUMANO</div>
          </div>
        </q-card-section>

        <q-card-section v-else class="flex flex-center q-pa-xl">
          <q-spinner-dots size="40px" color="primary" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import empleadoService from '@/services/empleadoService'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const empleado = ref(null)
const loading = ref(true)
const loadingFormulario = ref(null)
const dialogFormulario = ref(false)
const datosFormulario = ref(null)

const saldoClass = computed(() => {
  if (!empleado.value) return 'bg-grey-2'
  const saldo = empleado.value.saldo_vacaciones
  if (saldo < 0) return 'bg-red-1 text-negative'
  if (saldo === 0) return 'bg-orange-1 text-warning'
  return 'bg-green-1 text-positive'
})

// Separar solicitudes propias de las programadas por RRHH
const vacacionesProgramadas = computed(() => {
  if (!empleado.value?.solicitudes) return []
  return empleado.value.solicitudes.filter(s => 
    s.lugar_solicitud === 'Programada por RRHH'
  )
})

const solicitudesPropias = computed(() => {
  if (!empleado.value?.solicitudes) return []
  return empleado.value.solicitudes.filter(s => 
    s.lugar_solicitud !== 'Programada por RRHH'
  )
})

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getEstadoColor(estado) {
  const colors = { 
    pendiente: 'warning', 
    pendiente_documento: 'orange',
    aprobada: 'positive', 
    rechazada: 'negative' 
  }
  return colors[estado] || 'grey'
}

function getEstadoIcon(estado) {
  const icons = { 
    pendiente: 'schedule', 
    pendiente_documento: 'description',
    aprobada: 'check_circle', 
    rechazada: 'cancel' 
  }
  return icons[estado] || 'help'
}

function traducirEstado(estado) {
  const estados = { 
    pendiente: 'Pendiente', 
    pendiente_documento: 'Pend. Documento',
    aprobada: 'Aprobada', 
    rechazada: 'Rechazada' 
  }
  return estados[estado] || estado
}

function traducirTipo(tipo) {
  const tipos = { 
    completo: 'Día Completo', 
    parcial_manana: 'Mañana', 
    parcial_tarde: 'Tarde',
    completa_continua: 'Continua',
    completa_discontinua: 'Discontinua',
    parcial_continua: 'Parcial Continua',
    parcial_discontinua: 'Parcial Discontinua'
  }
  return tipos[tipo] || tipo || '-'
}

function irASolicitud() {
  router.push(`/solicitud/${route.params.ci}`)
}

async function descargarFormulario(solicitudId) {
  loadingFormulario.value = solicitudId
  try {
    const response = await empleadoService.getFormularioData(solicitudId)
    if (response.success) {
      datosFormulario.value = response.data
      dialogFormulario.value = true
    } else {
      $q.notify({ type: 'negative', message: 'Error al cargar formulario' })
    }
  } catch (error) {
    console.error('Error:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar formulario' })
  } finally {
    loadingFormulario.value = null
  }
}

function imprimirFormulario() {
  window.print()
}

// Funciones helper para el formulario oficial
function getFechaPartes(fechaStr) {
  if (!fechaStr) return { dia: '', mes: '', anio: '' }
  const partes = fechaStr.split('/')
  if (partes.length === 3) {
    return { dia: partes[0], mes: partes[1], anio: partes[2] }
  }
  // Si viene en formato ISO
  const fecha = new Date(fechaStr)
  return {
    dia: String(fecha.getDate()).padStart(2, '0'),
    mes: String(fecha.getMonth() + 1).padStart(2, '0'),
    anio: fecha.getFullYear()
  }
}

function tieneTipoParcial(periodo) {
  if (!datosFormulario.value?.solicitud?.tipo) return false
  const tipo = datosFormulario.value.solicitud.tipo.toLowerCase()
  if (periodo === 'manana') {
    return tipo.includes('mañana') || tipo.includes('parcial')
  }
  if (periodo === 'tarde') {
    return tipo.includes('tarde')
  }
  return false
}

function getDiasCorrespondientes(anosServicio) {
  if (!anosServicio) return 0
  if (anosServicio >= 10) return 30
  if (anosServicio >= 5) return 20
  if (anosServicio >= 1) return 15
  return 0
}

const loadingPDF = ref(false)

async function descargarPDF() {
  loadingPDF.value = true
  try {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById('formulario-print')
    const opt = {
      margin: 10,
      filename: `Formulario_Vacaciones_${datosFormulario.value?.solicitud?.id || 'solicitud'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    await html2pdf().set(opt).from(element).save()
    $q.notify({ type: 'positive', message: 'PDF descargado correctamente' })
  } catch (error) {
    console.error('Error generando PDF:', error)
    $q.notify({ type: 'negative', message: 'Error al generar PDF' })
  } finally {
    loadingPDF.value = false
  }
}

async function cargarEmpleado() {
  loading.value = true
  try {
    // Intentar obtener datos desde sessionStorage
    const storedData = sessionStorage.getItem('empleadoSearch')
    
    if (storedData) {
      const parsed = JSON.parse(storedData)
      // Verificar que el CI coincida con el de la ruta
      if (parsed.ci === route.params.ci && parsed.empleado) {
        empleado.value = parsed.empleado
        loading.value = false
        return
      }
    }
    
    // Si no hay datos en sessionStorage o el CI no coincide, redirigir a búsqueda
    router.push('/')
  } catch (error) {
    console.error('Error cargando empleado:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
}

onMounted(cargarEmpleado)
</script>

<style>
@media print {
  @page {
    margin: 10mm;
    size: A4;
  }

  /* Ocultar header y footer del navegador (URL, fecha, título) */
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Ocultar todo excepto el formulario */
  body * {
    visibility: hidden;
  }
  
  #formulario-print, #formulario-print * {
    visibility: visible;
  }
  
  #formulario-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Ocultar elementos no imprimibles */
  .no-print {
    display: none !important;
  }
}
</style>
