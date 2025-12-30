<template>
  <div class="calendario-formulario">
    <!-- Leyenda -->
    <div class="leyenda" v-if="etapas.length > 1">
      <span v-for="(etapa, idx) in etapas" :key="idx" class="leyenda-item">
        <span class="leyenda-color" :style="{ backgroundColor: coloresEtapas[idx] }"></span>
        Etapa {{ idx + 1 }} ({{ etapa.dias }} días)
      </span>
    </div>

    <!-- Calendarios por mes -->
    <div class="meses-container">
      <div v-for="mes in mesesUnicos" :key="mes.key" class="mes-calendario">
        <div class="mes-titulo">{{ mes.nombreMes }} {{ mes.year }}</div>
        <table class="calendario-tabla">
          <thead>
            <tr>
              <th>Lu</th>
              <th>Ma</th>
              <th>Mi</th>
              <th>Ju</th>
              <th>Vi</th>
              <th>Sa</th>
              <th>Do</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(semana, sIdx) in generarSemanas(mes.year, mes.month)" :key="sIdx">
              <td 
                v-for="(dia, dIdx) in semana" 
                :key="dIdx"
                :class="getClaseDia(dia, mes)"
                :style="getEstiloDia(dia, mes)"
              >
                {{ dia || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Resumen de etapas -->
    <div class="resumen-etapas" v-if="etapas.length > 0">
      <table class="tabla-etapas">
        <thead>
          <tr>
            <th style="width: 80px;">Etapa</th>
            <th>Período</th>
            <th style="width: 60px;">Días</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(etapa, idx) in etapas" :key="idx">
            <td :style="{ color: coloresEtapas[idx], fontWeight: 'bold' }">
              Etapa {{ idx + 1 }}
            </td>
            <td>{{ etapa.fecha_inicio }} al {{ etapa.fecha_fin }}</td>
            <td style="text-align: center; font-weight: bold;">{{ etapa.dias }}</td>
          </tr>
          <tr v-if="etapas.length > 1" class="fila-total">
            <td colspan="2" style="text-align: right; font-weight: bold;">TOTAL:</td>
            <td style="text-align: center; font-weight: bold;">{{ totalDias }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  etapas: {
    type: Array,
    default: () => []
  },
  diasDetalle: {
    type: Array,
    default: () => []
  }
})

const coloresEtapas = [
  '#1976D2', // Azul - Etapa 1
  '#43A047', // Verde - Etapa 2
  '#FB8C00', // Naranja - Etapa 3
  '#8E24AA', // Púrpura - Etapa 4
  '#E53935'  // Rojo - Etapa 5
]

const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Calcular total de días
const totalDias = computed(() => {
  return props.etapas.reduce((sum, e) => sum + parseFloat(e.dias || 0), 0)
})

// Obtener todos los días de vacaciones como fechas
const diasVacaciones = computed(() => {
  const dias = new Map()
  
  // Si tenemos detalle de días, usarlos
  if (props.diasDetalle && props.diasDetalle.length > 0) {
    props.diasDetalle.forEach(d => {
      const fecha = d.fecha.split('T')[0]
      dias.set(fecha, {
        fecha,
        tipo: d.tipo,
        etapa: obtenerEtapaDeFecha(fecha)
      })
    })
  } else {
    // Generar días a partir de las etapas
    props.etapas.forEach((etapa, etapaIdx) => {
      const fechas = generarFechasEntre(etapa.fecha_inicio, etapa.fecha_fin)
      fechas.forEach(fecha => {
        dias.set(fecha, {
          fecha,
          tipo: 'completo',
          etapa: etapaIdx
        })
      })
    })
  }
  
  return dias
})

// Obtener meses únicos de las vacaciones
const mesesUnicos = computed(() => {
  const meses = new Map()
  
  diasVacaciones.value.forEach((dia, fecha) => {
    const [year, month] = fecha.split('-')
    const key = `${year}-${month}`
    if (!meses.has(key)) {
      meses.set(key, {
        key,
        year: parseInt(year),
        month: parseInt(month),
        nombreMes: nombresMeses[parseInt(month) - 1]
      })
    }
  })
  
  return Array.from(meses.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })
})

// Determinar a qué etapa pertenece una fecha
function obtenerEtapaDeFecha(fechaStr) {
  const fecha = parseFecha(fechaStr)
  
  for (let i = 0; i < props.etapas.length; i++) {
    const etapa = props.etapas[i]
    const inicio = parseFecha(etapa.fecha_inicio)
    const fin = parseFecha(etapa.fecha_fin)
    
    if (fecha >= inicio && fecha <= fin) {
      return i
    }
  }
  return 0
}

