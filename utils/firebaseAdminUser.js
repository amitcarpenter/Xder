// const admin = require('firebase-admin');
// const serviceAccount = require('../config/firebase-config.json');

// const userApp = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// },);

// module.exports = userApp;


const admin = require('firebase-admin');
const path = require('path');

let userApp;
try {
  const serviceAccountPath = path.join(__dirname, '../config/firebase-config.json');
  const serviceAccount = require(serviceAccountPath);
  userApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Make sure the firebase-config.json file exists at the specified path.');
  } else if (error.name === 'FirebaseAppError') {
    console.error('Firebase configuration issue:', error);
  } else {
    console.error('An unexpected error occurred:', error);
  }
  process.exit(1);
}
module.exports = userApp;
