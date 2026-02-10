<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center bg-grey-8 text-white">
        <q-icon name="event_busy" size="md" class="q-mr-sm" />
        <div class="text-h6">¿Cancelar esta solicitud?</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <div class="q-mb-md">
          <strong>{{ solicitud?.empleado?.nombre_completo }}</strong>
        </div>
        <div class="text-body2 q-mb-md">
          <strong>Período:</strong> {{ formatFecha(solicitud?.fecha_inicio) }} - {{ formatFecha(solicitud?.fecha_fin) }}<br>
          <strong>Días:</strong> {{ solicitud?.dias_solicitados }}<br>
          <strong>Estado actual:</strong> {{ traducirEstado(solicitud?.estado) }}
        </div>

        <!-- Observación de la solicitud -->
        <q-banner v-if="solicitud?.observacion" class="bg-blue-1 q-mb-md text-body2" rounded>
          <template v-slot:avatar>
            <q-icon name="assignment" color="primary" />
          </template>
          <strong>Observaciones:</strong><br>
          <div style="white-space: pre-wrap;">{{ solicitud.observacion }}</div>
        </q-banner>

        <!-- Banner diferente según si está aprobada o pendiente -->
        <q-banner v-if="solicitud?.estado === 'aprobada'" class="bg-amber-1 q-pa-sm q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" color="warning" />
          </template>
          <strong>¿Qué sucederá al cancelar vacaciones APROBADAS?</strong>
          <ul class="q-ma-none q-pl-md">
            <li>La solicitud será marcada como <strong>CANCELADA</strong></li>
            <li>Los días serán <strong>DEVUELTOS</strong> al saldo del empleado</li>
            <li>El empleado ya no podrá usar esas fechas de vacación</li>
            <li>Se registrará en el historial del empleado</li>
          </ul>
        </q-banner>

        <q-banner v-else class="bg-grey-2 q-pa-sm q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="info" color="grey" />
          </template>
          <strong>¿Qué sucederá al cancelar?</strong>
          <ul class="q-ma-none q-pl-md">
            <li>La programación de vacaciones será <strong>ANULADA</strong></li>
            <li>No se descontarán días del saldo del empleado</li>
            <li>El empleado será notificado de la cancelación</li>
          </ul>
        </q-banner>

        <q-input 
          v-model="motivo" 
          label="Motivo de la cancelación *" 
          type="textarea" 
          outlined 
          rows="3"
          hint="Ej: El empleado cambió de planes, error en la programación, etc."
          :rules="[val => !!val?.trim() || 'El motivo es obligatorio']"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cerrar" color="grey" v-close-popup />
        <q-btn 
          unelevated
          color="grey-8" 
          label="Sí, Cancelar Solicitud" 
          icon="event_busy"
          @click="confirmar" 
          :loading="loading"
          :disable="!motivo.trim()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  solicitud: Object,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const motivo = ref('')

watch(() => props.modelValue, (val) => {
  if (val) motivo.value = ''
})

function formatFecha(fechaStr) {
  if (!fechaStr) return '-'
  if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
    const [year, month, day] = fechaStr.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }
  return new Date(fechaStr).toLocaleDateString('es-BO')
}

function traducirEstado(estado) {
  return {
    pendiente: 'Pendiente',
    pendiente_documento: 'Pendiente Documento',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    cancelada: 'Cancelada'
  }[estado] || estado
}

function confirmar() {
  if (motivo.value.trim()) {
    emit('confirm', motivo.value)
  }
}
</script>
