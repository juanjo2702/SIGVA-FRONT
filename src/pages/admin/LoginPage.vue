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
<<<<<<< HEAD
    // Si llegamos a esta página, es porque no hay sesión o se intentó entrar manualmente.
    // Redirigimos al portal central de SISPO para mantener la centralización.
    window.location.href = 'https://postulacionesunitepc.xpertiaplus.com/#/login'
=======
  const currentUrl = window.location.origin
  const ssoUrl = import.meta.env.DEV ? 'http://localhost:9000/#/login' : 'https://sigeth.xpertiaplus.com/#/login'
  
  // En SIGVA usamos history mode por lo que el admin dashboard es /admin/dashboard
  const returnToUrl = encodeURIComponent(`${currentUrl}/admin/dashboard`)
  
  window.location.href = `${ssoUrl}?returnTo=${returnToUrl}`
>>>>>>> feature/sso-backup
})
</script>
