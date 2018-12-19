import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase";
import router from "./router";
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
  currentUser: null
};

export default new Vuex.Store({
  state,
  actions: {
    addMsg({ commit }, payload) {
      commit("ADD_MSG", payload);
    },
    setCurrentUser({ commit }, payload) {
      commit("SET_CURRENT_USER", payload);
    },
    loginUser({ commit }) {
      commit("LOGIN_USER");
    },
    logoutUser({ commit }) {
      commit("LOGOUT_USER");
    }
  },
  mutations: {
    ADD_MSG(state, payload) {
      const { message } = payload;
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
    SET_CURRENT_USER(state, user) {
      state.currentUser = (user && user.displayName) || null;
    },
    LOGIN_USER() {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(() => {
          router.push("/");
        })
        .catch(error => {
          // Handle Errors here.
          console.error(error);
        });
    },
    LOGOUT_USER() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          router.push("/login");
        })
        .catch(error => {
          // Handle Errors here.
          console.error(error);
        });
    }
  }
});
