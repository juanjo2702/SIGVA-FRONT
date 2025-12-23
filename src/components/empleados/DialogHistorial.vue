<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" maximized>
        <q-card>
            <q-card-section class="row items-center bg-primary text-white">
                <div class="text-h6">Historial: {{ empleado?.nombre_completo }}</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
            </q-card-section>

            <q-card-section>
                <div v-if="loading" class="text-center q-pa-lg">
                    <q-spinner size="lg" color="primary" />
                </div>

                <q-timeline v-else color="primary">
                    <q-timeline-entry v-for="h in historial" :key="h.id" :subtitle="formatDateTime(h.created_at)">
                        <template v-slot:title>
                            {{ traducirTipoCambio(h.tipo_cambio) }}
                        </template>
                        <div>
                            {{ h.dias_anteriores }} → {{ h.dias_nuevos }} días
                            (<span :class="h.dias_cambio >= 0 ? 'text-positive' : 'text-negative'">
                                {{ h.dias_cambio >= 0 ? '+' : '' }}{{ h.dias_cambio }}
                            </span>)
                        </div>
                        <div class="text-caption text-grey" v-if="h.descripcion">{{ h.descripcion }}</div>
                    </q-timeline-entry>
                </q-timeline>

                <div v-if="!loading && (!historial || historial.length === 0)" class="text-center text-grey q-pa-lg">
                    No hay registros en el historial
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
defineProps({
    modelValue: { type: Boolean, default: false },
    empleado: { type: Object, default: null },
    historial: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

function formatDateTime(d) {
    return d ? new Date(d).toLocaleString('es-BO') : '-'
}

function traducirTipoCambio(tipo) {
    const tipos = {
        suma_anual: 'Suma Anual',
        solicitud_aprobada: 'Solicitud Aprobada',
        ajuste_manual: 'Ajuste Manual',
        importacion: 'Importación'
    }
    return tipos[tipo] || tipo
}
</script>
