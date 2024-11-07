const express = require("express");
const subscriptionController = require("../controller/api/subscriptionController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/Allsubscription", auth, subscriptionController.Allsubscription);

router.post("/AddsubscriptionPlan", auth, subscriptionController.AddsubscriptionPlan);

router.post("/ChecksubscriptionUser", auth, subscriptionController.ChecksubscriptionUser);

router.post("/subscription_history", auth, subscriptionController.subscription_history);

router.post("/activatePlan", auth, subscriptionController.activatePlan);


module.exports = router;