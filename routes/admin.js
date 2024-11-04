const express = require("express");
const auth = require("../middleware/auth");
const upload_profile = require("../middleware/upload_profile");
const upload_albums = require("../middleware/upload_albums");
const upload_group = require("../middleware/upload_group");


//================================= Controller Import ====================================
const authControllers = require("../controller/admin/authController");


const router = express.Router();


router.post("/register", authControllers.registerAdmin);
router.post("/login", authControllers.loginAdmin);

module.exports = router;