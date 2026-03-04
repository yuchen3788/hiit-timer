import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { loginAnonymous } from './utils/cloudbase'
import { usePlansStore } from './stores/plans'
import { useRecordsStore } from './stores/records'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize CloudBase auth and load data
loginAnonymous()
  .then(() => {
    const plansStore = usePlansStore()
    const recordsStore = useRecordsStore()
    plansStore.loadPlans()
    recordsStore.loadRecords()
  })
  .catch((error) => {
    console.error('Failed to initialize CloudBase:', error)
  })

app.mount('#app')
