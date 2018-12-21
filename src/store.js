import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase";
import router from "./router";
import { firestore } from "./firestore";

Vue.use(Vuex);

const state = {
  db: firestore,
  currentUser: null,
  currentUserId: null,
  photoUrl: null
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
          message: message,
          author: state.currentUser,
          author_id: state.currentUserId,
          photoUrl: state.photoUrl,
          createdAt: new Date()
        })
        .then(() => {})
        .catch(function(error) {
          console.error("Error adding message: ", error);
        });
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = (user && user.displayName) || null;
      state.currentUserId = (user && user.uid) || null;
      state.photoUrl = (user && user.photoURL) || null;
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
      var uid = firebase.auth().currentUser.uid;
      var userStatusFirestoreRef = state.db.collection("status").doc(uid);

      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("Signout successful");
          userStatusFirestoreRef
            .update({ state: "offline" })
            .then(function() {
              console.log("Status updated");
            })
            .catch(function(error) {
              console.error("Error updating status", error);
            });
          router.push("/login");
        })
        .catch(error => {
          // Handle Errors here.
          console.error(error);
        });
    }
  }
});
