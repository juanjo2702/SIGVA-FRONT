<template>
  <div v-if="datos" class="q-pa-md" id="formulario-print">
    <div class="formulario-oficial"
      style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 11px; background: white; color: black; padding: 20px;">

      <!-- AVISO DE IMPRESION -->
      <div class="no-print"
        style="background: #fff3cd; border: 1px solid #ffc107; padding: 8px 12px; margin-bottom: 15px; border-radius: 4px; font-size: 11px; color: #856404; text-align: center;">
        <strong>📋 Recomendación:</strong> Para una impresión perfecta, utilice hoja tamaño
        <strong>OFICIO</strong>.
      </div>

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
          <span style="border: 1px solid #000; padding: 2px 15px; margin-left: 5px;">{{
            datos.solicitud.id
          }}</span>
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
            <td style="border: 1px solid #000; padding: 2px 8px;">{{ datos.empleado.sede || 'CBBA' }}</td>
            <td style="border: 1px solid #000; padding: 2px 8px;">{{ getFechaPartes(datos.solicitud.fecha_solicitud).dia }}</td>
            <td style="border: 1px solid #000; padding: 2px 8px;">{{ getFechaPartes(datos.solicitud.fecha_solicitud).mes }}</td>
            <td style="border: 1px solid #000; padding: 2px 8px;">{{ getFechaPartes(datos.solicitud.fecha_solicitud).anio }}</td>
          </tr>
        </table>
      </div>

      <!-- DATOS EMPLEADO -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td style="padding: 5px; border: 1px solid #000;">
            <strong>Nombres y Apellidos:</strong>
            <span style="margin-left: 10px; text-transform: uppercase;">{{
              datos.empleado.nombre_completo
            }}</span>
          </td>
          <td style="padding: 5px; border: 1px solid #000; width: 200px;">
            <strong>Código de empleado-C.I.:</strong>
            <span style="margin-left: 5px;">{{ datos.empleado.ci }}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px; border: 1px solid #000;">
            <strong>Cargo:</strong>
            <span style="margin-left: 10px;">{{ datos.empleado.cargo || '_________________' }}</span>
          </td>
          <td style="padding: 5px; border: 1px solid #000;">
            <strong>Área:</strong>
            <span style="margin-left: 10px;">{{ datos.empleado.sede || '_________________' }}</span>
          </td>
        </tr>
      </table>

      <!-- DIAS DE VACACION -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
        <tr>
          <td style="border: 1px solid #000; padding: 3px; width: 80px; text-align: center;">
            <div style="font-weight: bold; font-size: 9px;">No. de días</div>
            <div style="font-size: 14px; font-weight: bold;">{{ datos.solicitud.dias_solicitados }}</div>
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
              <!-- Etapas -->
              <template v-if="datos.etapas && datos.etapas.length > 1">
                <tr v-for="(etapa, index) in datos.etapas" :key="index">
                  <td style="padding: 2px; font-weight: bold; color: #1976D2;" v-if="index === 0">Etapa 1:</td>
                  <td style="padding: 2px; font-weight: bold; color: #43A047;" v-else-if="index === 1">Etapa 2:</td>
                  <td style="padding: 2px; font-weight: bold; color: #FB8C00;" v-else>Etapa {{ index + 1 }}:</td>
                  <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(etapa.fecha_inicio).dia }}</td>
                  <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(etapa.fecha_inicio).mes }}</td>
                  <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(etapa.fecha_inicio).anio }}</td>
                  <td style="padding: 2px; font-weight: bold; padding-left: 10px;">al</td>
                  <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(etapa.fecha_fin).dia }}</td>
                  <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(etapa.fecha_fin).mes }}</td>
                  <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(etapa.fecha_fin).anio }}</td>
                  <td style="padding: 2px; font-size: 8px; color: #666;">({{ etapa.dias }} días)</td>
                </tr>
              </template>
              <tr v-else>
                <td style="padding: 2px; font-weight: bold;">del</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datos.solicitud.fecha_inicio).dia }}</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datos.solicitud.fecha_inicio).mes }}</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datos.solicitud.fecha_inicio).anio }}</td>
                <td style="padding: 2px; font-weight: bold; padding-left: 15px;">al</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datos.solicitud.fecha_fin).dia }}</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datos.solicitud.fecha_fin).mes }}</td>
                <td style="border: 1px solid #000; padding: 3px; text-align: center;">{{ getFechaPartes(datos.solicitud.fecha_fin).anio }}</td>
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

      <!-- CALENDARIO VISUAL -->
      <div v-if="datos.etapas && datos.etapas.length > 0" style="border: 1px solid #000; padding: 8px; margin-bottom: 10px;">
        <div style="font-weight: bold; font-size: 10px; text-align: center; margin-bottom: 5px;">
          CALENDARIO DE VACACIONES
        </div>
        <CalendarioFormulario :etapas="datos.etapas" :dias-detalle="datos.detalles || []" />
      </div>

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
              {{ datos.solicitud.reemplazo !== 'Sin Reemplazo' ? datos.solicitud.reemplazo : '' }}
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
            <span style="border: 1px solid #000; padding: 0 5px; margin-right: 5px;">{{
              datos.solicitud.estado === 'Aprobada' ? 'X' : '' }}</span>
            Se acepta
          </td>
          <td style="padding: 5px;">
            <span style="border: 1px solid #000; padding: 0 5px; margin-right: 5px;">{{
              datos.solicitud.estado === 'Rechazada' ? 'X' : '' }}</span>
            Se rechaza
          </td>
        </tr>
      </table>

      <div style="margin-bottom: 15px;">
        <span>Justificación:</span>
        <span style="border-bottom: 1px solid #000; display: inline-block; width: 90%;">vacacion programada</span>
      </div>

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
          <td style="padding: 5px;">Fecha de ingreso:</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 40px;">{{ getFechaPartes(datos.empleado.fecha_ingreso).dia }}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 40px;">{{ getFechaPartes(datos.empleado.fecha_ingreso).mes }}</td>
          <td style="border: 1px solid #000; padding: 3px; text-align: center; width: 50px;">{{ getFechaPartes(datos.empleado.fecha_ingreso).anio }}</td>
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
          <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datos.empleado.anos_servicio }}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datos.empleado.dias_correspondientes || getDiasCorrespondientes(datos.empleado.anos_servicio) }}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datos.saldo.actual }}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datos.solicitud.dias_solicitados }}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: center;">{{ datos.saldo.despues }}</td>
        </tr>
      </table>

      <div style="text-align: right; margin-bottom: 15px;">
        <strong>SALDO TOTAL PENDIENTE</strong>
        <span style="border: 1px solid #000; padding: 3px 15px; margin-left: 10px;">{{ datos.saldo.despues }}</span>
      </div>

      <div style="font-weight: bold;">JEFE DE R.S.C Y GESTION DE TALENTO<br>HUMANO</div>
    </div>
  </div>
