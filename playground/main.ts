import { createApp } from 'vue'
import SvgIcon from 'virtual:svg-component'
import App from './App.vue'
import router from './router'

createApp(App).use({ name: 'svg-icon', SvgIcon }).use(router).mount('#app')
