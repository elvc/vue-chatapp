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
            <div v-for="(message, index) in messages" :key="`message-${index}`">
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
import dateFns from "date-fns";
import Message from "@/components/Message.vue";
import MessageInput from "@/components/MessageInput.vue";

export default {
  name: "home",
  data() {
    return {
      messages: [],
      date: null
    };
  },
  components: {
    Message,
    MessageInput
  },
  methods: {
    ...mapActions({
      setCurrentUser: "setCurrentUser"
    }),
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
    },
    regUserDisconnectHandler() {
      // Fetch the current user's ID from Firebase Authentication.
      const uid = firebase.auth().currentUser.uid;

      // Create a reference to this user's specific status node.
      // This is where we will store data about being online/offline.
      const userStatusDatabaseRef = firebase.database().ref("/status/" + uid);
      const userStatusFirestoreRef = firebase.firestore().doc("/status/" + uid);
      const user = firebase.auth().currentUser.displayName;

      // Firestore uses a different server timestamp value, so we'll
      // create two more constants for Firestore state.
      const isOfflineForFirestore = {
        state: "offline",
        user,
        last_changed: firebase.firestore.FieldValue.serverTimestamp()
      };

      const isOnlineForFirestore = {
        state: "online",
        user,
        last_changed: firebase.firestore.FieldValue.serverTimestamp()
      };
      // We'll create two constants which we will write to
      // the Realtime database when this device is offline
      // or online.
      const isOfflineForDatabase = {
        state: "offline",
        user,
        last_changed: firebase.database.ServerValue.TIMESTAMP
      };

      const isOnlineForDatabase = {
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

  .msg--incoming {
  }
  .msg--outgoing {
    margin-left: auto;
  }

  .msg-input__container {
    display: flex;
    position: absolute;
    bottom: 0;
    height: $msg-input-height;
    width: 100%;
  }
}
</style>
