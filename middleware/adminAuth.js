const jwt = require("jsonwebtoken");
const { fetchUserById } = require('../models/users')
const { handleError } = require('../utils/responseHandler');
const db = require('../utils/database');

require("dotenv").config();



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
        if (!admin) {
            return handleError(res, 404, "Admin Not Found");
        }
        console.log('admin action')
        req.admin = admin;
        next();
    } catch (error) {
        console.error("Error in authenticateAdmin middleware:", error);
        return handleError(res, 500, error.message);
    }
};


module.exports = authenticateAdmin;