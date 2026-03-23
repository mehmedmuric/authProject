const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");

router.post("/SignUp", authController.signUp);
router.post("/SignIn", authController.signIn);
router.post("/SignOut", identifier, authController.signOut);


router.patch("/send-verification-code", identifier, authController.sendVerificationCode);
router.patch("/verify-verification-code", identifier, authController.verifyVerificationCode);
router.patch("/change-password", identifier, authController.changePassword);
router.patch("/send-forgot-password-code", authController.sendForgotPasswordCode);
router.patch("/verify-forgot-password-code",  authController.verifyForgotPasswordCode);




module.exports = router;