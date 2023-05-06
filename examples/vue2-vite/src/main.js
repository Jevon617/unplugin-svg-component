import Vue from 'vue'
import App from './App.vue'
import MySvgIcon from '~virtual/svg-component'

Vue.config.productionTip = false

const app = new Vue({
  render: h => h(App),
})

Vue.component(MySvgIcon.name, MySvgIcon)

app.$mount('#app')
