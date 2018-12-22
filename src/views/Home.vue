<template>
  <div class="chat">
    <div class="container">
      <div class="chat__main-container">
        <div class="chat__left-panel">
          <h2>List of Users</h2>
          <UserList :users="users" />
        </div>
        <div class="chat__right-panel">
          <div class="chat__group">Public Chat Room</div>
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
import UserList from "@/components/UserList.vue";

export default {
  name: "home",
  data() {
    return {
      messages: [],
      date: null,
      users: null
    };
  },
  components: {
    Message,
    MessageInput,
    UserList
  },
  methods: {
    ...mapActions({
      setCurrentUser: "setCurrentUser"
    }),
    fetchMessages() {
      firebase
        .firestore()
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
          this.users = allUsers;
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
    // Select the node that will be observed for mutations
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
  background: $darkest-grey;
  color: white;
  overflow-y: auto;
  padding: $gutter * 2;
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
  font-weight: bold;
  font-size: 2rem;
}
.user-list {
  display: flex;
}
</style>
