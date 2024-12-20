const mysql = require('mysql2');
const util = require('util');

var db_config = {
  host: '44.199.1.149',
  user: 'xder_dating',
  password: 'w9cTq4@A68Du',
  port: '3306',
  database: 'xdar_dating'
};

// var db_config = {
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   port: '3306',
//   database: 'xdar_dating'
// };

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config);
  connection.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("Connected to mysql Database!");
    }
  });

  connection.on('error', function (err) {
    console.log('Cannot be connect to Database due to', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}


function makeDb() {
  return {
    query(sql, args) {
      // console.log("db connected localhost");
      // console.log(sql);
      return util.promisify(connection.query).call(connection, sql, args);
    },
    close() {
      // console.log("db not connected to localhost");
      return util.promisify(connection.end).call(connection);
    }
  }
}

handleDisconnect();
const db = makeDb();
module.exports = db;
