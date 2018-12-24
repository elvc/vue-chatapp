<template>
  <ul class="user-list">
    <li
      class="user__list-item"
      v-for="(user, index) in users"
      :key="`user-${index}`"
    >
      <div class="avatar">
        <img
          v-if="user.user_photoUrl"
          :src="user.user_photoUrl"
          alt="profile pic"
          :class="user.state === 'online' ? 'online' : 'offline'"
        />
        <div v-else class="avatar--initial">{{ initial }}</div>
      </div>
      <div class="user__name">{{ user.user }}</div>
    </li>
  </ul>
</template>

<script>
export default {
  name: "UserList",
  props: {
    users: Array
  },
  computed: {
    initial() {
      // Initials of the user name
      const str = this.$store.state.currentUser;
      var matches = str.match(/\b(\w)/g);
      return matches.join("");
    }
  }
};
</script>

<style lang="scss" scoped>
.avatar {
  img {
    width: 30px;
    padding: 3px;
    display: block;
  }
  img,
  div {
    margin: 4px;
  }
}
.online {
  border: 3px solid $green;
}
.offline {
  border: 3px solid $grey;
}
.user__list-item {
  display: flex;
  align-items: center;
}
.user__name {
  margin-left: 10px;
}
</style>
