<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center bg-grey-8 text-white">
        <q-icon name="cancel" size="sm" class="q-mr-sm" />
        <div class="text-h6">Cancelar Solicitud</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-md">
          <p><strong>Empleado:</strong> {{ solicitud?.empleado?.nombre_completo }}</p>
          <p><strong>Días:</strong> {{ solicitud?.dias_solicitados }}</p>
          <p v-if="solicitud?.estado === 'aprobada'" class="text-warning">
            <q-icon name="info" /> Los días serán devueltos al saldo del empleado.
          </p>
        </div>
        <q-input 
          v-model="motivo" 
          label="Motivo de la cancelación" 
          type="textarea" 
          outlined 
          rows="3"
          hint="Ej: El empleado cambió de planes, error en la programación, etc."
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cerrar" v-close-popup />
        <q-btn 
          color="grey-8" 
          label="Cancelar Solicitud" 
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
