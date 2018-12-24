<template>
  <div class="chat">
    <div class="container">
      <div class="chat__main-container">
        <div class="chat__left-panel">
          <div class="chat__user-info">{{ currentUser }}</div>
          <div class="chat__users">
            <div class="chat__users--online">
              <h2 class="chat__users-status">Online</h2>
              <UserList :users="onlineUsers" />
            </div>
            <div class="chat__users--offline">
              <h2 class="chat__users-status">Offline</h2>
              <UserList :users="offlineUsers" />
            </div>
          </div>
        </div>
        <div class="chat__right-panel">
          <div class="chat__group">Public Chat Room</div>
          <div class="msg-container">
            <div
              class="msg-item-container"
              v-for="(message, index) in messages"
              :key="`message-${index}`"
            >
              <div v-if="shouldRenderDate(message)">{{ getDate(message) }}</div>
              <Message :message="message" />
            </div>
          </div>
          <MessageInput />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import firebase from "firebase";
import Message from "@/components/Message.vue";
import MessageInput from "@/components/MessageInput.vue";
import UserList from "@/components/UserList.vue";
import moment from "moment";

export default {
  name: "home",
  data() {
    return {
      msgDate: null,
      messages: [],
      allUsers: null
    };
  },
  components: {
    Message,
    MessageInput,
    UserList
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    },
    offlineUsers() {
      return this.allUsers && this.allUsers.filter(u => u.state === "offline");
    },
    onlineUsers() {
      return this.allUsers && this.allUsers.filter(u => u.state === "online");
    }
  },
  methods: {
    ...mapActions({
      setCurrentUser: "setCurrentUser"
    }),
    getDate(message) {
      return moment(message.createdAt.toDate()).calendar(null, {
        sameDay: "[Today]",
        lastDay: "[Yesterday]",
        sameElse: "MMM DD, YYYY"
      });
    },
    shouldRenderDate(message) {
      const date = this.getDate(message);
      if (!this.msgDate) {
        this.msgDate = date;
        return true;
      } else {
        if (this.msgDate === date) {
          return false;
        } else {
          this.msgDate = date;
          return true;
        }
      }
    },
    fetchMessages() {
      firebase
        .firestore()
        .collection("chat")
        .orderBy("createdAt")
        .onSnapshot(querySnapshot => {
          let allMessages = [];
          querySnapshot.forEach(doc => {
            allMessages.push(doc.data());
          });
          this.messages = allMessages;
        });
    },
    fetchUsers() {
      firebase
        .firestore()
        .collection("status")
        .orderBy("state", "desc")
        .onSnapshot(querySnapshot => {
          let allUsers = [];
          querySnapshot.forEach(doc => {
            allUsers.push(doc.data());
          });
          this.allUsers = allUsers;
        });
    },
    regUserDisconnectHandler() {
      // Fetch the current user's ID from Firebase Authentication.
      const uid = firebase.auth().currentUser.uid;

      // Create a reference to this user's specific status node.
      // This is where we will store data about being online/offline.
      const userStatusDatabaseRef = firebase.database().ref("/status/" + uid);
      const userStatusFirestoreRef = firebase.firestore().doc("/status/" + uid);
      const user = firebase.auth().currentUser.displayName;
      const userID = firebase.auth().currentUser.uid;
      const userAvatar = firebase.auth().currentUser.photoURL;
      // Firestore uses a different server timestamp value, so we'll
      // create two more constants for Firestore state.
      const isOfflineForFirestore = {
        state: "offline",
        user,
        user_id: userID,
        user_photoUrl: userAvatar,
        last_changed: firebase.firestore.FieldValue.serverTimestamp()
      };

      const isOnlineForFirestore = {
        state: "online",
        user,
        user_id: userID,
        user_photoUrl: userAvatar,
        last_changed: firebase.firestore.FieldValue.serverTimestamp()
      };
      // We'll create two constants which we will write to
      // the Realtime database when this device is offline
      // or online.
      const isOfflineForDatabase = {
        state: "offline",
        user,
        user_id: userID,
        user_photoUrl: userAvatar,
        last_changed: firebase.database.ServerValue.TIMESTAMP
      };

      const isOnlineForDatabase = {
        state: "online",
        user,
        user_id: userID,
        user_photoUrl: userAvatar,
        last_changed: firebase.database.ServerValue.TIMESTAMP
      };

      // Create a reference to the special '.info/connected' path in
      // Realtime Database. This path returns `true` when connected
      // and `false` when disconnected.
      firebase
        .database()
        .ref(".info/connected")
        .on("value", function(snapshot) {
          if (snapshot.val() == false) {
            // Instead of simply returning, we'll also set Firestore's state
            // to 'offline'. This ensures that our Firestore cache is aware
            // of the switch to 'offline.'
            userStatusFirestoreRef.set(isOfflineForFirestore);
            return;
          }
          userStatusDatabaseRef
            .onDisconnect()
            .set(isOfflineForDatabase)
            .then(function() {
              userStatusDatabaseRef.set(isOnlineForDatabase);

              // We'll also add Firestore set here for when we come online.
              userStatusFirestoreRef.set(isOnlineForFirestore);
            });
        });
    },
    regUserStatusChangeHandler() {
      firebase
        .firestore()
        .collection("status")
        .where("state", "==", "online")
        .onSnapshot(function(snapshot) {
          snapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
              console.log(change.doc.id + " is online");
            }
            if (change.type === "removed") {
              console.log(change.doc.id + " is offline");
            }
          });
        });
    },
    regAuthStatusChangeHandler() {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.setCurrentUser(user);
        } else {
          this.setCurrentUser(null);
        }
      });
    }
  },
  created() {
    this.regAuthStatusChangeHandler();
    this.regUserDisconnectHandler();
    this.regUserStatusChangeHandler();
    this.fetchUsers();
    this.fetchMessages();
  },
  updated() {
    // Scroll to bottom of message list whenever there's an update/render
    var targetNode = document.querySelector(".msg-container");
    targetNode.scrollTop = targetNode.scrollHeight;
  },
  // check authentication before hitting any routes
  beforeRouteEnter(to, from, next) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        next();
      } else {
        next({ path: "/login" });
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.chat__main-container {
  display: flex;
  height: 700px;
  box-shadow: 0px 1px 22px 1px rgba(51, 51, 51, 1);
}
.chat__left-panel {
  width: 30%;
  color: white;
  overflow-y: auto;
}
.chat__right-panel {
  width: 70%;
  background: $off-white;
  position: relative;

  .msg-container {
    overflow-y: auto;
    height: calc(100% - 140px);
    padding: 0 $gutter * 2 $gutter;
  }
  .msg-item-container {
    margin: 20px 0;
  }
  .msg--incoming {
  }
  .msg--outgoing {
    margin-left: auto;
  }

  .msg-input__container {
    display: flex;
    padding: 10px $gutter * 2;
  }
}
.chat__group {
  padding: $gutter $gutter * 2;
  background: $lightest-grey;
  font-size: 2rem;
}
.chat__users-status {
  font-weight: normal;
  font-size: 1.8rem;
}
.chat__user-info {
  background: black;
  padding: $gutter $gutter * 2;
  font-size: 2rem;
}
.chat__users {
  background: $darkest-grey;
  padding: $gutter $gutter * 2;
  height: 100%;
}
</style>
