<template>
  <div class="calendario-vacaciones">
    <!-- Header con navegación de mes -->
    <div class="row items-center justify-between q-mb-md">
      <q-btn flat round icon="chevron_left" @click="mesAnterior" />
      <div class="text-h6 text-capitalize">{{ mesActual }}</div>
      <q-btn flat round icon="chevron_right" @click="mesSiguiente" />
    </div>

    <!-- Días de la semana -->
    <div class="row calendario-header">
      <div v-for="dia in diasSemana" :key="dia" class="col calendario-header-dia text-center text-caption text-weight-bold">
        {{ dia }}
      </div>
    </div>

    <!-- Grilla del calendario -->
    <div class="calendario-grid">
      <div v-for="(semana, idx) in semanasDelMes" :key="idx" class="row">
        <div
          v-for="dia in semana"
          :key="dia.fecha"
          class="col calendario-dia"
          :class="getDiaClasses(dia)"
          @click="toggleDia(dia)"
        >
          <div class="dia-numero">{{ dia.numero }}</div>
          <div v-if="diaSeleccionado(dia)" class="dia-tipo">
            <q-badge :color="getTipoColor(getDiaInfo(dia)?.tipo)" size="xs">
              {{ getTipoLabel(getDiaInfo(dia)?.tipo) }}
            </q-badge>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de resumen -->
    <q-card class="q-mt-md" flat bordered>
      <q-card-section class="q-pa-sm">
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="event_note" class="q-mr-xs" />
          Días Seleccionados: {{ diasSeleccionados.length }}
        </div>
        
        <div v-if="diasSeleccionados.length > 0" class="dias-lista q-mb-md" style="max-height: 150px; overflow-y: auto;">
          <q-chip
            v-for="dia in diasSeleccionadosOrdenados"
            :key="dia.fecha"
            removable
            @remove="quitarDia(dia.fecha)"
            :color="getTipoColor(dia.tipo)"
            text-color="white"
            size="sm"
            class="q-ma-xs"
          >
            {{ formatFechaCorta(dia.fecha) }} - {{ getTipoLabel(dia.tipo) }}
            <q-tooltip>{{ dia.diaSemana }} - {{ dia.diasDescontados }} día(s)</q-tooltip>
          </q-chip>
        </div>

        <q-separator class="q-my-sm" />

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
      </q-card-section>
    </q-card>

    <!-- Dialog para seleccionar tipo de día -->
    <q-dialog v-model="dialogTipo" persistent>
      <q-card style="min-width: 280px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ fechaSeleccionada?.diaSemana }} {{ formatFecha(fechaSeleccionada?.fecha) }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-btn-toggle
            v-model="tipoSeleccionado"
            spread
            no-caps
            toggle-color="primary"
            :options="opcionesTipo"
            class="q-mb-md"
          />

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
          <q-btn unelevated label="Confirmar" color="primary" @click="confirmarSeleccion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  empleado: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'change'])

