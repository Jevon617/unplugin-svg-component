import { createApp } from 'vue'
import SvgIcon from 'virtual:svg-component'
import App from './App.vue'
import router from './router'

createApp(App).component('SvgIcon', SvgIcon).use(router).mount('#app')
