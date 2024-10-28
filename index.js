const express = require("express");
const bodyParser = require("body-parser");
const user = require("./routes/users");
const subscription = require("./routes/subscription")
const cron = require('node-cron')
const app = express();
const moment = require('moment-timezone');
const cors = require("cors");
const http = require("http");
const { deleteAllNotificationsProfileVisits, deleteAllProfileVisits } = require("./models/users");

app.use(cors());
// app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.use(bodyParser.json());

app.use("/", user);

app.use("/", subscription);

cron.schedule('*/5 * * * * *', async () => {

  // Define the custom time zone (e.g., 'Asia/Kolkata' for IST)
  const timeZone = 'GMT'

  // // Get the current date and time in the custom time zone
  const currentDate = moment.tz(timeZone);

  const twentyFourHoursBefore = moment(currentDate).subtract(7, 'days');

  // const tenMinutesBefore = moment(currentDate).subtract(1, 'days');

  // Format the current date in 'YYYY-MM-DD HH:mm:ss' format
  const formattedCurrentDate = currentDate.format('YYYY-MM-DD HH:mm:ss');

  // Format the date 10 minutes ago in 'YYYY-MM-DD HH:mm:ss' format
  const formattedtwentyFourHoursBefore = twentyFourHoursBefore.format('YYYY-MM-DD HH:mm:ss');


  // const formattedTenMinutesAgo = tenMinutesBefore.format('YYYY-MM-DD HH:mm:ss');
  await deleteAllNotificationsProfileVisits(formattedtwentyFourHoursBefore);
  await deleteAllProfileVisits(formattedtwentyFourHoursBefore)

  // console.log('Current Date:', formattedCurrentDate);
  // console.log('Ten Minutes Ago:', formattedtwentyFourHoursBefore);

  //await updateBookingStatusIfTimePassed(formattedTenMinutesAgo);

});

app.get("/", (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*", "http://44.199.1.149:4000", {
    reconnect: true,
  });

  res.header("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Accept, X-Custom-Header,Authorization"
  );

  res.setHeader("Content-Type", "text/plain");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  } else {
    return res.send({ success: "0", message: "Hello World" });
  }
});


app.listen(4000, function () {
  console.log("Node app is running on port 4000");
});


module.exports = app;
