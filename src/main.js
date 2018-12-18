import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebase from "firebase";

// Required for side-effects
require("firebase/firestore");

const {
  VUE_APP_API_KEY,
  VUE_APP_AUTH_DOMAIN,
  VUE_APP_DB_URL,
  VUE_APP_PROJECT_ID,
  VUE_APP_STORAGE_BUCKET,
  VUE_APP_MESSAGE_SENDER_ID
} = process.env;

console.log(process.env);
// Initialize Firebase
var config = {
  apiKey: VUE_APP_API_KEY,
  authDomain: VUE_APP_AUTH_DOMAIN,
  databaseURL: VUE_APP_DB_URL,
  projectId: VUE_APP_PROJECT_ID,
  storageBucket: VUE_APP_STORAGE_BUCKET,
  messagingSenderId: VUE_APP_MESSAGE_SENDER_ID
};
firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

window.db = db;
// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
