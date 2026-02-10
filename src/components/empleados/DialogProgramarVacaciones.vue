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

                <!-- Calendario interactivo - Admin puede seleccionar días pasados -->
                <CalendarioVacaciones v-if="empleado" ref="calendarioRef" :empleado="empleado" v-model="form.dias"
                    @change="onCalendarioChange" :permitir-dias-pasados="true"
                    @solicitar-cancelacion="manejarCancelacion" />

                <q-separator class="q-my-md" />

                <div class="text-subtitle2 q-mb-sm">Reemplazo</div>
                <q-toggle v-model="form.tiene_reemplazo" label="¿Hay reemplazo para este empleado?" />
                <q-input v-if="form.tiene_reemplazo" v-model="form.nombre_reemplazo" label="Nombre del Reemplazo *"
                    outlined dense class="q-mt-sm" />

                <q-separator class="q-my-md" />

                <div class="text-subtitle2 q-mb-sm">Observaciones</div>
                <q-input v-model="form.observacion" label="Observaciones adicionales (opcional)" outlined type="textarea"
                    rows="2" hint="Ej: Vacaciones autorizadas por gerencia, compensación, etc." />

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

        <!-- Diálogo para cancelar solicitud -->
        <DialogCancelar v-model="mostrarDialogoCancelacion" :solicitud="solicitudSeleccionada"
            :loading="cargandoCancelacion" @confirm="confirmarCancelacion" />
    </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import CalendarioVacaciones from '@/components/CalendarioVacaciones.vue'
import DialogCancelar from '@/components/solicitudes/DialogCancelar.vue'
import adminService from '@/services/adminService'

const $q = useQuasar()

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    empleado: { type: Object, default: null },
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save', 'calendar-change'])

const form = ref({
    dias: [],
    tiene_reemplazo: false,
    nombre_reemplazo: '',
    observacion: ''
})

// Variables para cancelación
const mostrarDialogoCancelacion = ref(false)
const solicitudSeleccionada = ref(null)
const cargandoCancelacion = ref(false)
const calendarioRef = ref(null) // Referencia para recargar datos

watch(() => props.modelValue, (open) => {
    if (open) {
        form.value = {
            dias: [],
            tiene_reemplazo: false,
            nombre_reemplazo: '',
            observacion: ''
        }
    }
})

function onCalendarioChange(info) {
    emit('calendar-change', info)
}

function onSubmit() {
    emit('save', { ...form.value })
}

async function manejarCancelacion(solicitudId) {
    try {
        $q.loading.show({ message: 'Cargando información...' })
        const response = await adminService.getSolicitud(solicitudId)
        if (response.success) {
            solicitudSeleccionada.value = response.data
            mostrarDialogoCancelacion.value = true
        }
    } catch (error) {
        console.error('Error al cargar solicitud:', error)
        $q.notify({ type: 'negative', message: 'No se pudo cargar la información de la solicitud' })
    } finally {
        $q.loading.hide()
    }
}

async function confirmarCancelacion(motivo) {
    if (!solicitudSeleccionada.value) return

    try {
        cargandoCancelacion.value = true
        const response = await adminService.cancelarSolicitud(solicitudSeleccionada.value.id, motivo)
        
        if (response.success) {
            $q.notify({ type: 'positive', message: 'Solicitud cancelada correctamente' })
            mostrarDialogoCancelacion.value = false
            
            // Recargar datos del empleado y calendario si es posible
            // Como no tenemos método directo exponeremos uno en Calendario o forzamos actualización
            // Al cambiar el empleado key en Calendario se recarga, o podemos llamar a un método expuesto.
            // Opción simple: emitir evento para que el padre recargue todo si fuera necesario,
            // pero mejor recargar solo los días ocupados en el calendario.
            if (calendarioRef.value) {
               await calendarioRef.value.cargarSolicitudesExistentes()
            }
        } else {
            $q.notify({ type: 'negative', message: response.message || 'Error al cancelar' })
        }
    } catch (error) {
        console.error('Error al cancelar:', error)
        $q.notify({ type: 'negative', message: 'Error al cancelar la solicitud' })
    } finally {
        cargandoCancelacion.value = false
    }
}
</script>
