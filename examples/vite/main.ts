import { createApp } from 'vue'
import App from './App.vue'
import MySvgIcon from '~virtual/svg-component'

createApp(App).component(MySvgIcon.name, MySvgIcon).mount('#app')
