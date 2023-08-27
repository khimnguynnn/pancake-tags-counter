import { createApp } from 'vue'
import './assets/styles/reset.css'
import './assets/styles/global.css'
import './assets/styles/tailwind.css'
import App from './App.vue'
import {createPinia} from "pinia";
import router from "./router.js";


const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
