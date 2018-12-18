<template>
  <div>
    <h3>Please login with your Google account to continue</h3>
    <button @click="login">Login with Google</button>
  </div>
</template>

<script>
import firebase from "firebase";
export default {
  name: "login",
  methods: {
    login() {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/contacts.readonly");

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          this.$router.push("/");
        })
        .catch(error => {
          // Handle Errors here.
          console.error(error);
        });
    }
  }
};
</script>