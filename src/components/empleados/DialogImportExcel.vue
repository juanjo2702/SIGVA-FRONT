<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <q-card style="min-width: 550px">
            <q-card-section class="row items-center bg-secondary text-white">
                <q-icon name="upload_file" size="md" class="q-mr-sm" />
                <div class="text-h6">Importar Empleados desde Excel</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
            </q-card-section>

            <q-card-section class="q-pb-none">
                <!-- Paso 1: Seleccionar Sede -->
                <div class="q-mb-md">
                    <div class="text-subtitle2 text-weight-bold q-mb-sm">
                        <q-icon name="looks_one" color="primary" class="q-mr-xs" />
                        Seleccionar Sede
                    </div>
                    <q-select v-model="sedeId" label="Sede a asignar a todos los empleados *" :options="sedesOptions"
                        emit-value map-options outlined dense :rules="[v => !!v || 'Seleccione una sede']">
                        <template v-slot:prepend><q-icon name="business" /></template>
                    </q-select>
                    <div class="text-caption text-grey-7 q-mt-xs">
                        Todos los empleados importados serán asignados a esta sede
                    </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Paso 2: Archivo -->
                <div class="q-mb-md">
                    <div class="text-subtitle2 text-weight-bold q-mb-sm">
                        <q-icon name="looks_two" color="primary" class="q-mr-xs" />
                        Seleccionar Archivo
                    </div>
                    <q-file v-model="archivo" label="Archivo Excel (.xlsx, .xls, .csv)" accept=".xlsx,.xls,.csv"
                        outlined dense>
                        <template v-slot:prepend><q-icon name="attach_file" /></template>
                        <template v-slot:append v-if="archivo">
                            <q-icon name="check_circle" color="positive" />
                        </template>
                    </q-file>
                </div>

                <q-separator class="q-my-md" />

                <!-- Información de columnas -->
                <q-expansion-item icon="help_outline" label="Columnas requeridas en el Excel"
                    caption="Click para ver formato" header-class="text-primary">
                    <q-card flat bordered class="q-mt-sm">
                        <q-card-section class="q-pa-sm">
                            <div class="text-caption">
                                <ul class="q-ma-none q-pl-md">
                                    <li><strong>1° Apellido</strong> - Apellido paterno (obligatorio)</li>
                                    <li><strong>2° Apellido</strong> - Apellido materno (opcional)</li>
                                    <li><strong>Nombres</strong> - Nombres del empleado (obligatorio)</li>
                                    <li><strong>CI</strong> - Carnet de identidad (obligatorio)</li>
                                    <li><strong>Género</strong> - Masculino / Femenino (opcional)</li>
                                    <li><strong>Tipo Contrato</strong> - Completo / Medio Tiempo (opcional)</li>
                                    <li><strong>Cargo</strong> - Cargo del empleado (opcional)</li>
                                    <li><strong>Fecha de Ingreso</strong> - DD/MM/AAAA (obligatorio)</li>
                                    <li><strong>Saldo de Días</strong> - Saldo inicial de vacaciones (opcional)</li>
                                </ul>
                            </div>
                        </q-card-section>
                    </q-card>
                </q-expansion-item>

                <div class="q-mt-md">
                    <q-btn flat color="primary" icon="download" label="Descargar Plantilla de Ejemplo"
                        @click="$emit('download-template')" :loading="loadingTemplate" no-caps />
                </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
                <q-btn flat label="Cancelar" @click="$emit('update:modelValue', false)" no-caps />
                <q-btn color="primary" icon="upload" label="Importar Empleados" @click="onSubmit" :loading="loading"
                    :disable="!archivo || !sedeId" no-caps />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    sedes: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    loadingTemplate: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'import', 'download-template'])

const archivo = ref(null)
const sedeId = ref(null)

const sedesOptions = computed(() =>
    Array.isArray(props.sedes) ? props.sedes.map(s => ({ label: s.nombre, value: s.id })) : []
)

watch(() => props.modelValue, (open) => {
    if (!open) {
        archivo.value = null
        sedeId.value = null
    }
})

function onSubmit() {
    emit('import', { archivo: archivo.value, sedeId: sedeId.value })
}
</script>
