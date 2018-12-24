<template>
  <div
    :class="
      `msg ${getUserId === message.author_id ? 'msg--self' : 'msg--others'}`
    "
  >
    <div class="avatar">
      <img v-if="message.photoUrl" :src="message.photoUrl" alt="profile pic" />
      <div v-else class="avatar--initial">{{ initial }}</div>
    </div>
    <div class="msg-details">
      <p class="msg--message">{{ message.message }}</p>
      <div class="time_date">{{ getMsgTime }} | {{ message.author }}</div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

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
    },
    getMsgTime() {
      return moment(this.message.createdAt.toDate()).format("h:mm a");
    }
  }
};
</script>

<style lang="scss" scoped>
.msg {
  display: flex;
  align-items: center;
  width: 50%;
  .avatar {
    img {
      display: block;
    }
  }
  &--self {
    position: relative;
    justify-content: flex-end;
    margin-left: auto;
    .avatar {
      order: 2;
    }
  }
}

.msg--message {
  position: relative;
  padding: $gutter/2 $gutter;
  border-radius: 20px;
  word-wrap: break-word;

  .msg--others & {
    margin-left: $gutter;
    background: $lighter-grey;
    &:before {
      content: "";
      position: absolute;
      z-index: 2;
      bottom: 0px;
      left: -7px;
      height: 20px;
      border-left: 20px solid $lighter-grey;
      border-bottom-right-radius: 16px 14px;
    }
    &:after {
      content: "";
      position: absolute;
      z-index: 3;
      bottom: 0px;
      left: -15px;
      width: 15px;
      height: 20px;
      background: $off-white;
      border-bottom-right-radius: 10px;
    }
  }
  .msg--self & {
    margin-right: $gutter;
    background: $blue;
    color: white;
    &:before {
      content: "";
      position: absolute;
      z-index: 1;
      bottom: 0px;
      right: -7px;
      height: 20px;
      border-right: 20px solid $blue;
      border-bottom-left-radius: 16px 14px;
    }
    &:after {
      content: "";
      position: absolute;
      z-index: 2;
      bottom: 0px;
      right: -15px;
      width: 15px;
      height: 20px;
      background: $off-white;
      border-bottom-left-radius: 10px;
    }
  }
}

.msg--message {
  margin: 0;
}
.time-date {
}
</style>
