<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <button v-if="loggedout === null">Login</button>
      <button v-else @click="logout">Logout</button>
    </div>
    <router-view />
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "app",
  computed: {
    loggedout: function() {
      return this.$store.state.currentUser;
    }
  },
  methods: {
    ...mapActions({
      logoutUser: "logoutUser"
    }),
    logout() {
      this.logoutUser();
    }
  }
};
</script>
<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700");

html {
  font-family: "Source Sans Pro", sans-serif;
  font-size: 62.5%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-weight: 300;
  line-height: $line-height;
}

body {
  box-sizing: border-box;
  font-size: 1.6rem;
  background: $lighter-grey;
}

img {
  max-width: 100%;
}

a {
  text-decoration: none;

  &:active,
  &:hover,
  &:visited {
    outline-width: 0;
    color: inherit;
  }
}
ul,
ol {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
