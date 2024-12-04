import { createApp } from 'vue'

import App from './App.vue'

// @ts-expect-error: expected
import MySvgIcon from '~virtual/svg-component'

createApp(App).component('SvgIcon', MySvgIcon).mount('#app')
