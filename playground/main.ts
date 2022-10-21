import { createApp } from 'vue'
import MySvgIcon from 'virtual:svg-component'
import App from './App.vue'
import router from './router'

createApp(App).component('MySvgIcon', MySvgIcon).use(router).mount('#app')
