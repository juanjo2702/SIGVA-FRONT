<template>
  <q-page class="q-pa-lg">
    <div class="page-header q-mb-lg">
      <h1 class="text-h4 text-weight-bold q-mb-sm">📚 Documentación del Sistema</h1>
      <p class="text-subtitle1 text-grey-7">Registro de cambios, nuevas funcionalidades y mejoras implementadas</p>
    </div>

    <!-- Versión Actual -->
    <q-card class="version-card q-mb-lg" flat bordered>
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 text-weight-bold">SIGVA v2.0</div>
            <div class="text-caption">Sistema Integral de Gestión de Vacaciones</div>
          </div>
          <div class="col-auto">
            <q-chip color="white" text-color="primary" icon="update">
              Diciembre 2025
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Últimas Actualizaciones -->
    <q-card class="changelog-card q-mb-lg" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="new_releases" color="orange" class="q-mr-sm" />
          Últimas Actualizaciones - Diciembre 2025
        </div>

        <!-- Edición de Solicitudes Aprobadas -->
        <q-expansion-item icon="edit_note" label="Edición de Solicitudes Aprobadas" caption="Nueva funcionalidad"
          header-class="text-primary" expand-icon-class="text-primary" default-opened>
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="green" class="q-mb-md">NUEVO</q-badge>

              <p class="text-body1">
                Ahora es posible <strong>editar solicitudes de vacaciones ya aprobadas</strong>.
                El sistema recalcula automáticamente el saldo del empleado.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="check_circle" color="positive" size="sm" />
                  <span>Solicitudes pendientes: se pueden modificar libremente</span>
                </div>
                <div class="feature-item">
                  <q-icon name="check_circle" color="positive" size="sm" />
                  <span>Solicitudes aprobadas: se ajusta el saldo automáticamente</span>
                </div>
                <div class="feature-item">
                  <q-icon name="check_circle" color="positive" size="sm" />
                  <span>Los cambios quedan registrados en el historial del empleado</span>
                </div>
                <div class="feature-item">
                  <q-icon name="cancel" color="negative" size="sm" />
                  <span>Solicitudes rechazadas: no se pueden editar</span>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-weight-bold q-mb-sm">¿Cómo funciona el recálculo?</div>
              <q-banner class="bg-blue-1 q-pa-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" color="primary" />
                </template>
                <div class="text-body2">
                  <strong>Ejemplo:</strong> Si una solicitud aprobada tenía 5 días y la modificas a 3 días:
                  <ul class="q-mt-sm q-mb-none">
                    <li>Se devuelven 5 días al saldo del empleado</li>
                    <li>Se descuentan los 3 nuevos días</li>
                    <li>Resultado: el empleado recupera 2 días de saldo</li>
                  </ul>
                </div>
              </q-banner>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Branding UNITEPC -->
        <q-expansion-item icon="palette" label="Branding UNITEPC" caption="Mejora visual - Diciembre 2025"
          header-class="text-primary" default-opened>
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="purple" class="q-mb-md">NUEVO DISEÑO</q-badge>

              <p class="text-body1">
                El sistema ahora cuenta con la <strong>identidad visual de UNITEPC</strong>.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="color_lens" color="purple" size="sm" />
                  <span><strong>Paleta de colores:</strong> Purple #663399, Teal #009999</span>
                </div>
                <div class="feature-item">
                  <q-icon name="image" color="green" size="sm" />
                  <span>Logo UNITEPC en login, sidebar y headers</span>
                </div>
                <div class="feature-item">
                  <q-icon name="tab" color="blue" size="sm" />
                  <span>Favicon UNITEPC en la pestaña del navegador</span>
                </div>
                <div class="feature-item">
                  <q-icon name="login" color="orange" size="sm" />
                  <span>Login completamente rediseñado con gradiente</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Filtros de Búsqueda -->
        <q-expansion-item icon="search" label="Filtros de Búsqueda Mejorados"
          caption="Mejora funcional - Diciembre 2025" header-class="text-primary" default-opened>
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="blue" class="q-mb-md">MEJORADO</q-badge>

              <p class="text-body1">
                Los filtros de búsqueda ahora son <strong>funcionales en todas las páginas</strong>.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="person_search" color="primary" size="sm" />
                  <span><strong>Solicitudes:</strong> Búsqueda por nombre, apellido o CI</span>
                </div>
                <div class="feature-item">
                  <q-icon name="business" color="teal" size="sm" />
                  <span><strong>Filtro por Sede:</strong> Nuevo dropdown para filtrar por sede</span>
                </div>
                <div class="feature-item">
                  <q-icon name="date_range" color="orange" size="sm" />
                  <span>Filtros por rango de fechas</span>
                </div>
                <div class="feature-item">
                  <q-icon name="filter_list" color="green" size="sm" />
                  <span>Filtros por estado de solicitud</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Campo Reemplazo Manual -->
        <q-expansion-item icon="person" label="Campo Reemplazo Simplificado" caption="Mejora funcional - Diciembre 2025"
          header-class="text-primary">
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="blue" class="q-mb-md">MEJORADO</q-badge>

              <p class="text-body1">
                El campo "Persona que Reemplaza" ahora es un <strong>campo de texto libre</strong>.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="edit" color="primary" size="sm" />
                  <span>Se puede escribir cualquier nombre</span>
                </div>
                <div class="feature-item">
                  <q-icon name="check" color="green" size="sm" />
                  <span>Ya no requiere buscar en una lista</span>
                </div>
                <div class="feature-item">
                  <q-icon name="speed" color="orange" size="sm" />
                  <span>Carga de página más rápida</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Calendario Compartido -->
        <q-expansion-item icon="calendar_month" label="Calendario Compartido"
          caption="Nueva funcionalidad - Diciembre 2025" header-class="text-primary" default-opened>
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="green" class="q-mb-md">NUEVO</q-badge>

              <p class="text-body1">
                Vista de <strong>calendario mensual</strong> que muestra todas las vacaciones del equipo.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="visibility" color="primary" size="sm" />
                  <span>Vista general de vacaciones de todos los empleados</span>
                </div>
                <div class="feature-item">
                  <q-icon name="palette" color="purple" size="sm" />
                  <span>Colores diferenciados por sede</span>
                </div>
                <div class="feature-item">
                  <q-icon name="filter_alt" color="blue" size="sm" />
                  <span>Filtro por sede para ver solo un equipo</span>
                </div>
                <div class="feature-item">
                  <q-icon name="touch_app" color="orange" size="sm" />
                  <span>Click en un día para ver detalle de empleados</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Devolución por Feriados -->
        <q-expansion-item icon="sync" label="Devolución Automática por Feriados"
          caption="Nueva funcionalidad - Diciembre 2025" header-class="text-primary" default-opened>
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="green" class="q-mb-md">NUEVO</q-badge>

              <p class="text-body1">
                Devolución automática de días de vacaciones cuando se crea un feriado que afecta fechas ya programadas.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="auto_fix_high" color="primary" size="sm" />
                  <span>Procesamiento automático al crear feriado</span>
                </div>
                <div class="feature-item">
                  <q-icon name="sync" color="orange" size="sm" />
                  <span>Botón para procesar feriados existentes</span>
                </div>
                <div class="feature-item">
                  <q-icon name="history" color="blue" size="sm" />
                  <span>Registro en historial del empleado</span>
                </div>
                <div class="feature-item">
                  <q-icon name="account_balance" color="green" size="sm" />
                  <span>Devolución de días al saldo del empleado</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Módulo de Sedes -->
        <q-expansion-item icon="business" label="Módulo de Sedes" caption="Nueva funcionalidad"
          header-class="text-primary">
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="green" class="q-mb-md">NUEVO</q-badge>

              <p class="text-body1">
                Gestión centralizada de las <strong>sedes</strong> de la organización.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="add_circle" color="positive" size="sm" />
                  <span>Crear, editar y eliminar sedes</span>
                </div>
                <div class="feature-item">
                  <q-icon name="location_city" color="primary" size="sm" />
                  <span>Cada sede tiene nombre, abreviación y departamento</span>
                </div>
                <div class="feature-item">
                  <q-icon name="people" color="info" size="sm" />
                  <span>Los empleados se asignan a una sede específica</span>
                </div>
                <div class="feature-item">
                  <q-icon name="celebration" color="orange" size="sm" />
                  <span>Los feriados departamentales se vinculan a sedes</span>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-weight-bold q-mb-sm">Sedes Registradas:</div>
              <div class="row q-gutter-sm">
                <q-chip v-for="sede in sedesEjemplo" :key="sede" outline color="primary">
                  {{ sede }}
                </q-chip>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Módulo de Feriados -->
        <q-expansion-item icon="celebration" label="Módulo de Feriados" caption="Nueva funcionalidad"
          header-class="text-primary">
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="green" class="q-mb-md">NUEVO</q-badge>

              <p class="text-body1">
                Administración completa de <strong>feriados nacionales y departamentales</strong>.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="flag" color="red" size="sm" />
                  <span><strong>Feriados Nacionales:</strong> Aplican a todas las sedes</span>
                </div>
                <div class="feature-item">
                  <q-icon name="location_on" color="blue" size="sm" />
                  <span><strong>Feriados Departamentales:</strong> Solo aplican a sedes del departamento</span>
                </div>
                <div class="feature-item">
                  <q-icon name="event_busy" color="warning" size="sm" />
                  <span>Los feriados se muestran en el calendario de vacaciones</span>
                </div>
                <div class="feature-item">
                  <q-icon name="block" color="negative" size="sm" />
                  <span>No se pueden solicitar vacaciones en días feriados</span>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-weight-bold q-mb-sm">Feriados Nacionales de Bolivia:</div>
              <div class="row q-gutter-xs">
                <q-chip size="sm" color="red-1" text-color="red-9">1 Ene - Año Nuevo</q-chip>
                <q-chip size="sm" color="red-1" text-color="red-9">22 Ene - Estado Plurinacional</q-chip>
                <q-chip size="sm" color="red-1" text-color="red-9">1 May - Día del Trabajo</q-chip>
                <q-chip size="sm" color="red-1" text-color="red-9">21 Jun - Año Nuevo Aymara</q-chip>
                <q-chip size="sm" color="red-1" text-color="red-9">6 Ago - Independencia</q-chip>
                <q-chip size="sm" color="red-1" text-color="red-9">2 Nov - Todos Santos</q-chip>
                <q-chip size="sm" color="red-1" text-color="red-9">25 Dic - Navidad</q-chip>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Calendario Mejorado -->
        <q-expansion-item icon="calendar_month" label="Calendario de Vacaciones Mejorado"
          caption="Mejora de funcionalidad" header-class="text-primary">
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="blue" class="q-mb-md">MEJORADO</q-badge>

              <p class="text-body1">
                El calendario de selección de vacaciones ahora incluye <strong>visualización de feriados</strong>.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="palette" color="red" size="sm" />
                  <span>Los días feriados se muestran en <strong style="color: #c62828">rojo</strong></span>
                </div>
                <div class="feature-item">
                  <q-icon name="celebration" color="orange" size="sm" />
                  <span>Icono de celebración en días feriados</span>
                </div>
                <div class="feature-item">
                  <q-icon name="info" color="info" size="sm" />
                  <span>Tooltip muestra el nombre del feriado al pasar el cursor</span>
                </div>
                <div class="feature-item">
                  <q-icon name="block" color="grey" size="sm" />
                  <span>No se pueden seleccionar días feriados</span>
                </div>
              </div>

              <div class="calendar-preview q-mt-md q-pa-md bg-grey-2 rounded-borders">
                <div class="text-center text-caption text-grey-7 q-mb-sm">Vista previa del calendario</div>
                <div class="row justify-center q-gutter-xs">
                  <div class="calendar-day">1</div>
                  <div class="calendar-day calendar-feriado">
                    <q-icon name="celebration" size="12px" color="white" />
                    2
                    <q-tooltip>Día del Trabajo</q-tooltip>
                  </div>
                  <div class="calendar-day">3</div>
                  <div class="calendar-day calendar-selected">4</div>
                  <div class="calendar-day calendar-selected">5</div>
                  <div class="calendar-day calendar-weekend">6</div>
                  <div class="calendar-day calendar-weekend">7</div>
                </div>
                <div class="row justify-center q-gutter-sm q-mt-sm">
                  <div class="legend-item">
                    <div class="legend-box bg-primary"></div>
                    <span class="text-caption">Seleccionado</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-box bg-red-8"></div>
                    <span class="text-caption">Feriado</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-box bg-grey-4"></div>
                    <span class="text-caption">Fin de semana</span>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Módulo de Roles -->
        <q-expansion-item icon="admin_panel_settings" label="Gestión de Roles" caption="Nueva funcionalidad"
          header-class="text-primary">
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="green" class="q-mb-md">NUEVO</q-badge>

              <p class="text-body1">
                Sistema de <strong>roles y permisos</strong> para controlar el acceso al sistema.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="person" color="blue" size="sm" />
                  <span><strong>Empleado:</strong> Acceso al portal de empleados</span>
                </div>
                <div class="feature-item">
                  <q-icon name="badge" color="purple" size="sm" />
                  <span><strong>Talento Humano:</strong> Gestión de vacaciones y empleados</span>
                </div>
                <div class="feature-item">
                  <q-icon name="security" color="red" size="sm" />
                  <span><strong>Admin:</strong> Acceso completo al sistema</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Importación de Empleados Mejorada -->
        <q-expansion-item icon="upload_file" label="Importación de Empleados Mejorada" caption="Mejora de funcionalidad"
          header-class="text-primary" default-opened>
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="blue" class="q-mb-md">MEJORADO</q-badge>

              <p class="text-body1">
                El proceso de <strong>importación masiva de empleados</strong> desde Excel ha sido rediseñado
                completamente.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="business" color="primary" size="sm" />
                  <span><strong>Selector de Sede:</strong> Ahora se selecciona la sede al importar</span>
                </div>
                <div class="feature-item">
                  <q-icon name="people" color="green" size="sm" />
                  <span>Todos los empleados importados se asignan a la sede seleccionada</span>
                </div>
                <div class="feature-item">
                  <q-icon name="remove_circle" color="orange" size="sm" />
                  <span>Ya no es necesaria la columna "Sede" en el Excel</span>
                </div>
                <div class="feature-item">
                  <q-icon name="design_services" color="purple" size="sm" />
                  <span>Diseño del modal mejorado con pasos claros</span>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-weight-bold q-mb-sm">Columnas del Excel:</div>
              <div class="row q-gutter-xs">
                <q-chip size="sm" color="green-1" text-color="green-9">1° Apellido *</q-chip>
                <q-chip size="sm" color="grey-3" text-color="grey-8">2° Apellido</q-chip>
                <q-chip size="sm" color="green-1" text-color="green-9">Nombres *</q-chip>
                <q-chip size="sm" color="green-1" text-color="green-9">CI *</q-chip>
                <q-chip size="sm" color="grey-3" text-color="grey-8">Género</q-chip>
                <q-chip size="sm" color="grey-3" text-color="grey-8">Tipo Contrato</q-chip>
                <q-chip size="sm" color="grey-3" text-color="grey-8">Cargo</q-chip>
                <q-chip size="sm" color="green-1" text-color="green-9">Fecha Ingreso *</q-chip>
                <q-chip size="sm" color="grey-3" text-color="grey-8">Saldo Días</q-chip>
              </div>
              <div class="text-caption text-grey-7 q-mt-sm">* Campos obligatorios. Verde = requerido, Gris = opcional
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Vacaciones por Etapas -->
        <q-expansion-item icon="layers" label="Vacaciones por Etapas" caption="Nueva funcionalidad"
          header-class="text-primary" default-opened>
          <q-card>
            <q-card-section class="q-pt-none">
              <q-badge color="green" class="q-mb-md">NUEVO</q-badge>

              <p class="text-body1">
                Ahora las vacaciones discontinuas pueden mostrarse como <strong>etapas separadas</strong> en el
                formulario.
              </p>

              <div class="feature-list q-mt-md">
                <div class="feature-item">
                  <q-icon name="check_box" color="primary" size="sm" />
                  <span><strong>Opción manual:</strong> Checkbox "Mostrar por etapas en formulario"</span>
                </div>
                <div class="feature-item">
                  <q-icon name="calendar_month" color="green" size="sm" />
                  <span>Los días consecutivos se agrupan automáticamente</span>
                </div>
                <div class="feature-item">
                  <q-icon name="picture_as_pdf" color="red" size="sm" />
                  <span>El PDF muestra cada etapa en una fila separada</span>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-weight-bold q-mb-sm">Ejemplo de visualización:</div>
              <q-banner class="bg-grey-2 q-pa-md" rounded>
                <div class="text-body2">
                  <div><strong>Sin etapas:</strong> del 20/12/2024 al 31/12/2024</div>
                  <div class="q-mt-sm"><strong>Con etapas:</strong></div>
                  <div class="q-ml-md">• Etapa 1: del 20/12/2024 al 25/12/2024</div>
                  <div class="q-ml-md">• Etapa 2: del 29/12/2024 al 31/12/2024</div>
                </div>
              </q-banner>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- Mejoras Técnicas -->
    <q-card class="tech-card q-mb-lg" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="settings" color="grey-7" class="q-mr-sm" />
          Mejoras Técnicas
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-item>
              <q-item-section avatar>
                <q-icon name="speed" color="green" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Índices de Base de Datos</q-item-label>
                <q-item-label caption>Consultas más rápidas en empleados y solicitudes</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <div class="col-12 col-md-6">
            <q-item>
              <q-item-section avatar>
                <q-icon name="delete_sweep" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Soft Deletes</q-item-label>
                <q-item-label caption>Los empleados eliminados se pueden recuperar</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <div class="col-12 col-md-6">
            <q-item>
              <q-item-section avatar>
                <q-icon name="security" color="red" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Rate Limiting</q-item-label>
                <q-item-label caption>Protección contra ataques de fuerza bruta</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <div class="col-12 col-md-6">
            <q-item>
              <q-item-section avatar>
                <q-icon name="architecture" color="purple" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Refactorización de Servicios</q-item-label>
                <q-item-label caption>Código más limpio y mantenible</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Próximas Funcionalidades -->
    <q-card class="roadmap-card" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="rocket_launch" color="blue" class="q-mr-sm" />
          Próximas Funcionalidades
        </div>

        <q-timeline color="primary">
          <q-timeline-entry title="Notificaciones por Email" subtitle="Próximamente" icon="email">
            <div>
              Notificaciones automáticas cuando se aprueben o rechacen solicitudes de vacaciones.
            </div>
          </q-timeline-entry>

          <q-timeline-entry title="Reportes Avanzados" subtitle="En planificación" icon="assessment">
            <div>
              Exportación de reportes en Excel con filtros avanzados y gráficos estadísticos.
            </div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>

    <!-- Footer -->
    <div class="text-center q-mt-xl text-grey-6">
      <q-icon name="code" class="q-mr-xs" />
      Desarrollado para UNITEPC - {{ new Date().getFullYear() }}
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const sedesEjemplo = ref([
  'Cochabamba',
  'La Paz',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Sucre',
  'Tarija',
  'Trinidad'
])
</script>

<style scoped>
.page-header h1 {
  color: #1976d2;
}

.version-card {
  border-radius: 12px;
  overflow: hidden;
}

.changelog-card,
.tech-card,
.roadmap-card {
  border-radius: 12px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calendar-preview {
  border-radius: 8px;
}

.calendar-day {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  position: relative;
}

.calendar-day.calendar-feriado {
  background: #c62828;
  color: white;
  border-color: #b71c1c;
}

.calendar-day.calendar-selected {
  background: #1976d2;
  color: white;
}

.calendar-day.calendar-weekend {
  background: #f5f5f5;
  color: #9e9e9e;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
</style>
