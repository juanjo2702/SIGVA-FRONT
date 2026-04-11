<template>
  <q-page class="window-height window-width flex flex-center bg-grey-2">
    <div class="text-center">
      <q-spinner-dots color="primary" size="4em" />
      <div class="text-h6 q-mt-md text-primary" style="font-weight: bold;">Redirigiendo al Portal Central de Autenticación...</div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const currentUrl = window.location.origin
  const ssoUrl = `${import.meta.env.VITE_SSO_FRONT_URL}/#/login`
  const force = new URLSearchParams(window.location.search).get('force') === 'true'

  // En SIGVA usamos history mode por lo que el admin dashboard es /admin/dashboard
  const returnToUrl = encodeURIComponent(`${currentUrl}/admin/dashboard`)

  window.location.href = `${ssoUrl}?returnTo=${returnToUrl}${force ? '&force=true' : ''}`
})
</script>
