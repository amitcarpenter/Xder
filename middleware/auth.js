const jwt = require("jsonwebtoken");
const { fetchUserById } = require('../models/users')
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
      const verifyUser = jwt.verify(req.token, 'SecretKey');
      const userdata = verifyUser.data.id
      console.log(verifyUser, "user verify");

      const user = await fetchUserById({ id: verifyUser.data.id });

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
      Error:err
    });
  }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        if (!authorizationHeader) {
            return handleError(res, 401, "Unauthorized: No token provided");
        }
        const tokenParts = authorizationHeader.split(' ');
        if (tokenParts[0] !== 'Bearer' || tokenParts[1] === 'null' || !tokenParts[1]) {
            return handleError(res, 401, "Unauthorized: Invalid or missing token");
        }
        const token = tokenParts[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return handleError(res, 401, "Unauthorized: Invalid token");
        }
        const [admin] = await db.query(`SELECT * FROM tbl_admin WHERE id = ${decodedToken.id}`);
        console.log(admin)
        if (!admin) {
            return handleError(res, 404, "Admin Not Found");
        }
        req.admin = admin;
        console.log(decodedToken.email, "Admin Connected");
        next();
    } catch (error) {
        console.error("Error in authenticateAdmin middleware:", error);
        return handleError(res, 500, error.message);
    }
};



module.exports = auth;
module.exports = authenticateAdmin;