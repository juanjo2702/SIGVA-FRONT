<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
        <q-card style="min-width: 500px">
            <q-card-section class="row items-center bg-primary text-white">
                <div class="text-h6">{{ isEditing ? 'Editar' : 'Nuevo' }} Empleado</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="onSubmit" class="q-gutter-sm">
                    <div class="row q-col-gutter-sm">
                        <div class="col-6">
                            <q-input v-model="form.apellido_paterno" label="Primer Apellido *" outlined dense
                                :rules="[v => !!v || 'Requerido']" />
                        </div>
                        <div class="col-6">
                            <q-input v-model="form.apellido_materno" label="Segundo Apellido" outlined dense />
                        </div>
                    </div>
                    <q-input v-model="form.nombres" label="Nombres *" outlined dense
                        :rules="[v => !!v || 'Requerido']" />
                    <div class="row q-col-gutter-sm">
                        <div class="col-6">
                            <q-input v-model="form.ci" label="C.I. *" outlined dense
                                :rules="[v => !!v || 'Requerido']" />
                        </div>
                        <div class="col-6">
                            <q-input v-model="form.cargo" label="Cargo *" outlined dense
                                :rules="[v => !!v || 'Requerido']" />
                        </div>
                    </div>
                    <div class="row q-col-gutter-sm">
                        <div class="col-6">
                            <q-select v-model="form.genero" label="Género" :options="opcionesGenero" emit-value
                                map-options outlined dense clearable />
                        </div>
                        <div class="col-6">
                            <q-select v-model="form.tipo_contrato" label="Tipo de Contrato"
                                :options="opcionesTipoContrato" emit-value map-options outlined dense />
                        </div>
                    </div>
                    <q-select v-model="form.sede_id" label="Sede" :options="sedesOptions" emit-value map-options
                        outlined dense clearable />
                    <div class="row q-col-gutter-sm">
                        <div class="col-6">
                            <q-input v-model="form.fecha_ingreso" label="Fecha Ingreso *" type="date" outlined dense
                                :rules="[v => !!v || 'Requerido']" />
                        </div>
                        <div class="col-6" v-if="!isEditing">
                            <q-input v-model.number="form.saldo_vacaciones" label="Saldo Inicial" type="number"
                                step="0.5" outlined dense />
                        </div>
                        <div class="col-6 flex items-center">
                            <q-toggle v-model="form.activo" color="primary" label="Empleado Activo" />
                        </div>
                    </div>
                </q-form>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancelar" @click="$emit('update:modelValue', false)" />
                <q-btn color="primary" label="Guardar" @click="onSubmit" :loading="loading" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    empleado: { type: Object, default: null },
    sedes: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const opcionesGenero = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Femenino', value: 'Femenino' }
]

const opcionesTipoContrato = [
    { label: 'Tiempo Completo', value: 'completo' },
    { label: 'Medio Tiempo', value: 'medio_tiempo' }
]

const form = ref({
    apellido_paterno: '',
    apellido_materno: '',
    nombres: '',
    ci: '',
    genero: null,
    tipo_contrato: 'completo',
    sede_id: null,
    cargo: '',
    fecha_ingreso: '',
    saldo_vacaciones: 0,
    activo: true
})

const isEditing = computed(() => !!props.empleado)

const sedesOptions = computed(() =>
    Array.isArray(props.sedes) ? props.sedes.map(s => ({ label: s.nombre, value: s.id })) : []
)

watch(() => props.modelValue, (open) => {
    if (open) {
        if (props.empleado) {
            let fechaFormateada = ''
            if (props.empleado.fecha_ingreso) {
                const fecha = new Date(props.empleado.fecha_ingreso)
                fechaFormateada = fecha.toISOString().split('T')[0]
            }
            form.value = {
                apellido_paterno: props.empleado.apellido_paterno || '',
                apellido_materno: props.empleado.apellido_materno || '',
                nombres: props.empleado.nombres || '',
                ci: props.empleado.ci || '',
                genero: props.empleado.genero || null,
                tipo_contrato: props.empleado.tipo_contrato || 'completo',
                sede_id: props.empleado.sede_id || null,
                cargo: props.empleado.cargo || '',
                fecha_ingreso: fechaFormateada,
                saldo_vacaciones: props.empleado.saldo_vacaciones || 0,
                activo: props.empleado.activo !== undefined ? props.empleado.activo : true
            }
        } else {
            form.value = {
                apellido_paterno: '',
                apellido_materno: '',
                nombres: '',
                ci: '',
                genero: null,
                tipo_contrato: 'completo',
                sede_id: null,
                cargo: '',
                fecha_ingreso: '',
                saldo_vacaciones: 0,
                activo: true
            }
        }
    }
})

function onSubmit() {
    emit('save', { ...form.value }, isEditing.value)
}
</script>
