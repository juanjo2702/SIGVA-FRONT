<template>
  <div class="calendario-vacaciones">
    <!-- Panel de Etapas -->
    <div class="etapas-container q-mb-md">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">
        <q-icon name="layers" class="q-mr-xs" />
        Etapas de Vacaciones
      </div>

      <!-- Lista de Etapas -->
      <div v-for="(etapa, idx) in etapas" :key="idx" class="etapa-card q-mb-sm"
        :class="{ 'etapa-activa': idx === etapaActiva }" :style="{ borderLeftColor: coloresEtapas[idx] }"
        @click="seleccionarEtapa(idx)">

        <div class="row items-center justify-between q-mb-xs">
          <div class="etapa-header">
            <q-badge :style="{ backgroundColor: coloresEtapas[idx] }" class="q-mr-sm">
              Etapa {{ idx + 1 }}
            </q-badge>
            <span v-if="etapa.dias.length > 0" class="text-caption text-grey-7">
              {{ getRangoFechas(etapa) }}
            </span>
            <span v-else class="text-caption text-grey-5 text-italic">
              (sin días seleccionados)
            </span>
          </div>
          <div>
            <q-btn v-if="etapas.length > 1" flat round size="sm" icon="delete" color="negative"
              @click.stop="eliminarEtapa(idx)">
              <q-tooltip>Eliminar etapa</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Previsualización de días de la etapa -->
        <div v-if="etapa.dias.length > 0" class="etapa-preview">
          <q-chip v-for="dia in getDiasOrdenados(etapa.dias)" :key="dia.fecha" removable size="sm"
            @remove="quitarDiaDeEtapa(idx, dia.fecha)" :style="{ backgroundColor: coloresEtapas[idx], color: 'white' }">
            {{ formatFechaCorta(dia.fecha) }} - {{ getTipoLabel(dia.tipo) }}
          </q-chip>
        </div>

        <!-- Resumen de la etapa -->
        <div v-if="etapa.dias.length > 0" class="etapa-resumen text-caption q-mt-xs">
          <q-icon name="schedule" size="xs" class="q-mr-xs" />
          {{ calcularDiasEtapa(etapa) }} día(s) en esta etapa
        </div>
      </div>

      <!-- Botón Añadir Etapa -->
      <q-btn outline color="primary" icon="add" label="Añadir nueva etapa" class="full-width q-mt-sm" no-caps
        @click="agregarEtapa" :disable="etapas.length >= 6" />
      <div v-if="etapas.length >= 6" class="text-caption text-grey-6 text-center q-mt-xs">
        Máximo 6 etapas permitidas
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Indicador de etapa activa -->
    <div class="row items-center q-mb-sm">
      <q-icon name="edit_calendar" class="q-mr-xs" :style="{ color: coloresEtapas[etapaActiva] }" />
      <span class="text-body2">Seleccionando días para <strong :style="{ color: coloresEtapas[etapaActiva] }">Etapa {{
        etapaActiva + 1 }}</strong></span>
    </div>

    <!-- Header con navegación de mes -->
    <div class="row items-center justify-between q-mb-md">
      <q-btn flat round icon="chevron_left" @click="mesAnterior" />
      <div class="text-h6 text-capitalize">{{ mesActual }}</div>
      <q-btn flat round icon="chevron_right" @click="mesSiguiente" />
    </div>

    <!-- Días de la semana -->
    <div class="row calendario-header">
      <div v-for="dia in diasSemana" :key="dia"
        class="col calendario-header-dia text-center text-caption text-weight-bold">
        {{ dia }}
      </div>
    </div>

    <!-- Grilla del calendario -->
    <div class="calendario-grid">
      <div v-for="(semana, idx) in semanasDelMes" :key="idx" class="row">
        <div v-for="dia in semana" :key="dia.fecha" class="col calendario-dia" :class="getDiaClasses(dia)"
          :style="getDiaStyle(dia)" @click="toggleDia(dia)">
          <div class="dia-numero">{{ dia.numero }}</div>
          <div v-if="dia.esFeriado" class="dia-feriado-icono">
            <q-icon name="celebration" size="12px" color="red" />
          </div>
          <div v-else-if="getDiaEtapa(dia) !== null" class="dia-etapa-badge">
            <q-badge :style="{ backgroundColor: coloresEtapas[getDiaEtapa(dia)] }" size="xs">
              E{{ getDiaEtapa(dia) + 1 }}
            </q-badge>
          </div>
          <q-tooltip v-if="dia.esFeriado">{{ dia.feriadoNombre }}</q-tooltip>
        </div>
      </div>
    </div>

    <!-- Leyenda de colores -->
    <div class="q-mt-sm">
      <div class="row q-gutter-sm items-center">
        <div class="text-caption text-grey-7">Leyenda:</div>
        <div v-for="(etapa, idx) in etapas" :key="idx" class="row items-center">
          <div class="leyenda-color" :style="{ backgroundColor: coloresEtapas[idx] }"></div>
          <span class="text-caption q-ml-xs">E{{ idx + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- Panel de resumen total -->
    <q-card class="q-mt-md" flat bordered>
      <q-card-section class="q-pa-sm">
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="summarize" class="q-mr-xs" />
          Resumen Total
        </div>

        <div class="row justify-between items-center">
          <div>
            <span class="text-weight-bold">Total a descontar:</span>
            <span class="text-primary text-h6 q-ml-sm">{{ totalDias }} días</span>
          </div>
          <div class="text-right">
            <div class="text-caption">Saldo actual: {{ saldoActual }}</div>
            <div class="text-caption" :class="saldoResultante < 0 ? 'text-negative' : 'text-positive'">
              Saldo después: {{ saldoResultante }}
            </div>
          </div>
        </div>

        <!-- Desglose por etapas -->
        <q-separator class="q-my-sm" />
        <div class="row q-gutter-sm">
          <div v-for="(etapa, idx) in etapas" :key="idx" class="text-caption">
            <q-badge :style="{ backgroundColor: coloresEtapas[idx] }">
              E{{ idx + 1 }}: {{ calcularDiasEtapa(etapa) }} días
            </q-badge>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog para seleccionar tipo de día -->
    <q-dialog v-model="dialogTipo" persistent>
      <q-card style="min-width: 280px">
        <q-card-section class="text-white" :style="{ backgroundColor: coloresEtapas[etapaActiva] }">
          <div class="text-h6">{{ fechaSeleccionada?.diaSemana }} {{ formatFecha(fechaSeleccionada?.fecha) }}</div>
          <div class="text-caption">Etapa {{ etapaActiva + 1 }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-btn-toggle v-model="tipoSeleccionado" spread no-caps toggle-color="primary" :options="opcionesTipo"
            class="q-mb-md" />

          <q-banner v-if="fechaSeleccionada?.esSabado" class="bg-info text-white q-mt-sm" rounded dense>
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            Sábado: siempre día completo
          </q-banner>

          <div class="text-center q-mt-md">
            <span class="text-h5">{{ getDiasDescontados() }}</span>
            <span class="text-body2"> día(s) a descontar</span>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" @click="cancelarSeleccion" />
          <q-btn flat label="Quitar día" color="negative" @click="quitarDiaActual" v-if="diaYaSeleccionado" />
          <q-btn unelevated label="Confirmar" :style="{ backgroundColor: coloresEtapas[etapaActiva], color: 'white' }"
            @click="confirmarSeleccion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  empleado: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'change'])

// Colores distintivos para las etapas
const coloresEtapas = [
  '#1976d2', // Azul
  '#388e3c', // Verde
  '#f57c00', // Naranja
  '#7b1fa2', // Púrpura
  '#0097a7', // Cyan
  '#c2185b'  // Rosa
]

// Estado
const mesActualDate = ref(new Date())
const etapas = ref([{ dias: [] }]) // Siempre empieza con una etapa
const etapaActiva = ref(0)
const dialogTipo = ref(false)
const fechaSeleccionada = ref(null)
const tipoSeleccionado = ref('completo')
const diaYaSeleccionado = ref(false)
const feriados = ref([])

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ¿Es mujer de medio tiempo?
const esMujerMedioTiempo = computed(() => {
  return props.empleado?.genero === 'Femenino' && props.empleado?.tipo_contrato === 'medio_tiempo'
})

const esMedioTiempo = computed(() => {
  return props.empleado?.tipo_contrato === 'medio_tiempo'
})

// Opciones de tipo (sábado solo completo)
const opcionesTipo = computed(() => {
  if (fechaSeleccionada.value?.esSabado) {
    return [{ label: 'Día Completo', value: 'completo' }]
  }
  return [
    { label: 'Completo', value: 'completo' },
    { label: 'Mañana', value: 'parcial_manana' },
    { label: 'Tarde', value: 'parcial_tarde' }
  ]
})

// Mes actual formateado
const mesActual = computed(() => {
  return mesActualDate.value.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })
})

// Calcular semanas del mes
const semanasDelMes = computed(() => {
  const year = mesActualDate.value.getFullYear()
  const month = mesActualDate.value.getMonth()
  const primerDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 0)

  const semanas = []
  let semana = []

  // Rellenar días vacíos al inicio
  for (let i = 0; i < primerDia.getDay(); i++) {
    semana.push({ numero: '', fecha: null, deshabilitado: true })
  }

  // Días del mes
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const fecha = new Date(year, month, dia)
    const fechaStr = formatFechaISO(fecha)
    const esDomingo = fecha.getDay() === 0
    const esSabado = fecha.getDay() === 6
    const esAnterior = fecha < new Date(new Date().setHours(0, 0, 0, 0))
    const feriadoInfo = getFeriadoInfo(fechaStr)
    const esFeriado = !!feriadoInfo

    // Mujer medio tiempo no puede seleccionar sábados, y feriados nunca se pueden seleccionar
    const deshabilitado = esDomingo || esAnterior || esFeriado || (esMujerMedioTiempo.value && esSabado)

    semana.push({
      numero: dia,
      fecha: fechaStr,
      esDomingo,
      esSabado,
      esAnterior,
      esFeriado,
      feriadoNombre: feriadoInfo?.nombre || null,
      deshabilitado,
      diaSemana: diasSemana[fecha.getDay()]
    })

    if (semana.length === 7) {
      semanas.push(semana)
      semana = []
    }
  }

  // Rellenar días vacíos al final
  while (semana.length > 0 && semana.length < 7) {
    semana.push({ numero: '', fecha: null, deshabilitado: true })
  }
  if (semana.length > 0) {
    semanas.push(semana)
  }

  return semanas
})

