import Secrets from 'react-native-config';

import firebase from 'firebase';

console.log(Secrets.FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: Secrets.FIREBASE_API_KEY,
  authDomain: Secrets.FIREBASE_AUTH_DOMAIN,
  databaseURL: Secrets.FIREBASE_DATA_BASE_URL,
  projectId: Secrets.FIREBASE_PROJECT_ID,
  storageBucket: Secrets.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Secrets.FIREBASE_MESSAGING_SENDER_ID,
  appId: Secrets.FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const firebaseDatabase = firebase.database().ref();
export default firebaseDatabase;
