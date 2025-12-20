<template>
  <q-page class="q-pa-md">
    <!-- Filtros -->
    <q-card class="q-mb-md shadow-2">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtros.estado"
              :options="estadoOptions"
              label="Estado"
              emit-value
              map-options
              outlined
              dense
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-input v-model="filtros.buscar" label="Buscar empleado" outlined dense clearable>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-2">
            <q-input v-model="filtros.fecha_desde" label="Desde" type="date" outlined dense />
          </div>
          <div class="col-12 col-sm-2">
            <q-input v-model="filtros.fecha_hasta" label="Hasta" type="date" outlined dense />
          </div>
          <div class="col-12 col-sm-2">
            <q-btn color="primary" icon="search" label="Buscar" @click="cargarSolicitudes" unelevated no-caps />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla -->
    <q-card class="shadow-2">
      <q-table
        :rows="solicitudes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        flat
      >
        <template v-slot:body-cell-empleado="props">
          <q-td :props="props">
            <div>{{ props.row.empleado?.nombre_completo }}</div>
            <div class="text-caption text-grey">CI: {{ props.row.empleado?.ci }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-fechas="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha_inicio) }} - {{ formatDate(props.row.fecha_fin) }}
          </q-td>
        </template>

        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            {{ traducirTipo(props.row.tipo) }}
          </q-td>
        </template>

        <template v-slot:body-cell-reemplazo="props">
          <q-td :props="props">
            <span v-if="props.row.tiene_reemplazo" class="text-positive">
              {{ props.row.nombre_reemplazo }}
            </span>
            <span v-else class="text-grey">Sin Reemplazo</span>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="getEstadoColor(props.row.estado)">
              {{ traducirEstado(props.row.estado) }}
            </q-badge>
            <q-icon 
              v-if="props.row.documento_entregado" 
              name="check_circle" 
              color="positive" 
              size="xs" 
              class="q-ml-xs"
            >
              <q-tooltip>Documento recibido</q-tooltip>
            </q-icon>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <div class="row q-gutter-xs no-wrap">
              <!-- Botón descargar formulario -->
              <q-btn size="sm" round flat color="info" icon="description" @click="descargarFormulario(props.row.id)">
                <q-tooltip>Descargar Formulario</q-tooltip>
              </q-btn>

              <!-- Acciones según estado -->
              <template v-if="props.row.estado === 'pendiente'">
                <q-btn size="sm" round flat color="positive" icon="check" @click="aprobar(props.row.id)">
                  <q-tooltip>Aprobar</q-tooltip>
                </q-btn>
                <q-btn size="sm" round flat color="negative" icon="close" @click="mostrarRechazo(props.row)">
                  <q-tooltip>Rechazar</q-tooltip>
                </q-btn>
              </template>

              <template v-else-if="props.row.estado === 'pendiente_documento'">
                <q-btn size="sm" round flat color="positive" icon="check_circle" @click="confirmarDocumento(props.row.id)" :loading="loadingConfirmar === props.row.id">
                  <q-tooltip>Confirmar Documento Recibido</q-tooltip>
                </q-btn>
                <q-btn size="sm" round flat color="negative" icon="close" @click="mostrarRechazo(props.row)">
                  <q-tooltip>Rechazar</q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog rechazo -->
    <q-dialog v-model="dialogRechazo">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Rechazar Solicitud</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="q-mb-md">
            <strong>Empleado:</strong> {{ solicitudRechazo?.empleado?.nombre_completo }}<br>
            <strong>Días:</strong> {{ solicitudRechazo?.dias_solicitados }}
          </p>
          <q-input
            v-model="motivoRechazo"
            label="Motivo del rechazo"
            type="textarea"
            outlined
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" label="Rechazar" @click="rechazar" :loading="loadingAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog formulario oficial UNITEPC -->
    <q-dialog v-model="dialogFormulario" maximized>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white no-print">
          <q-icon name="description" size="sm" class="q-mr-sm" />
          <div class="text-h6">Formulario de Vacaciones</div>
          <q-space />
          <q-btn icon="picture_as_pdf" flat round @click="descargarPDF" :loading="loadingPDF">
            <q-tooltip>Descargar PDF</q-tooltip>
          </q-btn>
          <q-btn icon="article" flat round @click="descargarWord" :loading="loadingWord">
            <q-tooltip>Descargar Word</q-tooltip>
          </q-btn>
          <q-btn icon="print" flat round @click="imprimirFormulario">
            <q-tooltip>Imprimir</q-tooltip>
          </q-btn>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="datosFormulario" class="q-pa-md" id="formulario-print">
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
                <span style="border: 1px solid #000; padding: 2px 15px; margin-left: 5px;">{{ datosFormulario.solicitud.id }}</span>
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
                  <td style="border: 1px solid #000; padding: 2px 8px;">{{ datosFormulario.empleado.sede || 'CBBA' }}</td>
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
                  <span style="margin-left: 10px; text-transform: uppercase;">{{ datosFormulario.empleado.nombre_completo }}</span>
                </td>
                <td style="padding: 5px; border: 1px solid #000; width: 200px;">
                  <strong>Código de empleado-C.I.:</strong>
                  <span style="margin-left: 5px;">{{ datosFormulario.empleado.ci }}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 5px; border: 1px solid #000;">
                  <strong>Cargo:</strong>
                  <span style="margin-left: 10px;">{{ datosFormulario.empleado.cargo || '_________________' }}</span>
                </td>
                <td style="padding: 5px; border: 1px solid #000;">
                  <strong>Área:</strong>
                  <span style="margin-left: 10px;">{{ datosFormulario.empleado.sede || '_________________' }}</span>
                </td>
              </tr>
            </table>

            <!-- DIAS DE VACACION -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
              <tr>
                <td style="border: 1px solid #000; padding: 3px; width: 80px; text-align: center;">
                  <div style="font-weight: bold; font-size: 9px;">No. de días</div>
                  <div style="font-size: 14px; font-weight: bold;">{{ datosFormulario.solicitud.dias_solicitados }}</div>
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
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud.fecha_inicio).dia }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud.fecha_inicio).mes }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud.fecha_inicio).anio }}</td>
                      <td style="padding: 2px; font-weight: bold; padding-left: 15px;">al</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud.fecha_fin).dia }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud.fecha_fin).mes }}</td>
                      <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datosFormulario.solicitud.fecha_fin).anio }}</td>
                    </tr>
                  </table>
                </td>
                <td style="border: 1px solid #000; padding: 3px; width: 150px;">
                  <div style="display: flex; justify-content: space-around;">
                    <span>Mañana <span style="border: 1px solid #000; padding: 0 5px;">{{ tieneTipo('parcial_manana') ? 'X' : '' }}</span></span>
                    <span>Tarde <span style="border: 1px solid #000; padding: 0 5px;">{{ tieneTipo('parcial_tarde') ? 'X' : '' }}</span></span>
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
                    {{ datosFormulario.solicitud.reemplazo !== 'Sin Reemplazo' ? datosFormulario.solicitud.reemplazo : '' }}
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
                  <span style="border: 1px solid #000; padding: 0 5px; margin-right: 5px;">{{ datosFormulario.solicitud.estado === 'Aprobada' ? 'X' : '' }}</span>
                  Se acepta
                </td>
                <td style="padding: 5px;">
                  <span style="border: 1px solid #000; padding: 0 5px; margin-right: 5px;">{{ datosFormulario.solicitud.estado === 'Rechazada' ? 'X' : '' }}</span>
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
                  {{ getFechaPartes(datosFormulario.empleado.fecha_ingreso).dia }}
                </td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 40px;">
                  {{ getFechaPartes(datosFormulario.empleado.fecha_ingreso).mes }}
                </td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 50px;">
                  {{ getFechaPartes(datosFormulario.empleado.fecha_ingreso).anio }}
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
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.empleado.anos_servicio }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.empleado.dias_correspondientes || getDiasCorrespondientes(datosFormulario.empleado.anos_servicio) }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.saldo.actual }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.solicitud.dias_solicitados }}</td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datosFormulario.saldo.despues }}</td>
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
              <span style="border: 1px solid #000; padding: 3px 15px; margin-left: 10px;">{{ datosFormulario.saldo.despues }}</span>
            </div>

            <div style="font-weight: bold;">JEFE DE R.S.C Y GESTION DE TALENTO<br>HUMANO</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import adminService from '@/services/adminService'

