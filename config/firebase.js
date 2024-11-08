
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");


const firebaseConfig = {
  apiKey: "AIzaSyDd9TeB-KC-TGVY5Tqjbe-kIPXMJn255KU",
  authDomain: "xder-app.firebaseapp.com",
  projectId: "xder-app",
  storageBucket: "xder-app.appspot.com",
  messagingSenderId: "777406985331",
  appId: "1:777406985331:web:8bf647c13ca6ed50fee606",
  measurementId: "G-6G7QR14YGW",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db_firebase = getFirestore(app);
const storage = getStorage(app);
const db = getFirestore(app);

module.exports = { app, auth, db, storage, db_firebase };

console.log("Firebase Connected");

