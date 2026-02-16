<template>
  <div class="calendario-formulario">
    <!-- Leyenda con símbolos para impresión sin color -->
    <div class="leyenda">
      <template v-if="etapas.length > 1">
        <span v-for="(etapa, idx) in etapas" :key="idx" class="leyenda-item">
          <span class="leyenda-simbolo">{{ simbolosEtapas[idx] }}</span>
          Etapa {{ idx + 1 }} ({{ etapa.dias }} días)
        </span>
      </template>
      <span class="leyenda-item q-ml-md" v-if="tieneParciales">
        <strong>AM:</strong> Mañana, <strong>PM:</strong> Tarde
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
              >
                <span v-if="getSimboloDia(dia, mes)" class="dia-con-simbolo">
                  <span class="dia-numero">{{ dia }}</span>
                  <span class="dia-simbolo">
                    {{ getSimboloDia(dia, mes) }}
                    <span v-if="getTipoDia(dia, mes) !== 'completo'" class="tipo-texto">
                      {{ getTipoDia(dia, mes) === 'parcial_manana' ? 'AM' : 'PM' }}
                    </span>
                  </span>
                </span>
                <span v-else>{{ dia || '' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Resumen compacto -->
    <div class="resumen-total">
      <strong>TOTAL: {{ totalDias }} días</strong>
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

// Símbolos para diferenciar etapas
const simbolosEtapas = ['■', '●', '▲', '◆', '★']

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

// Obtener meses únicos
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

function obtenerEtapaDeFecha(fechaStr) {
  const fecha = parseFecha(fechaStr)
  for (let i = 0; i < props.etapas.length; i++) {
    const etapa = props.etapas[i]
    const inicio = parseFecha(etapa.fecha_inicio)
    const fin = parseFecha(etapa.fecha_fin)
    if (fecha >= inicio && fecha <= fin) return i
  }
  return 0
}

function parseFecha(fechaStr) {
  if (!fechaStr) return null
  if (fechaStr.includes('/')) {
    const [d, m, y] = fechaStr.split('/')
    return new Date(y, m - 1, d)
  }
  const [y, m, d] = fechaStr.split('-')
  return new Date(y, m - 1, d)
}

function generarFechasEntre(inicioStr, finStr) {
  const fechas = []
  const inicio = parseFecha(inicioStr)
  const fin = parseFecha(finStr)
  if (!inicio || !fin) return fechas
  const current = new Date(inicio)
  while (current <= fin) {
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

function generarSemanas(year, month) {
  const semanas = []
  const primerDia = new Date(year, month - 1, 1)
  const ultimoDia = new Date(year, month, 0)
  let diaInicio = primerDia.getDay() - 1
  if (diaInicio < 0) diaInicio = 6
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

function getClaseDia(dia, mes) {
  if (!dia) return 'dia-vacio'
  const fechaStr = `${mes.year}-${String(mes.month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  if (diasVacaciones.value.has(fechaStr)) return 'dia-vacacion'
  const fecha = new Date(mes.year, mes.month - 1, dia)
  if (fecha.getDay() === 0) return 'dia-domingo'
  return 'dia-normal'
}

function getSimboloDia(dia, mes) {
  if (!dia) return null
  const fechaStr = `${mes.year}-${String(mes.month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  const diaInfo = diasVacaciones.value.get(fechaStr)
  if (diaInfo) {
    const etapaIdx = diaInfo.etapa || 0
    return simbolosEtapas[etapaIdx] || '×'
  }
  return null
}

function getTipoDia(dia, mes) {
  if (!dia) return null
  const fechaStr = `${mes.year}-${String(mes.month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  const diaInfo = diasVacaciones.value.get(fechaStr)
  return diaInfo?.tipo || 'completo'
}

const tieneParciales = computed(() => {
  return Array.from(diasVacaciones.value.values()).some(d => d.tipo !== 'completo')
})
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
.leyenda-simbolo {
  font-weight: bold;
  font-size: 14px;
  width: 18px;
  text-align: center;
}
.meses-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 5px;
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
  width: 26px;
  height: 24px;
  text-align: center;
  font-size: 9px;
  padding: 2px;
  position: relative;
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
  background-color: #f5f5f5;
  color: #999;
}
.dia-vacacion {
  border: 2px solid #000;
  font-weight: bold;
  background-color: #e8e8e8;
}
.dia-con-simbolo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
}
.dia-numero {
  font-weight: bold;
  font-size: 9px;
}
.dia-simbolo {
  font-size: 8px;
  font-weight: bold;
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 1px;
}
.tipo-texto {
  font-size: 6px;
  background: #eee;
  padding: 0 1px;
  border-radius: 1px;
  border: 0.5px solid #999;
}
.resumen-total {
  text-align: center;
  margin-top: 5px;
  font-size: 10px;
}
</style>
