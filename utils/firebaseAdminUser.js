const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-config.json');

const userApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
},);

module.exports = userApp;
