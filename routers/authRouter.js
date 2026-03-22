const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/SignUp", authController.signUp);
router.post("/SignIn", authController.signIn);




module.exports = router;