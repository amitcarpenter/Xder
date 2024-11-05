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
router.post("/forgot-password", authControllers.forgot_password);
router.get("/reset-password", authControllers.render_forgot_password_page);
router.post("/reset-password", authControllers.reset_password);
router.get("/success-reset", authControllers.render_success_reset);

module.exports = router;