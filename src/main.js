import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import router from './router'

// Quasar styles
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

// App styles
import './style.css'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Inicializar autenticación ANTES del router para evitar logout al recargar
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  config: {
    brand: {
      primary: '#663399',
      secondary: '#009999',
      accent: '#00AAAA',
      positive: '#21BA45',
      negative: '#C10015',
      warning: '#F2C037',
      info: '#009999'
    },
    notify: {
      position: 'top-right',
      timeout: 3000
    },
    loading: {
      spinnerColor: 'primary'
    }
  }
})

app.mount('#app')
