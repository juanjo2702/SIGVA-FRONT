<template>
  <q-page class="documentacion-page">
    <!-- Header moderno -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <div class="title-icon">
            <q-icon name="menu_book" size="32px" />
          </div>
          <div>
            <h1>Documentación del Sistema</h1>
            <p class="subtitle">Guía de novedades y funcionalidades - Versión 2.5 (Enero 2026)</p>
          </div>
        </div>
        <div class="header-version">
          <q-chip color="white" text-color="primary" icon="verified">
            Actualizado
          </q-chip>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Columna Izquierda: Funcionalidades Principales -->
      <div class="col-12 col-md-8">

        <!-- 1. Gestión de Vacaciones (CORE) -->
        <q-card class="doc-card q-mb-lg">
          <q-expansion-item icon="beach_access" label="Gestión de Vacaciones"
            caption="Flujos de solicitud, edición y aprobación" default-opened
            header-class="text-primary text-weight-bold bg-blue-1" expand-icon-class="text-primary">
            <q-card-section>
              <!-- Flujo de Edición -->
              <div class="feature-block q-mb-lg">
                <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">
                  <q-icon name="edit_note" /> Nuevo Flujo de Edición (Seguro)
                </div>
                <p class="text-body2 text-grey-8">
                  Hemos mejorado la seguridad al editar solicitudes ya aprobadas para garantizar que el respaldo
                  documental siempre coincida con el sistema.
                </p>
                <q-list bordered separator class="rounded-borders bg-grey-1">
                  <q-item>
                    <q-item-section avatar><q-icon name="looks_one" color="primary" /></q-item-section>
                    <q-item-section>
                      <q-item-label>Edición de Aprobada</q-item-label>
                      <q-item-label caption>Al editar una solicitud aprobada, el sistema revierte temporalmente el saldo
                        al empleado.</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="looks_two" color="orange" /></q-item-section>
                    <q-item-section>
                      <q-item-label>Estado Pendiente de Documento</q-item-label>
                      <q-item-label caption>La solicitud pasa a estado amarillo. Se genera un nuevo Formulario PDF con
                        los cambios.</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="looks_3" color="green" /></q-item-section>
                    <q-item-section>
                      <q-item-label>Re-Confirmación</q-item-label>
                      <q-item-label caption>Es obligatorio dar clic en "Confirmar Documento" con el nuevo papel impreso
                        para volver a aprobarla.</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <q-separator spaced />

              <!-- Vacaciones Discontinuas -->
              <div class="feature-block q-mb-lg">
                <div class="text-subtitle1 text-weight-bold text-teal q-mb-sm">
                  <q-icon name="layers" /> Vacaciones por Etapas
                </div>
                <p class="text-body2 text-grey-8">
                  Ahora el sistema soporta vacaciones discontinuas en una misma solicitud.
                </p>
                <div class="row q-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-banner class="bg-teal-1 rounded-borders">
                      <div class="text-weight-bold text-teal-9">Visualización Inteligente</div>
                      <div class="text-caption">El formulario PDF agrupa automáticamente los días consecutivos en
                        "Etapas" (Ej: Etapa 1: Lun-Mie, Etapa 2: Vie-Vie).</div>
                    </q-banner>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-banner class="bg-teal-1 rounded-borders">
                      <div class="text-weight-bold text-teal-9">Formulario Oficial</div>
                      <div class="text-caption">El PDF generado cumple con el formato oficial de UNITEPC, incluyendo
                        logos, firmas y desglose de días.</div>
                    </q-banner>
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <!-- Cancelación -->
              <div class="feature-block">
                <div class="text-subtitle1 text-weight-bold text-negative q-mb-sm">
                  <q-icon name="cancel" /> Cancelación y Devolución
                </div>
                <p class="text-body2 text-grey-8">
                  Permite cancelar solicitudes en cualquier estado, especificando un motivo. Si estaba aprobada,
                  devuelve los días al saldo automáticamente.
                </p>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>

        <!-- 2. Gestión Administrativa -->
        <q-card class="doc-card q-mb-lg">
          <q-expansion-item icon="settings_suggest" label="Administración Inteligente"
            caption="Feriados, Sedes y Usuarios" header-class="text-secondary text-weight-bold bg-orange-1"
            expand-icon-class="text-secondary">
            <q-card-section>
              <!-- Feriados Recurrentes -->
              <div class="feature-block q-mb-lg">
                <div class="text-subtitle1 text-weight-bold text-orange-9 q-mb-sm">
                  <q-icon name="repeat" /> Feriados Recurrentes <q-badge color="green" label="NUEVO" align="middle" />
                </div>
                <p class="text-body2 text-grey-8">
                  Olvídate de crear los mismos feriados cada año.
                </p>
                <ul class="doc-list">
                  <li>Ahora puedes marcar un feriado como <strong>"Se repite todos los años"</strong>.</li>
                  <li>El sistema lo proyectará automáticamente en el calendario de futuros años (2026, 2027...).</li>
                  <li>Visualización inmediata en calendarios y validaciones.</li>
                </ul>
              </div>

              <q-separator spaced />

              <!-- Calendario Compartido -->
              <div class="feature-block q-mb-lg">
                <div class="text-subtitle1 text-weight-bold text-purple q-mb-sm">
                  <q-icon name="calendar_month" /> Calendario de Equipo
                </div>
                <p class="text-body2 text-grey-8">
                  Nueva vista mensual para ver quién está de vacaciones.
                </p>
                <ul class="doc-list">
                  <li>Filtros por <strong>Sede</strong> para ver solo tu equipo local.</li>
                  <li>Visualización de feriados nacionales y departamentales.</li>
                  <li>Diferenciación de colores por estado.</li>
                </ul>
              </div>

              <q-separator spaced />

              <!-- Importación y Sedes -->
              <div class="feature-block">
                <div class="text-subtitle1 text-weight-bold text-indigo q-mb-sm">
                  <q-icon name="domain" /> Sedes y Empleados
                </div>
                <p class="text-body2 text-grey-8">
                  Gestión centralizada de múltiples sedes (Cochabamba, La Paz, etc.).
                  Importación masiva de empleados desde Excel mejorada, permitiendo asignar sede en bloque y detectar
                  duplicados.
                </p>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>

      </div>

      <!-- Columna Derecha: UI y Técnico -->
      <div class="col-12 col-md-4">

        <!-- Mejoras UI -->
        <q-card class="doc-card q-mb-lg">
          <q-card-section class="bg-grey-1">
            <div class="text-subtitle1 text-weight-bold">🎨 Experiencia de Usuario</div>
          </q-card-section>
          <q-card-section>
            <q-list dense>
              <q-item>
                <q-item-section avatar><q-icon name="palette" color="purple" /></q-item-section>
                <q-item-section>
                  <q-item-label>Diseño UNITEPC</q-item-label>
                  <q-item-label caption>Interfaz estandarizada, moderna y responsive con colores
                    institucionales.</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar><q-icon name="search" color="blue" /></q-item-section>
                <q-item-section>
                  <q-item-label>Filtros Avanzados</q-item-label>
                  <q-item-label caption>Búsquedas rápidas por CI, Nombre, Sede y Fecha en todas las
                    tablas.</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar><q-icon name="smartphone" color="green" /></q-item-section>
                <q-item-section>
                  <q-item-label>Modo Móvil</q-item-label>
                  <q-item-label caption>Tablas y menús adaptados para smartphones y tablets.</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Mejoras Técnicas -->
        <q-card class="doc-card">
          <q-card-section class="bg-grey-9 text-white">
            <div class="text-subtitle1 text-weight-bold">🛠️ Ingeniería</div>
          </q-card-section>
          <q-card-section>
            <div class="text-caption text-grey-8 q-mb-md">Cambios bajo el capó para mayor estabilidad.</div>

            <q-chip size="sm" color="blue-grey" text-color="white" icon="storage">BD Optimizada</q-chip>
            <q-chip size="sm" color="blue-grey" text-color="white" icon="security">Roles & Permisos</q-chip>
            <q-chip size="sm" color="blue-grey" text-color="white" icon="warning">Manejo de Errores</q-chip>
            <q-chip size="sm" color="blue-grey" text-color="white" icon="history">Auditoría</q-chip>
            <q-chip size="sm" color="blue-grey" text-color="white" icon="restore_from_trash">Soft Deletes</q-chip>
          </q-card-section>
        </q-card>

      </div>
    </div>

    <!-- Footer -->
    <div class="footer-doc q-mt-xl">
      <q-separator class="q-mb-md" />
      <div class="row items-center justify-between text-grey-6">
        <div>
          <q-icon name="code" /> Sistema SIGVA
        </div>
        <div>
          UNITEPC © {{ new Date().getFullYear() }}
        </div>
      </div>
    </div>

  </q-page>
</template>

<script setup>
// Lógica simple, todo es estático e informativo
</script>

<style scoped>
.documentacion-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 12px;
}

.header-title h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  margin: 5px 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.doc-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.doc-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.feature-block {
  padding: 8px 0;
}

.doc-list {
  padding-left: 20px;
  margin: 10px 0;
  color: #424242;
}

.doc-list li {
  margin-bottom: 6px;
}

@media (max-width: 768px) {
  .documentacion-page {
    padding: 16px;
  }

  .page-header {
    padding: 20px;
    border-radius: 12px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-title h1 {
    font-size: 1.5rem;
  }

  .col-md-8,
  .col-md-4 {
    width: 100%;
  }
}
</style>
