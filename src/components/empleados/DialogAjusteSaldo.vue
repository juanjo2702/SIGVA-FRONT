<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <q-card style="min-width: 400px">
            <q-card-section class="row items-center">
                <div class="text-h6">Ajustar Saldo</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
            </q-card-section>

            <q-card-section>
                <p><strong>{{ empleado?.nombre_completo }}</strong></p>
                <p class="q-mb-md">Saldo actual: <strong>{{ empleado?.saldo_vacaciones }}</strong> días</p>

                <q-input v-model.number="form.nuevo_saldo" label="Nuevo Saldo" type="number" step="0.5" outlined />
                <q-input v-model="form.descripcion" label="Motivo del ajuste *" type="textarea" rows="2" outlined
                    class="q-mt-sm" />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancelar" @click="$emit('update:modelValue', false)" />
                <q-btn color="primary" label="Ajustar" @click="onSubmit" :loading="loading" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    empleado: { type: Object, default: null },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
    nuevo_saldo: 0,
    descripcion: ''
})

watch(() => props.modelValue, (open) => {
    if (open && props.empleado) {
        form.value = {
            nuevo_saldo: props.empleado.saldo_vacaciones || 0,
            descripcion: ''
        }
    }
})

function onSubmit() {
    emit('save', { ...form.value })
}
</script>
