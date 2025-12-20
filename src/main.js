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

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  config: {
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
