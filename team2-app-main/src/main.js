import Vue from 'vue';
import App from './App.vue';
import router from './router';
import css from "./assets/style.css";
import SuiVue from 'semantic-ui-vue';

Vue.config.productionTip = false

new Vue({
  router,
  css,
  render: h => h(App)
}).$mount('#app')

Vue.use(SuiVue);
