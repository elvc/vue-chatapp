<template>
  <div class="msg-input__container">
    <input
      @keyup.enter="saveMessage"
      v-model="message"
      type="text"
      class="msg-input"
      placeholder="Type a message"
    />
    <button
      @click="saveMessage"
      class="button msg-input__btn--send"
      type="button"
    >
      Send
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
      // save to firestore
      this.addMessage({
        message: this.message
      });
      this.message = null;
    }
  }
};
</script>

<style lang="scss" scoped>
.msg-input {
  font-size: 1.6rem;
  padding: 11px;
  border: none;
  width: 100%;
}
.msg-input__btn--send {
  font-size: 1.5rem;
  padding: 11px 20px;
  border: none;
  background: $green;
  color: white;
}
</style>
