import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import MySvgIcon from '~virtual/svg-component'

createApp(App).component(MySvgIcon.name, MySvgIcon).use(router).mount('#app')
