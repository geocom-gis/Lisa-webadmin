import "babel-polyfill";
import Vue from "vue";
import "./plugins/vuetify";
import App from "./app";
// index.js or main.js
import "vuetify/dist/vuetify.min.css"; // Ensure you are using css-loader
// Helpers

Vue.config.productionTip = false;

var appContainer = document.getElementById("app");
var webmapId = appContainer.getAttribute("data-webmap-id");
var clientId = appContainer.getAttribute("data-client-id");
var domain = appContainer.getAttribute("data-domain");
var config = appContainer.getAttribute("data-config") || "";
try {
  config = JSON.parse(config);
} catch (error) {
  console.error("Invalid json configuration:", error);
}

if (!webmapId || !clientId) {
  alert("Please configure a valid webmapId and clientId!");
} else {
  window.$vueApp = new Vue({
    data: {
      webmapId: webmapId,
      clientId: clientId,
      domain: domain,
      config: config
    },
    render: h => h(App)
  }).$mount("#app");
}
