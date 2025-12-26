<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center bg-negative text-white">
        <q-icon name="cancel" size="sm" class="q-mr-sm" />
        <div class="text-h6">Rechazar Solicitud</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <p><strong>Empleado:</strong> {{ solicitud?.empleado?.nombre_completo }}</p>
          <p><strong>Días:</strong> {{ solicitud?.dias_solicitados }}</p>
        </div>
        <q-input 
          v-model="motivo" 
          label="Motivo del rechazo" 
          type="textarea" 
          outlined 
          rows="3"
          hint="Explique la razón del rechazo"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn 
          color="negative" 
          label="Rechazar" 
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

function confirmar() {
  if (motivo.value.trim()) {
    emit('confirm', motivo.value)
  }
}
</script>