// Todos los días seleccionados (de todas las etapas)
const todosDias = computed(() => {
  if (!Array.isArray(etapas.value)) return []
  return etapas.value.flatMap((etapa, idx) =>
    (etapa?.dias || []).map(d => ({ ...d, etapaIdx: idx }))
  )
})

// Cálculos de días
const totalDias = computed(() => {
  return todosDias.value.reduce((sum, d) => sum + (d.diasDescontados || 0), 0)
})

const saldoActual = computed(() => props.empleado?.saldo_vacaciones || 0)
const saldoResultante = computed(() => saldoActual.value - totalDias.value)

// Funciones de etapas
function agregarEtapa() {
  if (etapas.value.length < 6) {
    etapas.value.push({ dias: [] })
    etapaActiva.value = etapas.value.length - 1
  }
}

function eliminarEtapa(idx) {
  if (etapas.value.length > 1) {
    etapas.value.splice(idx, 1)
    if (etapaActiva.value >= etapas.value.length) {
      etapaActiva.value = etapas.value.length - 1
    }
    emitChange()
  }
}

function seleccionarEtapa(idx) {
  etapaActiva.value = idx
}

function getRangoFechas(etapa) {
  if (!etapa?.dias || etapa.dias.length === 0) return ''
  const ordenados = getDiasOrdenados(etapa.dias)
  if (ordenados.length === 0) return ''
  const primera = ordenados[0].fecha
  const ultima = ordenados[ordenados.length - 1].fecha
  if (primera === ultima) {
    return formatFechaCorta(primera)
  }
  return `${formatFechaCorta(primera)} al ${formatFechaCorta(ultima)}`
}

