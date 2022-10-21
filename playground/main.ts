import { createApp } from 'vue'
import MySvgIcon from 'virtual:svg-component'
import App from './App.vue'
import router from './router'

createApp(App).component(MySvgIcon.name, MySvgIcon).use(router).mount('#app')