const $q = useQuasar()

const loading = ref(false)
const loadingAction = ref(false)
const loadingConfirmar = ref(null)
const solicitudes = ref([])

const filtros = ref({
  estado: 'todos',
  buscar: '',
  fecha_desde: '',
  fecha_hasta: ''
})

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

const dialogRechazo = ref(false)
const dialogFormulario = ref(false)
const solicitudRechazo = ref(null)
const motivoRechazo = ref('')
const datosFormulario = ref(null)

const estadoOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'pendiente_documento', label: 'Pendiente Documento' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Rechazadas' }
]

const columns = [
  { name: 'empleado', label: 'Empleado', field: 'empleado', align: 'left' },
  { name: 'fecha_solicitud', label: 'Fecha Solicitud', field: row => formatDate(row.fecha_solicitud), align: 'left' },
  { name: 'fechas', label: 'Período', align: 'left' },
  { name: 'dias_solicitados', label: 'Días', field: 'dias_solicitados', align: 'center' },
  { name: 'tipo', label: 'Tipo', align: 'left' },
  { name: 'reemplazo', label: 'Reemplazo', align: 'left' },
  { name: 'estado', label: 'Estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getEstadoColor(estado) {
  return { 
    pendiente: 'warning', 
    pendiente_documento: 'orange', 
    aprobada: 'positive', 
    rechazada: 'negative' 
  }[estado] || 'grey'
}

function traducirEstado(estado) {
  return { 
    pendiente: 'Pendiente', 
    pendiente_documento: 'Pend. Documento', 
    aprobada: 'Aprobada', 
    rechazada: 'Rechazada' 
  }[estado] || estado
}

function traducirTipo(tipo) {
  return { 
    completo: 'Completo', 
    parcial_manana: 'Mañana', 
    parcial_tarde: 'Tarde',
    completa_continua: 'Completa Continua',
    completa_discontinua: 'Completa Discontinua',
    parcial_continua: 'Parcial Continua',
    parcial_discontinua: 'Parcial Discontinua'
  }[tipo] || tipo || '-'
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

function tieneTipo(tipo) {
  // Verificar si la solicitud tiene días con ese tipo
  if (!datosFormulario.value?.solicitud?.tipo) return false
  const tipoSolicitud = datosFormulario.value.solicitud.tipo
  if (tipo === 'parcial_manana') {
    return tipoSolicitud.includes('parcial') || tipoSolicitud === 'Medio Día (Mañana)'
  }
  if (tipo === 'parcial_tarde') {
    return tipoSolicitud.includes('parcial') || tipoSolicitud === 'Medio Día (Tarde)'
  }
  return false
}

function getDiasCorrespondientes(anosServicio) {
  if (anosServicio >= 10) return 30
  if (anosServicio >= 5) return 20
  if (anosServicio >= 1) return 15
  return 0
}

function mostrarRechazo(solicitud) {
  solicitudRechazo.value = solicitud
  motivoRechazo.value = ''
  dialogRechazo.value = true
}

async function aprobar(id) {
  loadingAction.value = true
  try {
    await adminService.aprobarSolicitud(id)
    $q.notify({ type: 'positive', message: 'Solicitud aprobada. Días descontados del saldo.' })
    cargarSolicitudes()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al aprobar solicitud' })
  } finally {
    loadingAction.value = false
  }
}

async function confirmarDocumento(id) {
  loadingConfirmar.value = id
  try {
    await adminService.confirmarDocumento(id)
    $q.notify({ type: 'positive', message: 'Documento confirmado. Vacaciones aprobadas.' })
    cargarSolicitudes()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al confirmar documento' })
  } finally {
    loadingConfirmar.value = null
  }
}

async function descargarFormulario(id) {
  try {
    const res = await adminService.getFormularioData(id)
    datosFormulario.value = res.data
    dialogFormulario.value = true
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos del formulario' })
  }
}

function imprimirFormulario() {
  window.print()
}

const loadingPDF = ref(false)
const loadingWord = ref(false)

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

async function descargarWord() {
  loadingWord.value = true
  try {
    const element = document.getElementById('formulario-print')
    const htmlContent = element.innerHTML
    
    // Crear documento Word
    const docContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Formulario de Vacaciones</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #000; padding: 5px; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `
    
    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Formulario_Vacaciones_${datosFormulario.value?.solicitud?.id || 'solicitud'}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    $q.notify({ type: 'positive', message: 'Word descargado correctamente' })
  } catch (error) {
    console.error('Error generando Word:', error)
    $q.notify({ type: 'negative', message: 'Error al generar Word' })
  } finally {
    loadingWord.value = false
  }
}

async function rechazar() {
  if (!motivoRechazo.value.trim()) {
    $q.notify({ type: 'warning', message: 'Ingrese el motivo del rechazo' })
    return
  }

  loadingAction.value = true
  try {
    await adminService.rechazarSolicitud(solicitudRechazo.value.id, motivoRechazo.value)
    $q.notify({ type: 'positive', message: 'Solicitud rechazada' })
    dialogRechazo.value = false
    cargarSolicitudes()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al rechazar solicitud' })
  } finally {
    loadingAction.value = false
  }
}

async function onRequest(props) {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  await cargarSolicitudes()
}

async function cargarSolicitudes() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      estado: filtros.value.estado !== 'todos' ? filtros.value.estado : undefined,
      fecha_desde: filtros.value.fecha_desde || undefined,
      fecha_hasta: filtros.value.fecha_hasta || undefined
    }

    const response = await adminService.getSolicitudes(params)
    solicitudes.value = response.data?.data || []
    pagination.value.rowsNumber = response.data?.total || 0
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar solicitudes' })
  } finally {
    loading.value = false
  }
}

onMounted(cargarSolicitudes)
</script>

<style>
@media print {
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
}
</style>

