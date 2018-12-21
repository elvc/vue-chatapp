import firebase from "firebase";
// Fetch the current user's ID from Firebase Authentication.
var uid = firebase.auth().currentUser.uid;

// Create a reference to this user's specific status node.
// This is where we will store data about being online/offline.
var userStatusDatabaseRef = firebase.database().ref("/status/" + uid);
var userStatusFirestoreRef = firebase.firestore().doc("/status/" + uid);

// Firestore uses a different server timestamp value, so we'll
// create two more constants for Firestore state.
var isOfflineForFirestore = {
  state: "offline",
  last_changed: firebase.firestore.FieldValue.serverTimestamp()
};

var isOnlineForFirestore = {
  state: "online",
  last_changed: firebase.firestore.FieldValue.serverTimestamp()
};
// We'll create two constants which we will write to
// the Realtime database when this device is offline
// or online.
var isOfflineForDatabase = {
  state: "offline",
  last_changed: firebase.database.ServerValue.TIMESTAMP
};

var isOnlineForDatabase = {
  state: "online",
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