// Parsear fecha en formato dd/mm/yyyy o yyyy-mm-dd
function parseFecha(fechaStr) {
  if (!fechaStr) return null
  
  if (fechaStr.includes('/')) {
    const [d, m, y] = fechaStr.split('/')
    return new Date(y, m - 1, d)
  }
  
  const [y, m, d] = fechaStr.split('-')
  return new Date(y, m - 1, d)
}

// Generar fechas entre dos fechas
function generarFechasEntre(inicioStr, finStr) {
  const fechas = []
  const inicio = parseFecha(inicioStr)
  const fin = parseFecha(finStr)
  
  if (!inicio || !fin) return fechas
  
  const current = new Date(inicio)
  while (current <= fin) {
    // Excluir domingos
    if (current.getDay() !== 0) {
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, '0')
      const d = String(current.getDate()).padStart(2, '0')
      fechas.push(`${y}-${m}-${d}`)
    }
    current.setDate(current.getDate() + 1)
  }
  
  return fechas
}

// Generar semanas para un mes
function generarSemanas(year, month) {
  const semanas = []
  const primerDia = new Date(year, month - 1, 1)
  const ultimoDia = new Date(year, month, 0)
  
  // Ajustar para que empiece en lunes (0=Lunes, 6=Domingo)
  let diaInicio = primerDia.getDay() - 1
  if (diaInicio < 0) diaInicio = 6 // Domingo
  
  let semana = new Array(7).fill(null)
  let diaActual = 1
  
  while (diaActual <= ultimoDia.getDate()) {
    for (let i = diaInicio; i < 7 && diaActual <= ultimoDia.getDate(); i++) {
      semana[i] = diaActual
      diaActual++
    }
    semanas.push(semana)
    semana = new Array(7).fill(null)
    diaInicio = 0
  }
  
  return semanas
}

// Obtener clase CSS para un día
function getClaseDia(dia, mes) {
  if (!dia) return 'dia-vacio'
  
  const fechaStr = `${mes.year}-${String(mes.month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  
  if (diasVacaciones.value.has(fechaStr)) {
    return 'dia-vacacion'
  }
  
  // Verificar si es domingo
  const fecha = new Date(mes.year, mes.month - 1, dia)
  if (fecha.getDay() === 0) {
    return 'dia-domingo'
  }
  
  return 'dia-normal'
}

// Obtener estilo para un día
function getEstiloDia(dia, mes) {
  if (!dia) return {}
  
  const fechaStr = `${mes.year}-${String(mes.month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  const diaInfo = diasVacaciones.value.get(fechaStr)
  
  if (diaInfo) {
    const etapaIdx = diaInfo.etapa || 0
    return {
      backgroundColor: coloresEtapas[etapaIdx],
      color: 'white',
      fontWeight: 'bold'
    }
  }
  
  return {}
}
</script>

<style scoped>
.calendario-formulario {
  margin: 10px 0;
  font-size: 9px;
}

.leyenda {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  justify-content: center;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.leyenda-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.meses-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.mes-calendario {
  border: 1px solid #000;
}

.mes-titulo {
  text-align: center;
  font-weight: bold;
  background-color: #f0f0f0;
  padding: 3px;
  border-bottom: 1px solid #000;
  font-size: 10px;
}

.calendario-tabla {
  border-collapse: collapse;
}

.calendario-tabla th,
.calendario-tabla td {
  width: 18px;
  height: 16px;
  text-align: center;
  font-size: 8px;
  padding: 1px;
}

.calendario-tabla th {
  background-color: #e0e0e0;
  font-weight: bold;
  border-bottom: 1px solid #000;
}

.dia-vacio {
  background-color: #fafafa;
}

.dia-normal {
  background-color: white;
}

.dia-domingo {
  background-color: #ffebee;
  color: #999;
}

.dia-vacacion {
  border-radius: 2px;
}

.resumen-etapas {
  margin-top: 10px;
}

.tabla-etapas {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.tabla-etapas th,
.tabla-etapas td {
  border: 1px solid #000;
  padding: 3px 5px;
}

.tabla-etapas th {
  background-color: #f0f0f0;
  font-weight: bold;
}

.fila-total {
  background-color: #f5f5f5;
}
</style>
