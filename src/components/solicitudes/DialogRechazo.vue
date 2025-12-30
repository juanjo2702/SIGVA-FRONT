<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center bg-negative text-white">
        <q-icon name="cancel" size="md" class="q-mr-sm" />
        <div class="text-h6">¿Rechazar esta solicitud?</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <div class="q-mb-md">
          <strong>{{ solicitud?.empleado?.nombre_completo }}</strong>
        </div>
        <div class="text-body2 q-mb-md">
          <strong>Período:</strong> {{ formatFecha(solicitud?.fecha_inicio) }} - {{ formatFecha(solicitud?.fecha_fin) }}<br>
          <strong>Días:</strong> {{ solicitud?.dias_solicitados }}
        </div>

        <q-banner class="bg-red-1 q-pa-sm q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" color="negative" />
          </template>
          <strong>¿Qué sucederá al rechazar?</strong>
          <ul class="q-ma-none q-pl-md">
            <li>La solicitud será marcada como <strong>RECHAZADA</strong></li>
            <li>El empleado será notificado del rechazo</li>
            <li>NO se descontarán días del saldo del empleado</li>
            <li>El empleado deberá solicitar nuevamente si lo desea</li>
          </ul>
        </q-banner>

        <q-input 
          v-model="motivo" 
          label="Motivo del rechazo *" 
          type="textarea" 
          outlined 
          rows="3"
          hint="Este motivo será visible para el empleado"
          :rules="[val => !!val?.trim() || 'El motivo es obligatorio']"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn 
          unelevated
          color="negative" 
          label="Sí, Rechazar" 
          icon="cancel"
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

function confirmar() {
  if (motivo.value.trim()) {
    emit('confirm', motivo.value)
  }
}
</script>
