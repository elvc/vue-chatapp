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
      <p class="msg--message">
        <span>{{ message.author }}</span
        ><span>{{ message.message }}</span>
      </p>
      <div class="time-date">{{ getMsgTime }}</div>
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
    flex: 1;
  }
  .time-date {
    font-size: 1.4rem;
  }
  .msg-details {
    flex: 8;
    display: flex;
    flex-direction: column;
  }
  .msg--message {
    margin: 0;
    position: relative;
    word-wrap: break-word;
    display: inline-blsock;
    span {
      display: block;
      &:first-child {
        padding: 4px $gutter;
        font-size: 1.3rem;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        font-weight: 400;
      }
      &:last-child {
        padding: 8px $gutter;
        font-size: 1.7rem;
        font-weight: normal;
      }
    }
    &:before {
      content: "";
      position: absolute;
      z-index: 2;
      bottom: 0px;
      height: 20px;
    }
    &:after {
      content: "";
      position: absolute;
      z-index: 3;
      bottom: 0px;
      width: 15px;
      height: 20px;
      background: $off-white;
    }
  }

  &--others {
    .msg-details {
      align-items: flex-start;
    }
    .time-date {
      margin-left: $gutter;
    }
    .msg--message {
      span {
        margin-left: $gutter;
        &:first-child {
          background: $lighter-grey;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }
        &:last-child {
          border-bottom-right-radius: 16px;
          background: $lightest-grey;
        }
      }
      &:before {
        left: 14px;
        border-left: 20px solid $lightest-grey;
        border-bottom-right-radius: 16px 14px;
      }
      &:after {
        left: 5px;
        border-bottom-right-radius: 10px;
      }
    }
  }
  &--self {
    position: relative;
    justify-content: flex-end;
    margin-left: auto;
    .avatar {
      order: 2;
    }
    .time-date {
      margin-right: $gutter;
    }
    .msg-details {
      align-items: flex-end;
    }
    .msg--message {
      span {
        margin-right: $gutter;
        color: white;
        &:first-child {
          background: darken($blue, 20%);
        }
        &:last-child {
          background: $blue;
          border-bottom-left-radius: 16px;
        }
      }
      &:before {
        right: 14px;
        border-right: 20px solid $blue;
        border-bottom-left-radius: 16px;
      }
      &:after {
        right: 5px;
        border-bottom-left-radius: 10px;
      }
    }
  }
}
</style>
