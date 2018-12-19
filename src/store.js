import Vue from "vue";
import Vuex from "vuex";

import firebase from "firebase";
// Required for side-effects
import "firebase/firestore";

const {
  VUE_APP_API_KEY,
  VUE_APP_AUTH_DOMAIN,
  VUE_APP_DB_URL,
  VUE_APP_PROJECT_ID,
  VUE_APP_STORAGE_BUCKET,
  VUE_APP_MESSAGE_SENDER_ID
} = process.env;

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
Vue.use(Vuex);

const firestore = firebase.firestore();

const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

const state = {
  db: firestore,
  author: {}
};

export default new Vuex.Store({
  state,
  actions: {
    addMsg({ commit }, payload) {
      commit("addMsg", payload);
    },
    setUser({ commit }, payload) {
      commit("setUser", payload);
    }
  },
  mutations: {
    addMsg(state, payload) {
      const { message } = payload;
      console.log("message", message);
      state.db
        .collection("chat")
        .add({
          message,
          author: state.author,
          createdAt: new Date()
        })
        .then(() => {})
        .catch(function(error) {
          console.error("Error adding message: ", error);
        });
    },
    setUser(state, { user }) {
      state.author = user.displayName;
    }
  }
});
