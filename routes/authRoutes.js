const express = require("express");
const router = express.Router();
const { getMe } = require("../controllers/authController");
const auth = require("../middleware/auth"); // ✅ Check path
const {
    register,
    login,
    sendOtp,
    verifyOtpAndResetPassword
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.post("/send-otp", sendOtp);
router.post("/reset-password", verifyOtpAndResetPassword);

module.exports = router;
