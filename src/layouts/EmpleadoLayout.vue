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
    const ssoUrl = process.env.DEV ? 'http://localhost:9000/#/login' : 'https://sigeth.xpertiaplus.com/#/login'
    window.location.href = ssoUrl
}
</script>
