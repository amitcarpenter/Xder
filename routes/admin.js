const express = require("express");
const authenticateAdmin = require("../middleware/adminAuth");
const upload_profile = require("../middleware/upload_profile");
const upload_albums = require("../middleware/upload_albums");
const { uploadFile } = require("../middleware/multer");
const upload_group = require("../middleware/upload_group");


//================================= Controller Import ====================================
const authControllers = require("../controller/admin/authController");
const userControllers = require("../controller/admin/userController");
const reportControllers = require("../controller/admin/reportController");
const notificationControllers = require("../controller/admin/notificationController");
const subscriptionControllers = require("../controller/admin/subscriptionController");
const verificationControllers = require("../controller/admin/verificationController");


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
router.get("/get-all-reports", authenticateAdmin, reportControllers.get_all_report_user);
router.get("/get-all-group-reports", authenticateAdmin, reportControllers.get_all_group_reports);


//================================= Notification ====================================
router.post('/create-notification', authenticateAdmin, uploadFile, notificationControllers.createNotification);
router.get('/get-all-notifications', authenticateAdmin, notificationControllers.getAllNotifications);
router.get('/get-notification/:notification_id', authenticateAdmin, notificationControllers.getNotificationById);
router.put('/update-notification', authenticateAdmin, uploadFile, notificationControllers.updateNotification);
router.delete('/delete-notification/:notification_id', authenticateAdmin, notificationControllers.deleteNotification);


//================================= Subscription ====================================
router.get('/get-all-subscriptions', authenticateAdmin, subscriptionControllers.getAllSubscriptions);


//================================= Verifaction ====================================
router.get('/get-verification-data', authenticateAdmin, verificationControllers.getUsersWithVerificationImage);
router.post('/verify-user', authenticateAdmin, verificationControllers.verifyUser);


module.exports = router;