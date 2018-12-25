<template>
  <div style="text-align: center;">
    <h3>Please login with your Google account to continue</h3>
    <button @click="login">Login with Google</button>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "login",
  methods: {
    ...mapActions({
      loginUser: "loginUser"
    }),
    login() {
      this.loginUser();
    }
  }
};
</script>
