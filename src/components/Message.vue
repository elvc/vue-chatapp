<template>
  <div :class="`msg ${getUserId === message.author_id ? 'msg--self' : ''}`">
    <div class="avatar">
      <img v-if="message.photoUrl" :src="message.photoUrl" alt="profile pic" />
      <div v-else class="avatar--initial">{{ initial }}</div>
    </div>
    <div class="msg-details">
      <p class="msg--message">{{ message.message }}</p>
      <span class="time_date"
        >{{ message.createdAt }} | {{ message.author }}</span
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "Message",
  props: {
    message: Object
  },
  computed: {
    getUserId() {
      return this.$store.state.currentUserId;
    },
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
.msg {
  display: flex;
  align-items: center;
  &--self {
    justify-content: flex-end;
  }
}

.msg-details {
  padding-left: 24px;
}
.msg--message {
}
.time-date {
}
</style>
