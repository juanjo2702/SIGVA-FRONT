<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-avatar square size="42px" class="q-mr-sm bg-white">
          <img src="/logo-unitepc.png" alt="UNITEPC" style="object-fit: contain; padding: 4px;" />
        </q-avatar>
        <q-toolbar-title>
          <span class="text-weight-bold">SIGVA</span>
          <span class="text-caption q-ml-sm">Sistema de Gestión de Vacaciones</span>
        </q-toolbar-title>
        <q-btn flat label="Portal Talento Humano" icon="admin_panel_settings" to="/admin/login" class="q-ml-md" />
      </q-toolbar>
    </q-header>

    <!-- Main content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer class="bg-grey-2 text-grey-8 q-py-sm">
      <div class="text-center text-caption">
        © {{ currentYear }} SIGVA - Sistema de Gestión de Vacaciones
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
