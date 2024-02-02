const express = require("express");
const user = require("../controllers/userController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

//get
// router.route("/logout").get(user.logout);
//post
router.route("/register").post(user.register);
router.route("/login").post(user.login);
// router.route("/requestEmailToken").post(user.requestEmailToken);
// router.route("/verifyEmail").post(user.verifyEmail);
// router.route("/forgotPassword").post(user.forgotPassword);
//put
// router.route("/resetPassword").put(user.resetPassword);
// router.route("/updatePassword").put(isAuthenticated, user.updatePassword);

router.route("/wallet").post(isAuthenticated, user.createWallet);
router.route("/wallet").get(isAuthenticated, user.getWallet);

module.exports = router;
