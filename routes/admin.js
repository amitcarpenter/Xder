const express = require("express");
const authenticateAdmin = require("../middleware/auth");
const upload_profile = require("../middleware/upload_profile");
const upload_albums = require("../middleware/upload_albums");
const { uploadFile } = require("../middleware/multer");
const upload_group = require("../middleware/upload_group");


//================================= Controller Import ====================================
const authControllers = require("../controller/admin/authController");
const userControllers = require("../controller/admin/userController");
const reportControllers = require("../controller/admin/reportController");


const router = express.Router();

//================================= Auth ====================================
router.post("/register", authControllers.registerAdmin);
router.post("/login", authControllers.loginAdmin);
router.post("/forgot-password", authControllers.forgot_password);
router.get("/reset-password", authControllers.render_forgot_password_page);
router.post("/reset-password", authControllers.reset_password);
router.get("/success-reset", authControllers.render_success_reset);
router.get("/profile", authenticateAdmin, authControllers.getProfile);
router.post("/profile/update", authenticateAdmin, uploadFile, authControllers.updateProfile);
router.post("/change-password", authenticateAdmin, authControllers.changePassword);


//================================= Dashboard ====================================
router.get("/dashboard-data", authenticateAdmin, authControllers.dashboard_data);

//================================= User ====================================
router.get("/get-all-users", authenticateAdmin, userControllers.get_all_users);
router.get("/get-all-filtered-users", authenticateAdmin, userControllers.get_all_filtered_users);
router.post("/user-block-unblock", authenticateAdmin, userControllers.block_unblock_user);
router.delete("/delete-user", authenticateAdmin, userControllers.delete_user);

//================================= Report ====================================
router.get("/get-all-reports", authenticateAdmin, reportControllers.get_all_report);




module.exports = router;