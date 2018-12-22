<template>
  <div class="msg-input__container">
    <input
      @keyup.enter="saveMessage"
      v-model="message"
      type="text"
      class="msg-input"
      placeholder="Type a message"
    />
    <button @click="saveMessage" class="msg-input__btn--send" type="button">
      <svg
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path
          fill="#000"
          fill-opacity=".45"
          d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "MessageInput",
  data() {
    return {
      message: null
    };
  },
  methods: {
    ...mapActions({
      addMessage: "addMsg"
    }),
    saveMessage() {
      if (this.message) {
        // const msgContainer = document.querySelector(".msg-container");
        // save to firestore
        this.addMessage({
          message: this.message
        });
        this.message = null;
        // msgContainer.scrollTop = msgContainer.scrollHeight;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.msg-input__container {
  background: $lightest-grey;
}
.msg-input {
  font-size: 1.5rem;
  padding: 6px 20px;
  border: none;
  width: 100%;
  border-radius: 40px;
}
.msg-input__btn--send {
  background: none;
  border: none;
  padding: 0;
  margin-left: $gutter;
  &:hover {
    border: none;
  }
}
</style>
