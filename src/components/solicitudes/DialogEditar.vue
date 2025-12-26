<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent maximized>
    <q-card>
      <q-card-section class="row items-center bg-primary text-white">
        <q-icon name="edit" size="sm" class="q-mr-sm" />
        <div class="text-h6">Editar Solicitud</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="solicitud" class="q-pa-lg" style="max-width: 900px; margin: 0 auto;">
        <!-- Info Empleado -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">{{ solicitud.empleado?.nombre_completo }}</div>
            <div class="text-caption text-grey">
              CI: {{ solicitud.empleado?.ci }} | Saldo: {{ solicitud.empleado?.saldo_vacaciones }} días
            </div>
          </q-card-section>
        </q-card>

        <!-- Calendario -->
        <div class="text-subtitle1 q-mb-sm">
          <q-icon name="calendar_month" class="q-mr-sm" />
          Seleccione los días de vacaciones
        </div>

        <CalendarioVacaciones v-model="diasSeleccionados" :empleado="solicitud?.empleado" />

        <!-- Reemplazo -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-sm-4">
            <q-toggle v-model="tieneReemplazo" label="Tiene Reemplazo" />
          </div>
          <div class="col-12 col-sm-8">
            <q-input 
              v-if="tieneReemplazo" 
              v-model="nombreReemplazo" 
              label="Nombre del Reemplazo" 
              outlined
              dense 
            />
          </div>
        </div>

        <!-- Resumen -->
        <q-card flat bordered class="q-mt-md" :class="diasSeleccionados.length > 0 ? 'bg-blue-1' : 'bg-grey-2'">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <span class="text-subtitle2">Días seleccionados:</span>
                <span class="text-h6 text-primary q-ml-sm">{{ calcularDias }}</span>
              </div>
              <div>
                <span class="text-subtitle2">Días originales:</span>
                <span class="text-h6 text-grey q-ml-sm">{{ solicitud?.dias_solicitados }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn 
          color="primary" 
          label="Guardar Cambios" 
          icon="save" 
          @click="guardar" 
          :loading="loading"
          :disable="diasSeleccionados.length === 0" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import CalendarioVacaciones from '@/components/CalendarioVacaciones.vue'

const props = defineProps({
  modelValue: Boolean,
  solicitud: Object,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'save'])

const diasSeleccionados = ref([])
const tieneReemplazo = ref(false)
const nombreReemplazo = ref('')

// Cuando se abre el diálogo, cargar datos existentes
watch(() => props.modelValue, (val) => {
  if (val && props.solicitud) {
    // Cargar días desde detalles o reconstruir
    if (props.solicitud.detalles?.length > 0) {
      diasSeleccionados.value = props.solicitud.detalles.map(d => ({
        fecha: d.fecha,
        tipo: d.tipo_dia || 'completo'
      }))
    } else {
      diasSeleccionados.value = []
    }
    tieneReemplazo.value = props.solicitud.tiene_reemplazo || false
    nombreReemplazo.value = props.solicitud.nombre_reemplazo || ''
  }
})

const calcularDias = computed(() => {
  return diasSeleccionados.value.reduce((sum, d) => {
    return sum + (d.tipo === 'completo' ? 1 : 0.5)
  }, 0)
})

function guardar() {
  emit('save', {
    dias: diasSeleccionados.value,
    tiene_reemplazo: tieneReemplazo.value,
    nombre_reemplazo: nombreReemplazo.value
  })
}
</script>
