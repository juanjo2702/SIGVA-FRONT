import { useQuasar } from 'quasar'

/**
 * Composable para notificaciones simplificadas
 */
export function useNotify() {
  const $q = useQuasar()

  function success(message, caption = null) {
    $q.notify({
      type: 'positive',
      message,
      caption,
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000
    })
  }

  function error(message, caption = null) {
    $q.notify({
      type: 'negative',
      message,
      caption,
      icon: 'error',
      position: 'top-right',
      timeout: 4000
    })
  }

  function warning(message, caption = null) {
    $q.notify({
      type: 'warning',
      message,
      caption,
      icon: 'warning',
      position: 'top-right',
      timeout: 3500
    })
  }

  function info(message, caption = null) {
    $q.notify({
      type: 'info',
      message,
      caption,
      icon: 'info',
      position: 'top-right',
      timeout: 3000
    })
  }

  return {
    success,
    error,
    warning,
    info
  }
}

export default useNotify
