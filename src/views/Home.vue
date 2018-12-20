<template>
  <div class="chat">
    <div class="container">
      <h1 class="app-heading">Messaging</h1>
      <div class="chat__main-container">
        <div class="chat__left-panel">
          <ul class="chat__list">
            <li class="chat__list-item">
              <div class="chat_details">
                <h5>User Group</h5>
                <p>
                  Test, which is a new approach to have all solutions astrology
                  under one roof.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div class="chat__right-panel">
          <div class="msg-container">
            <div
              v-for="(message, index) in messages"
              :key="`message-${index}`"
              :class="
                `msg ${getUserId === message.author_id ? 'msg--self' : ''}`
              "
            >
              <div class="msg-avatar">
                <img
                  v-if="message.photoUrl"
                  :src="message.photoUrl"
                  alt="profile pic"
                />
                <div v-else class="msg-avatar--initial">{{ initial }}</div>
              </div>
              <div class="msg-details">
                <p class="msg--message">{{ message.message }}</p>
                <span class="time_date"
                  >{{ message.createdAt }} | {{ message.author }}</span
                >
              </div>
            </div>
          </div>
          <div class="msg-input__container">
            <input
              @keyup.enter="saveMessage"
              v-model="message"
              type="text"
              class="msg-input__input"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import firebase from "firebase";
import dateFns from "date-fns";

export default {
  name: "home",
  data() {
    return {
      message: null,
      messages: [],
      date: null
    };
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
  },
  methods: {
    ...mapActions({
      addMessage: "addMsg",
      setCurrentUser: "setCurrentUser"
    }),
    saveMessage() {
      // save to firestore
      this.addMessage({
        message: this.message
      });
      this.message = null;
    },
    fetchMessages() {
      this.$store.state.db
        .collection("chat")
        .orderBy("createdAt")
        .onSnapshot(querySnapshot => {
          let allMessages = [];
          querySnapshot.forEach(doc => {
            const data = doc.data();
            data.createdAt = dateFns.format(
              doc.data().createdAt.toDate(),
              "MM/DD, HH:mm"
            );
            allMessages.push(data);
          });
          this.messages = allMessages;
        });
    }
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setCurrentUser(user);
      } else {
        this.setCurrentUser(null);
      }
    });
    // Fetch the current user's ID from Firebase Authentication.
    var uid = firebase.auth().currentUser.uid;

    // Create a reference to this user's specific status node.
    // This is where we will store data about being online/offline.
    var userStatusDatabaseRef = firebase.database().ref("/status/" + uid);
    var userStatusFirestoreRef = firebase.firestore().doc("/status/" + uid);
    const user = firebase.auth().currentUser.displayName;

    // Firestore uses a different server timestamp value, so we'll
    // create two more constants for Firestore state.
    var isOfflineForFirestore = {
      state: "offline",
      user,
      last_changed: firebase.firestore.FieldValue.serverTimestamp()
    };

    var isOnlineForFirestore = {
      state: "online",
      user,
      last_changed: firebase.firestore.FieldValue.serverTimestamp()
    };
    // We'll create two constants which we will write to
    // the Realtime database when this device is offline
    // or online.
    var isOfflineForDatabase = {
      state: "offline",
      user,
      last_changed: firebase.database.ServerValue.TIMESTAMP
    };

    var isOnlineForDatabase = {
      state: "online",
      user,
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
    this.fetchMessages();
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
$msg-input-height: 40px;

.app-heading {
  text-align: center;
}
.chat__main-container {
  display: flex;
  height: 65vh;
}
.chat__left-panel {
  width: 35%;
  background: $grey;
  color: white;
  overflow-y: auto;
}
.chat__right-panel {
  width: 65%;
  background: $lightest-grey;
  position: relative;

  .msg-container {
    overflow-y: auto;
    height: calc(100% - #{$msg-input-height} - #{$gutter} * 4);
    padding: $gutter * 2;
  }
  .msg {
    display: flex;
    align-items: center;
    &--self {
      justify-content: flex-end;
    }
  }
  .msg-avatar {
    img {
      width: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
  }
  .msg-avatar--initial {
    color: white;
    font-weight: 400;
    font-size: 22px;
    background: $grey;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    line-height: 40px;
    text-align: center;
  }
  .msg-details {
    padding-left: 24px;
  }
  .msg--incoming {
  }
  .msg--outgoing {
    margin-left: auto;
  }
  .msg--message {
  }
  .time-date {
  }
  .msg-input__container {
    display: flex;
    position: absolute;
    bottom: 0;
    height: $msg-input-height;
    width: 100%;
  }
  .msg-input__input {
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
}
</style>
