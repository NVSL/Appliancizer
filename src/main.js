import Vue from "vue";
import Vuetify from "vuetify";
import App from "./App.vue";
import router from "./router";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vuetify/dist/vuetify.css"; // Ensure you are using css-loader

// Global jquery setup
// window.$ = require('jquery')
// window.JQuery = require('jquery')
Vue.config.productionTip = false;
Vue.use(Vuetify, {
 iconfont: 'ma'
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");

// export default function (Vue, { head }) {
//   // Add an external CSS file
//   head.link.push({
//     rel: 'stylesheet',
//     href: 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons'
//   })
// }
