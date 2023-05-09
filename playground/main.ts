import { createApp } from 'vue'

import App from './App.vue'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import MySvgIcon from '~virtual/svg-component'

createApp(App).component('SvgIcon', MySvgIcon).mount('#app')
