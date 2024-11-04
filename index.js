const cors = require("cors");
const http = require("http");
const cron = require('node-cron')
const express = require("express");
const user = require("./routes/users");
const bodyParser = require("body-parser");
const moment = require('moment-timezone');
const admin_router = require("./routes/admin");
const subscription = require("./routes/subscription")
const { deleteAllNotificationsProfileVisits, deleteAllProfileVisits } = require("./models/users");

require("dotenv").config()

const app = express();


app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.use(bodyParser.json());

app.use("/", user);
app.use("/admin", admin_router);
app.use("/", subscription);

// cron.schedule('*/5 * * * * *', async () => {
//   const timeZone = 'GMT'
//   const currentDate = moment.tz(timeZone);
//   const twentyFourHoursBefore = moment(currentDate).subtract(7, 'days');
//   const formattedCurrentDate = currentDate.format('YYYY-MM-DD HH:mm:ss');
//   const formattedtwentyFourHoursBefore = twentyFourHoursBefore.format('YYYY-MM-DD HH:mm:ss');
//   await deleteAllNotificationsProfileVisits(formattedtwentyFourHoursBefore);
//   await deleteAllProfileVisits(formattedtwentyFourHoursBefore)
// });

// app.get("/", (req, res) => {

//   res.setHeader("Access-Control-Allow-Origin", "*", "http://44.199.1.149:4000", {
//     reconnect: true,
//   });

//   res.header("Access-Control-Allow-Credentials", true);
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Type,Accept, X-Custom-Header,Authorization"
//   );

//   res.setHeader("Content-Type", "text/plain");

//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   } else {
//     return res.send({ success: "0", message: "Hello World" });
//   }
// });

app.get("/", (req, res) => {
  return res.send("Hello World AMIT WORKING");
});

let PORT = process.env.PORT
app.listen(PORT, function () {
  console.log(`server is working on ${process.env.APP_URL} `);
});


module.exports = app;
