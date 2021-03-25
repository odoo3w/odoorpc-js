import Vue from 'vue'
import App from './App.vue'

import store from './store'
import router from './router'
import './permission' // permission control

// // UI 库
import Vant from 'vant'
import 'vant/lib/index.css'
Vue.use(Vant)

// import ViewUI from 'view-design'
// import 'view-design/dist/styles/iview.css'

// Vue.use(ViewUI)

import '@/styles/global.scss'
import '@/styles/style.scss'

Vue.config.productionTip = false

new Vue({
  store, // store by vuex
  router, // router
  render: (h) => h(App),
}).$mount('#app')
