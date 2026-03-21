<template>
    <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" maximized transition-show="slide-up" transition-hide="slide-down">
        <q-card class="column full-height">
            <q-card-section class="row items-center bg-primary text-white no-print shadow-2">
                <q-icon name="history" size="sm" class="q-mr-sm" />
                <div class="text-h6">Historial: {{ empleado?.nombre_completo }}</div>
                <q-space />
                <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
            </q-card-section>

            <q-card-section class="col row no-wrap q-pa-none overflow-hidden">
                <!-- Columna Izquierda: Cronología (50% cuando hay preview) -->
                <div :class="[datosFormulario ? 'col-6 shadow-5' : 'col-12', 'scroll q-pa-md transition-width col-history-pane']" style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                    <div v-if="loading" class="text-center q-pa-xl">
                        <q-spinner-dots size="50px" color="primary" />
                        <div class="text-grey q-mt-md text-subtitle2">Cargando registros...</div>
                    </div>

                    <q-timeline v-else color="primary" class="q-px-md">
                        <q-timeline-entry v-for="h in historial" :key="h.id" :subtitle="formatDateTime(h.created_at)"
                            :icon="getIcon(h.tipo_cambio)" :color="getColor(h.tipo_cambio)">
                            <template v-slot:title>
                                <div class="row items-center q-gutter-x-sm">
                                    <span class="text-weight-bold">{{ traducirTipoCambio(h.tipo_cambio) }}</span>
                                    <q-btn v-if="h.tipo_cambio === 'solicitud_aprobada' || h.tipo_cambio === 'solicitud_aprobada_documento'" 
                                        flat round color="secondary" icon="description" size="sm" class="bg-blue-1"
                                        @click="verFormulario(h)" :loading="loadingForm === h.id">
                                        <q-tooltip anchor="center right" self="center left" class="bg-secondary">
                                            Click para previsualizar Formulario #{{ extractId(h.descripcion) }}
                                        </q-tooltip>
                                    </q-btn>
                                </div>
                            </template>
                            <div class="q-mt-sm">
                                <div class="row items-center q-gutter-x-xs">
                                    <span class="text-grey-7">{{ h.dias_anteriores }}</span>
                                    <q-icon name="arrow_forward" size="xs" color="grey-5" />
                                    <span class="text-weight-bold text-primary">{{ h.dias_nuevos }} días</span>
                                    <q-badge :color="h.dias_cambio >= 0 ? 'positive' : 'negative'" class="q-ml-sm text-weight-bold" rounded>
                                        {{ h.dias_cambio >= 0 ? '+' : '' }}{{ h.dias_cambio }}
                                    </q-badge>
                                </div>
                                <div class="text-caption text-grey-9 q-mt-xs bg-grey-2 q-pa-sm rounded-borders shadow-1" v-if="h.descripcion" style="border-left: 4px solid #1976D2;">
                                    {{ h.descripcion }}
                                </div>
                            </div>
                        </q-timeline-entry>
                    </q-timeline>

                    <div v-if="!loading && (!historial || historial.length === 0)" class="text-center text-grey q-pa-xl">
                        <q-icon name="sentiment_dissatisfied" size="48px" class="q-mb-sm" />
                        <div class="text-h6">No hay registros</div>
                        <p>El empleado seleccionado no cuenta con movimientos en su historial.</p>
                    </div>
                </div>

                <!-- Columna Derecha: Previsualización (50% de la Pantalla) -->
                <div v-if="datosFormulario" class="col-6 bg-grey-3 scroll q-pa-none shadow-up-10 relative-position border-left-heavy col-preview-pane">
                    <div class="sticky-header row items-center justify-between q-pa-sm bg-secondary text-white no-print">
                        <div class="row items-center q-gutter-x-sm q-ml-sm">
                            <q-icon name="visibility" />
                            <div class="text-subtitle1 text-weight-bold">Vista Previa: Formulario #{{ datosFormulario.solicitud.id }}</div>
                        </div>
                        <div class="row items-center q-gutter-x-sm">
                            <q-btn icon="picture_as_pdf" flat round @click="descargarPDF" :loading="loadingPDF">
                                <q-tooltip>Descargar PDF</q-tooltip>
                            </q-btn>
                            <q-btn icon="print" flat round @click="imprimirFormulario">
                                <q-tooltip>Imprimir</q-tooltip>
                            </q-btn>
                            <q-separator vertical dark class="q-mx-sm" />
                            <q-btn icon="close" flat round dense @click="datosFormulario = null" />
                        </div>
                    </div>
                    
                    <div class="q-pa-md flex flex-center bg-white min-height-full">
                        <FormularioOficial :datos="datosFormulario" />
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import adminService from '@/services/adminService'
import { useNotify } from '@/composables/useNotify'
import FormularioOficial from '../FormularioOficial.vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    empleado: { type: Object, default: null },
    historial: { type: Array, default: () => [] },
    solicitudes: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

const notify = useNotify()
const datosFormulario = ref(null)
const loadingPDF = ref(false)
const loadingForm = ref(null)