function getDiasOrdenados(dias) {
  if (!Array.isArray(dias)) return []
  return [...dias].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
}

function calcularDiasEtapa(etapa) {
  if (!etapa?.dias) return 0
  return etapa.dias.reduce((sum, d) => sum + (d.diasDescontados || 0), 0)
}

function quitarDiaDeEtapa(etapaIdx, fecha) {
  etapas.value[etapaIdx].dias = etapas.value[etapaIdx].dias.filter(d => d.fecha !== fecha)
  emitChange()
}

// Métodos de navegación
function mesAnterior() {
  mesActualDate.value = new Date(mesActualDate.value.getFullYear(), mesActualDate.value.getMonth() - 1, 1)
}

function mesSiguiente() {
  mesActualDate.value = new Date(mesActualDate.value.getFullYear(), mesActualDate.value.getMonth() + 1, 1)
}

// Helpers
function formatFechaISO(date) {
  return date.toISOString().split('T')[0]
}

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
}

function formatFechaCorta(fechaStr) {
  if (!fechaStr) return ''
  return new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
}

function getDiaEtapa(dia) {
  if (!dia.fecha) return null
  for (let i = 0; i < etapas.value.length; i++) {
    if (etapas.value[i].dias.some(d => d.fecha === dia.fecha)) {
      return i
    }
  }
  return null
}

