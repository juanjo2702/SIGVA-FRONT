<template>
  <q-layout view="hHh lpR fFf">
    <!-- Main content (No Header/Footer as requested for Portal feel) -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())

const goToLogin = () => {
    const currentUrl = window.location.origin
    const returnToUrl = encodeURIComponent(`${currentUrl}/admin/dashboard`)
    const ssoUrl = `${import.meta.env.VITE_SSO_FRONT_URL}/#/login?returnTo=${returnToUrl}`
    window.location.href = ssoUrl
}
</script>