function formatDateTime(d) {
    if (!d) return '-'
    const date = new Date(d)
    return date.toLocaleDateString('es-BO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function traducirTipoCambio(tipo) {
    const tipos = {
        suma_anual: 'Suma Anual',
        solicitud_aprobada: 'Solicitud Aprobada',
        solicitud_aprobada_documento: 'Solicitud Aprobada (Documento)',
        ajuste_manual: 'Ajuste Manual',
        importacion: 'Importación',
        devolucion_feriado: 'Devolución Feriado',
        cancelacion: 'Cancelación / Reversión'
    }
    return tipos[tipo] || tipo
}

function getIcon(tipo) {
    return {
        suma_anual: 'add_task',
        solicitud_aprobada: 'check_circle',
        solicitud_aprobada_documento: 'verified',
        ajuste_manual: 'edit_note',
        importacion: 'cloud_upload',
        devolucion_feriado: 'event_repeat',
        cancelacion: 'cancel'
    }[tipo] || 'fiber_manual_record'
}

function getColor(tipo) {
    return {
        suma_anual: 'green-7',
        solicitud_aprobada: 'primary',
        solicitud_aprobada_documento: 'secondary',
        ajuste_manual: 'orange-8',
        importacion: 'blue-7',
        devolucion_feriado: 'teal-6',
        cancelacion: 'red-8'
    }[tipo] || 'primary'
}

function extractId(desc) {
    const match = desc?.match(/#(\d+)/)
    return match ? match[1] : '?'
}

async function verFormulario(h) {
    const solicitudId = extractId(h.descripcion)
    if (solicitudId === '?') {
        notify.error('No se pudo identificar el ID de la solicitud')
        return
    }

    // Si ya estamos viendo este formulario, cerrarlo para limpiar la pantalla
    if (datosFormulario.value?.solicitud?.id === parseInt(solicitudId)) {
        datosFormulario.value = null
        return
    }

    loadingForm.value = h.id
    try {
        const res = await adminService.getFormularioData(solicitudId)
        datosFormulario.value = res.data
    } catch {
        notify.error('Error al cargar datos del formulario')
    } finally {
        loadingForm.value = null
    }
}

async function descargarPDF() {
    loadingPDF.value = true
    try {
        const html2pdf = (await import('html2pdf.js')).default
        const element = document.getElementById('formulario-print')
        const opt = {
            margin: 10,
            filename: `Formulario_Vacaciones_${datosFormulario.value?.solicitud?.id || 'solicitud'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'legal', orientation: 'portrait' }
        }
        await html2pdf().set(opt).from(element).save()
        notify.success('PDF descargado correctamente')
    } catch (error) {
        console.error('Error generando PDF:', error)
        notify.error('Error al generar PDF')
    } finally {
        loadingPDF.value = false
    }
}

function imprimirFormulario() {
    window.print()
}
</script>

<style>
/* Estilos globales de impresión optimizados */
@media print {
    @page {
        size: legal;
        margin: 10mm;
    }
    
    /* Ocultar la barra de navegación, el fondo oscuro del diálogo y el historial */
    .q-header, .q-footer, .q-drawer, .q-notifications, .q-dialog__backdrop,
    .q-card__section--main-history, .no-print {
        display: none !important;
    }

    /* Resetear el layout de Quasar para que nada use flex/col-6 en el papel */
    .q-dialog__inner {
        padding: 0 !important;
        display: block !important;
    }

    .q-dialog__inner > div {
        max-width: 100% !important;
        max-height: 100% !important;
        width: 100% !important;
        height: auto !important;
        box-shadow: none !important;
        display: block !important;
    }

    .q-card {
        display: block !important;
        background: white !important;
    }

    /* Forzar el contenedor del formulario a ser visible y ocupar todo el ancho */
    #formulario-print {
        display: block !important;
        width: 100% !important;
        position: static !important; /* Cambiado de absolute para mejor flujo en papel */
        padding: 0 !important;
        margin: 0 !important;
    }

    /* Asegurar que el componente interno no tenga límites */
    .formulario-oficial {
        max-width: 100% !important;
        width: 100% !important;
        box-shadow: none !important;
        padding: 0 !important;
    }

    /* Ocultar la columna de la izquierda (historial) por completo en impresión */
    .col-history-pane {
        display: none !important;
    }

    /* La columna del formulario (derecha) ahora es el root */
    .col-preview-pane {
        width: 100% !important;
        display: block !important;
        background: white !important;
    }

    /* Habilitar scroll del cuerpo para que salga todo el documento si es largo */
    body, html {
        height: auto !important;
        overflow: visible !important;
    }
}
</style>

<style scoped>
.transition-width {
    transition: width 0.3s ease-in-out, flex 0.3s ease-in-out;
}

.border-left-heavy {
    border-left: 2px solid #ddd;
}

.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
}

.min-height-full {
    min-height: 100%;
}

.scroll {
    overflow-y: auto;
}

/* Clases de apoyo para la impresión */
@media print {
    .no-print {
        display: none !important;
    }
}
</style>