</template>

<script setup>
import CalendarioFormulario from './CalendarioFormulario.vue'

const props = defineProps({
  datos: {
    type: Object,
    required: true
  }
})

function getFechaPartes(fechaStr) {
  if (!fechaStr) return { dia: '', mes: '', anio: '' }
  const partes = fechaStr.split('/')
  if (partes.length === 3) {
    return { dia: partes[0], mes: partes[1], anio: partes[2] }
  }
  const fecha = new Date(fechaStr)
  if (isNaN(fecha.getTime())) return { dia: '', mes: '', anio: '' }
  return {
    dia: String(fecha.getDate()).padStart(2, '0'),
    mes: String(fecha.getMonth() + 1).padStart(2, '0'),
    anio: fecha.getFullYear()
  }
}

function tieneTipo(tipo) {
  if (!props.datos?.solicitud?.tipo) return false
  const tipoSolicitud = props.datos.solicitud.tipo.toLowerCase()
  if (tipo === 'parcial_manana') {
    return tipoSolicitud.includes('manana') || tipoSolicitud.includes('mañana')
  }
  if (tipo === 'parcial_tarde') {
    return tipoSolicitud.includes('tarde')
  }
  return false
}

function getDiasCorrespondientes(anosServicio) {
  if (anosServicio >= 10) return 30
  if (anosServicio >= 5) return 20
  if (anosServicio >= 1) return 15
  return 0
}
</script>

<style scoped>
.formulario-oficial {
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
