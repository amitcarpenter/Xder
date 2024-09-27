const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-config.json');

// Initialize Firebase app with the name 'user'
const userApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
},);

module.exports = userApp;
