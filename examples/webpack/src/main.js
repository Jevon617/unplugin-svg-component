import Vue from 'vue'
import App from './App.vue'
import svgIcon from '~virtual/svg-component'

Vue.config.productionTip = false

const app = new Vue({
  render: h => h(App),
})

Vue.component(svgIcon.name, svgIcon)

app.$mount('#app')
