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
      commit("ADD_MSG", payload);
    },
    setAuthor({ commit }, payload) {
      commit("SET_AUTHOR", payload);
    },
    setLoginUser({ commit }) {
      commit("SET_LOGIN_USER");
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
    SET_AUTHOR(state, { user }) {
      state.author = user.displayName;
    },
    SET_LOGIN_USER() {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(() => {
          this.$router.push("/");
        })
        .catch(error => {
          // Handle Errors here.
          console.error(error);
        });
    }
  }
});