// Estado
const mesActualDate = ref(new Date())
const diasSeleccionados = ref([])
const dialogTipo = ref(false)
const fechaSeleccionada = ref(null)
const tipoSeleccionado = ref('completo')
const diaYaSeleccionado = ref(false)

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
    
    // Mujer medio tiempo no puede seleccionar sábados
    const deshabilitado = esDomingo || esAnterior || (esMujerMedioTiempo.value && esSabado)
    
    semana.push({
      numero: dia,
      fecha: fechaStr,
      esDomingo,
      esSabado,
      esAnterior,
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

// Días ordenados por fecha
const diasSeleccionadosOrdenados = computed(() => {
  return [...diasSeleccionados.value].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
})

// Cálculos de días
const totalDias = computed(() => {
  return diasSeleccionados.value.reduce((sum, d) => sum + d.diasDescontados, 0)
})

const saldoActual = computed(() => props.empleado?.saldo_vacaciones || 0)
const saldoResultante = computed(() => saldoActual.value - totalDias.value)

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

function diaSeleccionado(dia) {
  if (!dia.fecha) return false
  return diasSeleccionados.value.some(d => d.fecha === dia.fecha)
}

function getDiaInfo(dia) {
  return diasSeleccionados.value.find(d => d.fecha === dia.fecha)
}

function getDiaClasses(dia) {
  const classes = []
  if (dia.deshabilitado) classes.push('deshabilitado')
  if (dia.esDomingo) classes.push('domingo')
  if (dia.esSabado) classes.push('sabado')
  if (dia.esAnterior) classes.push('anterior')
  if (diaSeleccionado(dia)) {
    classes.push('seleccionado')
    const info = getDiaInfo(dia)
    if (info?.tipo === 'parcial_manana') classes.push('tipo-manana')
    else if (info?.tipo === 'parcial_tarde') classes.push('tipo-tarde')
    else classes.push('tipo-completo')
  }
  return classes
}

function getTipoColor(tipo) {
  return { completo: 'primary', parcial_manana: 'orange', parcial_tarde: 'purple' }[tipo] || 'grey'
}

function getTipoLabel(tipo) {
  return { completo: 'Día', parcial_manana: 'AM', parcial_tarde: 'PM' }[tipo] || ''
}

// Toggle día
function toggleDia(dia) {
  if (dia.deshabilitado || !dia.fecha) return
  
  fechaSeleccionada.value = dia
  diaYaSeleccionado.value = diaSeleccionado(dia)
  tipoSeleccionado.value = diaYaSeleccionado.value ? getDiaInfo(dia).tipo : 'completo'
  
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
  
  // Actualizar o agregar
  const idx = diasSeleccionados.value.findIndex(d => d.fecha === diaInfo.fecha)
  if (idx >= 0) {
    diasSeleccionados.value[idx] = diaInfo
  } else {
    diasSeleccionados.value.push(diaInfo)
  }
  
  dialogTipo.value = false
  emitChange()
}

function cancelarSeleccion() {
  dialogTipo.value = false
}

function quitarDiaActual() {
  quitarDia(fechaSeleccionada.value.fecha)
  dialogTipo.value = false
}

function quitarDia(fecha) {
  diasSeleccionados.value = diasSeleccionados.value.filter(d => d.fecha !== fecha)
  emitChange()
}

function emitChange() {
  const datos = diasSeleccionados.value.map(d => ({
    fecha: d.fecha,
    tipo: d.tipo
  }))
  emit('update:modelValue', datos)
  emit('change', {
    dias: datos,
    total: totalDias.value,
    saldoResultante: saldoResultante.value
  })
}

// Watch para sincronizar con v-model
watch(() => props.modelValue, (newVal) => {
  if (Array.isArray(newVal)) {
    // Reconstruir diasSeleccionados desde modelValue si es necesario
    diasSeleccionados.value = newVal.map(d => {
      const fecha = new Date(d.fecha + 'T12:00:00')
      return {
        fecha: d.fecha,
        tipo: d.tipo,
        diasDescontados: calcularDiasDescontados(d.fecha, d.tipo),
        diaSemana: diasSemana[fecha.getDay()],
        esSabado: fecha.getDay() === 6
      }
    })
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
</script>

<style scoped>
.calendario-vacaciones {
  max-width: 100%;
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
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  font-weight: bold;
}

.calendario-dia.seleccionado.tipo-manana {
  background: linear-gradient(to bottom, #ff9800 50%, #fff8e1 50%);
  color: #333;
}

.calendario-dia.seleccionado.tipo-tarde {
  background: linear-gradient(to bottom, #f3e5f5 50%, #9c27b0 50%);
  color: #333;
}

.dia-numero {
  font-size: 14px;
  font-weight: 500;
}

.dia-tipo {
  position: absolute;
  bottom: 2px;
  font-size: 8px;
}

.dias-lista {
  display: flex;
  flex-wrap: wrap;
}
</style>
