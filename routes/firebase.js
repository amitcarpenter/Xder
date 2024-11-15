const express = require("express");
const authenticateAdmin = require("../middleware/adminAuth");



//================================= Controller Import ====================================
const firebaseControllers = require("../controller/admin/firebaseController");
const { uploadFile } = require("../middleware/multer");


const router = express.Router();




//================================= User ====================================
router.get("/get-all-firebase-users", authenticateAdmin, firebaseControllers.getAllFirebaseUsers);


//================================= Group ====================================
router.get("/get-all-firebase-groups", authenticateAdmin, firebaseControllers.getChatGroups);
router.post("/remove-user-from-group", authenticateAdmin, firebaseControllers.removeUserFromChatGroup);


module.exports = router;