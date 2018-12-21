import firebase from "firebase";
import "firebase/firestore";

const {
  VUE_APP_API_KEY,
  VUE_APP_AUTH_DOMAIN,
  VUE_APP_DB_URL,
  VUE_APP_PROJECT_ID,
  VUE_APP_STORAGE_BUCKET,
  VUE_APP_MESSAGE_SENDER_ID
} = process.env;

// Initialize Firebase
var config = {
  apiKey: VUE_APP_API_KEY,
  authDomain: VUE_APP_AUTH_DOMAIN,
  databaseURL: VUE_APP_DB_URL,
  projectId: VUE_APP_PROJECT_ID,
  storageBucket: VUE_APP_STORAGE_BUCKET,
  messagingSenderId: VUE_APP_MESSAGE_SENDER_ID
};

firebase.initializeApp(config);
const firestore = firebase.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);

export { firestore };
