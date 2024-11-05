const express = require("express");
const authenticateAdmin = require("../middleware/auth");



//================================= Controller Import ====================================
const firebaseControllers = require("../controller/admin/firebaseController");
const { uploadFile } = require("../middleware/multer");


const router = express.Router();




//================================= User ====================================
router.get("/get-all-firebase-users", authenticateAdmin, firebaseControllers.getAllFirebaseUsers);


//================================= Group ====================================
router.get("/get-all-firebase-groups", authenticateAdmin, firebaseControllers.getChatGroups);


module.exports = router;