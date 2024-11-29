const jwt = require("jsonwebtoken");
const { fetchUserById, get_user_data_by_id } = require('../models/users')
const { handleError } = require('../utils/responseHandler');
const db = require('../utils/database');

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== undefined) {
      const bearer = bearerHeader.split(" ");
      req.token = bearer[1];
      const verifyUser = jwt.verify(req.token, JWT_SECRET);
      const userdata = verifyUser.data.id
      console.log(verifyUser, "user verify");
      const [user] = await get_user_data_by_id(verifyUser.data.id);

      if (!user) return handleError(res, 404, "User Not Found");

      if (user.is_blocked == 1) {
        return res.json({
          message: "You are Blocked By Admin",
          status: 401,
          success: false
        });
      }

      if (user !== null) {
        next();
      }
      else {
        return res.json({
          message: "Access Forbidden",
          status: 401,
          success: "0",
        });
      }
    }
    else {
      return res.json({
        message: "Token Not Provided",
        status: 400,
        success: "0",
      });
    }
  }
  catch (err) {
    console.log(err);
    return res.json({
      message: "Access forbidden",
      status: 401,
      success: "0",
      Error: err
    });
  }
};

module.exports = auth;
