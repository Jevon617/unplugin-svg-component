import { createApp } from 'vue'
import App from './App.vue'
import type { SvgName } from '~virtual/svg-component'
import MySvgIcon, { svgNames } from '~virtual/svg-component'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const test: SvgName = 'icon-common-icon-add'

// eslint-disable-next-line no-console
console.log(svgNames)

createApp(App).component(MySvgIcon.name, MySvgIcon).mount('#app')