function diaSeleccionado(dia) {
  return getDiaEtapa(dia) !== null
}

function getDiaClasses(dia) {
  const classes = []
  if (dia.deshabilitado) classes.push('deshabilitado')
  if (dia.esDomingo) classes.push('domingo')
  if (dia.esSabado) classes.push('sabado')
  if (dia.esAnterior) classes.push('anterior')
  if (dia.esFeriado) classes.push('feriado')
  if (diaSeleccionado(dia)) {
    classes.push('seleccionado')
  }
  return classes
}

function getDiaStyle(dia) {
  const etapaIdx = getDiaEtapa(dia)
  if (etapaIdx !== null) {
    const color = coloresEtapas[etapaIdx]
    return {
      backgroundColor: color,
      color: 'white'
    }
  }
  return {}
}

// Helper para obtener info de feriado
function getFeriadoInfo(fechaStr) {
  return feriados.value.find(f => f.fecha.split('T')[0] === fechaStr)
}

function getTipoLabel(tipo) {
  return { completo: 'Día', parcial_manana: 'AM', parcial_tarde: 'PM' }[tipo] || ''
}

// Toggle día
function toggleDia(dia) {
  if (dia.deshabilitado || !dia.fecha) return

  fechaSeleccionada.value = dia
  const etapaDelDia = getDiaEtapa(dia)
  diaYaSeleccionado.value = etapaDelDia !== null

  if (diaYaSeleccionado.value) {
    // Si el día ya está seleccionado, cambiamos a esa etapa para editarlo
    etapaActiva.value = etapaDelDia
    const diaInfo = etapas.value[etapaDelDia].dias.find(d => d.fecha === dia.fecha)
    tipoSeleccionado.value = diaInfo?.tipo || 'completo'
  } else {
    tipoSeleccionado.value = 'completo'
  }

  // Sábado siempre completo
  if (dia.esSabado) {
    tipoSeleccionado.value = 'completo'
  }

  dialogTipo.value = true
}

function getDiasDescontados() {
  if (!fechaSeleccionada.value) return 0

  const tipo = tipoSeleccionado.value

  // Sábado siempre 1
  if (fechaSeleccionada.value.esSabado) return 1

  // Parcial
  if (tipo !== 'completo') {
    return esMedioTiempo.value ? 1 : 0.5
  }

  return 1
}

function confirmarSeleccion() {
  const diaInfo = {
    fecha: fechaSeleccionada.value.fecha,
    tipo: tipoSeleccionado.value,
    diasDescontados: getDiasDescontados(),
    diaSemana: fechaSeleccionada.value.diaSemana,
    esSabado: fechaSeleccionada.value.esSabado
  }

  // Si el día ya estaba en alguna etapa, lo quitamos primero
  for (let i = 0; i < etapas.value.length; i++) {
    etapas.value[i].dias = etapas.value[i].dias.filter(d => d.fecha !== diaInfo.fecha)
  }

  // Agregamos a la etapa activa
  etapas.value[etapaActiva.value].dias.push(diaInfo)

  dialogTipo.value = false
  emitChange()
}

function cancelarSeleccion() {
  dialogTipo.value = false
}

function quitarDiaActual() {
  for (let i = 0; i < etapas.value.length; i++) {
    etapas.value[i].dias = etapas.value[i].dias.filter(d => d.fecha !== fechaSeleccionada.value.fecha)
  }
  dialogTipo.value = false
  emitChange()
}

