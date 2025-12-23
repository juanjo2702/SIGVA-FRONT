<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <q-card style="min-width: 500px">
            <q-card-section class="row items-center bg-primary text-white">
                <q-icon name="beach_access" size="sm" class="q-mr-sm" />
                <div class="text-h6">Programar Vacaciones</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
            </q-card-section>

            <q-card-section>
                <div class="q-mb-md">
                    <div class="text-subtitle1 text-weight-medium">{{ empleado?.nombre_completo }}</div>
                    <div class="text-caption">
                        CI: {{ empleado?.ci }} |
                        {{ empleado?.genero || 'Sin género' }} |
                        {{ empleado?.tipo_contrato === 'medio_tiempo' ? 'Medio Tiempo' : 'Tiempo Completo' }}
                    </div>
                    <q-badge :color="(empleado?.saldo_vacaciones || 0) < 0 ? 'negative' : 'positive'" class="q-mt-xs">
                        Saldo: {{ empleado?.saldo_vacaciones }} días
                    </q-badge>
                </div>

                <q-separator class="q-mb-md" />

                <!-- Calendario interactivo -->
                <CalendarioVacaciones v-if="empleado" :empleado="empleado" v-model="form.dias"
                    @change="onCalendarioChange" />

                <q-separator class="q-my-md" />

                <div class="text-subtitle2 q-mb-sm">Reemplazo</div>
                <q-toggle v-model="form.tiene_reemplazo" label="¿Hay reemplazo para este empleado?" />
                <q-input v-if="form.tiene_reemplazo" v-model="form.nombre_reemplazo" label="Nombre del Reemplazo *"
                    outlined dense class="q-mt-sm" />

                <q-banner class="bg-info text-white q-mt-md" rounded>
                    <template v-slot:avatar>
                        <q-icon name="info" />
                    </template>
                    Las vacaciones quedarán pendientes hasta que el empleado entregue el documento firmado.
                </q-banner>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancelar" @click="$emit('update:modelValue', false)" />
                <q-btn color="primary" label="Programar Vacaciones" @click="onSubmit" :loading="loading"
                    :disable="!form.dias || form.dias.length === 0" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import CalendarioVacaciones from '@/components/CalendarioVacaciones.vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    empleado: { type: Object, default: null },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save', 'calendar-change'])

const form = ref({
    dias: [],
    tiene_reemplazo: false,
    nombre_reemplazo: ''
})

watch(() => props.modelValue, (open) => {
    if (open) {
        form.value = {
            dias: [],
            tiene_reemplazo: false,
            nombre_reemplazo: ''
        }
    }
})

function onCalendarioChange(info) {
    emit('calendar-change', info)
}

function onSubmit() {
    emit('save', { ...form.value })
}
</script>
