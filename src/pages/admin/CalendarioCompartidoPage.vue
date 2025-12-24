<template>
    <q-page class="q-pa-md">
        <!-- Header -->
        <q-card class="q-mb-md shadow-2">
            <q-card-section class="bg-primary text-white">
                <div class="row items-center">
                    <div class="col">
                        <div class="text-h5">
                            <q-icon name="calendar_month" class="q-mr-sm" />
                            Calendario de Vacaciones
                        </div>
                        <div class="text-caption">Vista general de vacaciones del equipo</div>
                    </div>
                    <div class="col-auto q-gutter-sm row">
                        <q-select v-model="filtroEstado" :options="estadoOptions" label="Estado" emit-value map-options
                            outlined dense dark style="min-width: 180px" @update:model-value="cargarVacaciones" />
                        <q-select v-model="filtroSede" :options="sedesOptions" label="Filtrar por sede" emit-value
                            map-options outlined dense dark style="min-width: 200px"
                            @update:model-value="cargarVacaciones" />
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- Navegación del Calendario -->
        <q-card class="q-mb-md shadow-2">
            <q-card-section>
                <div class="row items-center justify-between">
                    <q-btn flat round icon="chevron_left" @click="mesAnterior" />
                    <div class="text-h5 text-capitalize">{{ mesActual }}</div>
                    <q-btn flat round icon="chevron_right" @click="mesSiguiente" />
                </div>
            </q-card-section>
        </q-card>

        <!-- Calendario -->
        <q-card class="shadow-2" :class="{ 'loading-overlay': loading }">
            <q-card-section v-if="loading" class="flex flex-center q-pa-xl">
                <q-spinner-dots size="50px" color="primary" />
            </q-card-section>

            <q-card-section v-else class="q-pa-none">
                <!-- Días de la semana -->
                <div class="calendario-header row">
                    <div v-for="dia in diasSemana" :key="dia"
                        class="col calendario-header-dia text-center text-weight-bold">
                        {{ dia }}
                    </div>
                </div>

                <!-- Semanas -->
                <div v-for="(semana, idx) in semanasDelMes" :key="idx" class="row calendario-semana">
                    <div v-for="dia in semana" :key="dia.fecha || idx + '-' + dia.numero" class="col calendario-dia"
                        :class="getDiaClasses(dia)" @click="dia.fecha && abrirDetalleDia(dia)">
                        <div class="dia-numero">{{ dia.numero }}</div>

                        <!-- Vacaciones del día -->
                        <div v-if="dia.vacaciones && dia.vacaciones.length > 0" class="vacaciones-container">
                            <q-chip v-for="(vac, i) in dia.vacaciones.slice(0, 3)" :key="i"
                                :style="{ backgroundColor: getSedeColor(vac.sede_id), color: 'white' }" size="sm" dense
                                class="vacacion-chip">
                                <q-tooltip>{{ vac.nombre_completo }} - {{ vac.sede_nombre }}</q-tooltip>
                                {{ vac.nombre_corto }}
                            </q-chip>
                            <q-chip v-if="dia.vacaciones.length > 3" color="grey-6" text-color="white" size="sm" dense
                                class="vacacion-chip">
                                +{{ dia.vacaciones.length - 3 }} más
                            </q-chip>
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- Leyenda -->
        <q-card class="q-mt-md shadow-2">
            <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Leyenda por Sede</div>
                <div class="row q-gutter-sm">
                    <q-chip v-for="sede in sedesConColor" :key="sede.id"
                        :style="{ backgroundColor: sede.color, color: 'white' }" size="sm">
                        {{ sede.nombre }}
                    </q-chip>
                </div>
            </q-card-section>
        </q-card>

        <!-- Diálogo de Detalle del Día -->
        <q-dialog v-model="dialogDetalle">
            <q-card style="min-width: 400px">
                <q-card-section class="bg-primary text-white">
                    <div class="text-h6">
                        <q-icon name="event" class="q-mr-sm" />
                        {{ formatFechaCompleta(diaSeleccionado?.fecha) }}
                    </div>
                </q-card-section>

                <q-card-section v-if="diaSeleccionado?.vacaciones?.length">
                    <q-list separator>
                        <q-item v-for="vac in diaSeleccionado.vacaciones" :key="vac.empleado_id">
                            <q-item-section avatar>
                                <q-avatar :style="{ backgroundColor: getSedeColor(vac.sede_id) }" text-color="white">
                                    {{ vac.iniciales }}
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ vac.nombre_completo }}</q-item-label>
                                <q-item-label caption>{{ vac.sede_nombre }} • {{ getTipoLabel(vac.tipo)
                                    }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-badge :color="vac.tipo === 'completo' ? 'primary' : 'orange'">
                                    {{ vac.tipo === 'completo' ? 'Día completo' : 'Medio día' }}
                                </q-badge>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>

                <q-card-section v-else class="text-center text-grey-6">
                    <q-icon name="event_available" size="48px" class="q-mb-sm" />
                    <div>No hay vacaciones programadas para este día</div>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import adminService from '@/services/adminService'

const loading = ref(false)
const fechaActual = ref(new Date())
const vacaciones = ref([])
const sedes = ref([])
const filtroSede = ref(null)
const filtroEstado = ref('aprobada') // Por defecto solo aprobadas

const dialogDetalle = ref(false)
const diaSeleccionado = ref(null)

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const estadoOptions = [
    { value: 'aprobada', label: 'Solo Aprobadas' },
    { value: 'todos', label: 'Aprobadas + Pend. Doc.' }
]

// Colores para sedes
const coloresSedes = [
    '#663399', // Purple
    '#009999', // Teal
    '#E91E63', // Pink
    '#FF9800', // Orange
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple Dark
    '#795548', // Brown
]

const sedesOptions = computed(() => [
    { value: null, label: 'Todas las sedes' },
    ...sedes.value.map(s => ({ value: s.id, label: s.nombre }))
])

const sedesConColor = computed(() =>
    sedes.value.map((s, i) => ({
        ...s,
        color: coloresSedes[i % coloresSedes.length]
    }))
)

const mesActual = computed(() => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${meses[fechaActual.value.getMonth()]} ${fechaActual.value.getFullYear()}`
})

const semanasDelMes = computed(() => {
    const semanas = []
    const año = fechaActual.value.getFullYear()
    const mes = fechaActual.value.getMonth()

    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)

    // Ajustar primer día (0 = Lunes en nuestro calendario)
    let diaSemana = primerDia.getDay()
    diaSemana = diaSemana === 0 ? 6 : diaSemana - 1

    let semana = []

    // Días vacíos al inicio
    for (let i = 0; i < diaSemana; i++) {
        semana.push({ numero: '', fecha: null, esOtroMes: true })
    }

    // Días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const fecha = new Date(año, mes, dia)
        const fechaStr = fecha.toISOString().split('T')[0]
        const esDomingo = fecha.getDay() === 0
        const esSabado = fecha.getDay() === 6
        const esHoy = fechaStr === new Date().toISOString().split('T')[0]

        // Buscar vacaciones para este día (normalizar fecha del API que viene como ISO)
        const vacacionesDia = vacaciones.value.filter(v => {
            const vacFecha = v.fecha ? v.fecha.split('T')[0] : ''
            return vacFecha === fechaStr
        })

        semana.push({
            numero: dia,
            fecha: fechaStr,
            esDomingo,
            esSabado,
            esHoy,
            vacaciones: vacacionesDia
        })

        if (semana.length === 7) {
            semanas.push(semana)
            semana = []
        }
    }

    // Completar última semana
    while (semana.length > 0 && semana.length < 7) {
        semana.push({ numero: '', fecha: null, esOtroMes: true })
    }
    if (semana.length > 0) {
        semanas.push(semana)
    }

    return semanas
})

function getSedeColor(sedeId) {
    const idx = sedes.value.findIndex(s => s.id === sedeId)
    return coloresSedes[idx % coloresSedes.length] || '#666'
}

function getDiaClasses(dia) {
    return {
        'dia-otro-mes': dia.esOtroMes,
        'dia-domingo': dia.esDomingo,
        'dia-sabado': dia.esSabado,
        'dia-hoy': dia.esHoy,
        'dia-con-vacaciones': dia.vacaciones?.length > 0,
        'clickable': dia.fecha
    }
}

function getTipoLabel(tipo) {
    return {
        completo: 'Día completo',
        parcial_manana: 'Mañana',
        parcial_tarde: 'Tarde'
    }[tipo] || tipo
}

function formatFechaCompleta(fecha) {
    if (!fecha) return ''
    const d = new Date(fecha + 'T12:00:00')
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

function mesAnterior() {
    fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() - 1, 1)
    cargarVacaciones()
}

function mesSiguiente() {
    fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1, 1)
    cargarVacaciones()
}

function abrirDetalleDia(dia) {
    diaSeleccionado.value = dia
    dialogDetalle.value = true
}

async function cargarSedes() {
    try {
        const res = await adminService.getSedes({ all: true })
        sedes.value = Array.isArray(res.data) ? res.data : []
    } catch {
        sedes.value = []
    }
}

async function cargarVacaciones() {
    loading.value = true
    try {
        const año = fechaActual.value.getFullYear()
        const mes = fechaActual.value.getMonth() + 1

        const params = {
            mes,
            ano: año,
            sede_id: filtroSede.value || undefined,
            estado: filtroEstado.value || undefined
        }

        const res = await adminService.getVacacionesCalendario(params)
        vacaciones.value = Array.isArray(res.data) ? res.data : []
    } catch (error) {
        console.error('Error cargando vacaciones:', error)
        vacaciones.value = []
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    cargarSedes()
    cargarVacaciones()
})
</script>

<style scoped>
.calendario-header {
    background: #f5f5f5;
    border-bottom: 2px solid #e0e0e0;
}

.calendario-header-dia {
    padding: 12px 8px;
    color: #666;
    font-size: 14px;
}

.calendario-semana {
    border-bottom: 1px solid #e0e0e0;
}

.calendario-semana:last-child {
    border-bottom: none;
}

.calendario-dia {
    min-height: 100px;
    padding: 8px;
    border-right: 1px solid #e0e0e0;
    position: relative;
    transition: background-color 0.2s;
}

.calendario-dia:last-child {
    border-right: none;
}

.calendario-dia.clickable {
    cursor: pointer;
}

.calendario-dia.clickable:hover {
    background-color: #f0f0f0;
}

.dia-numero {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
}

.dia-otro-mes {
    background: #fafafa;
}

.dia-otro-mes .dia-numero {
    color: #ccc;
}

.dia-domingo {
    background: #fff5f5;
}

.dia-domingo .dia-numero {
    color: #c62828;
}

.dia-sabado {
    background: #fafafa;
}

.dia-hoy {
    background: #e3f2fd !important;
}

.dia-hoy .dia-numero {
    background: #1976d2;
    color: white;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dia-con-vacaciones {
    background: #f3e5f5;
}

.vacaciones-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 4px;
}

.vacacion-chip {
    font-size: 10px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.loading-overlay {
    opacity: 0.6;
}

@media (max-width: 768px) {
    .calendario-dia {
        min-height: 60px;
        padding: 4px;
    }

    .vacacion-chip {
        font-size: 8px;
    }
}
</style>