function emitChange() {
  // Generar datos aplanados para el modelValue (compatibilidad)
  const datos = todosDias.value.map(d => ({
    fecha: d.fecha,
    tipo: d.tipo,
    etapa: d.etapaIdx + 1
  }))
  emit('update:modelValue', datos)
  emit('change', {
    dias: datos,
    etapas: etapas.value.map((e, idx) => ({
      numero: idx + 1,
      dias: e.dias.map(d => ({ fecha: d.fecha, tipo: d.tipo })),
      total: calcularDiasEtapa(e)
    })),
    total: totalDias.value,
    saldoResultante: saldoResultante.value
  })
}

// Watch para sincronizar con v-model
watch(() => props.modelValue, (newVal) => {
  if (Array.isArray(newVal) && newVal.length > 0) {
    // Agrupar por etapa
    const etapasMap = {}
    newVal.forEach(d => {
      const etapaNum = d.etapa || 1
      if (!etapasMap[etapaNum]) etapasMap[etapaNum] = []
      const fecha = new Date(d.fecha + 'T12:00:00')
      etapasMap[etapaNum].push({
        fecha: d.fecha,
        tipo: d.tipo,
        diasDescontados: calcularDiasDescontados(d.fecha, d.tipo),
        diaSemana: diasSemana[fecha.getDay()],
        esSabado: fecha.getDay() === 6
      })
    })

    const nuevasEtapas = []
    const keys = Object.keys(etapasMap).sort((a, b) => a - b)
    keys.forEach(k => {
      nuevasEtapas.push({ dias: etapasMap[k] })
    })

    if (nuevasEtapas.length > 0) {
      etapas.value = nuevasEtapas
    }
  }
}, { immediate: true })

function calcularDiasDescontados(fechaStr, tipo) {
  const fecha = new Date(fechaStr + 'T12:00:00')
  if (fecha.getDay() === 6) return 1 // Sábado
  if (tipo !== 'completo') {
    return esMedioTiempo.value ? 1 : 0.5
  }
  return 1
}

// Cargar feriados desde la API
async function cargarFeriados() {
  try {
    const sedeId = props.empleado?.sede_id || props.empleado?.sede?.id
    const params = { ano: mesActualDate.value.getFullYear() }
    if (sedeId) params.sede_id = sedeId

    const response = await api.get('/feriados', { params })
    if (response.data?.success) {
      feriados.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error cargando feriados:', error)
  }
}

// Recargar feriados cuando cambia el mes o el empleado
watch([mesActualDate, () => props.empleado], () => {
  cargarFeriados()
}, { deep: true })

onMounted(() => {
  cargarFeriados()
})
</script>

<style scoped>
.calendario-vacaciones {
  max-width: 100%;
}

.etapas-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.etapa-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.etapa-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.etapa-card.etapa-activa {
  box-shadow: 0 0 0 2px currentColor;
}

.etapa-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.etapa-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.etapa-resumen {
  color: #666;
}

.calendario-header {
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
}

.calendario-header-dia {
  padding: 8px;
  color: #666;
}

.calendario-grid {
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
}

.calendario-dia {
  min-height: 55px;
  padding: 4px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.calendario-dia:hover:not(.deshabilitado) {
  background: #e3f2fd;
  transform: scale(1.05);
}

.calendario-dia.deshabilitado {
  background: #fafafa;
  cursor: not-allowed;
  color: #bbb;
}

.calendario-dia.domingo {
  background: #fff3e0;
  color: #ff9800;
}

.calendario-dia.sabado {
  background: #e8f5e9;
}

.calendario-dia.anterior {
  opacity: 0.4;
}

.calendario-dia.seleccionado {
  font-weight: bold;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.dia-numero {
  font-size: 14px;
  font-weight: 500;
}

.dia-etapa-badge {
  position: absolute;
  bottom: 2px;
  font-size: 8px;
}

.dia-feriado-icono {
  position: absolute;
  top: 2px;
  right: 2px;
}

.leyenda-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.calendario-dia.feriado {
  background: #ffebee;
  color: #c62828;
  cursor: not-allowed;
  border: 2px solid #ef5350;
}

.calendario-dia.feriado .dia-numero {
  font-weight: bold;
}
</style>
