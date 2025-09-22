const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    uploadProfileImage,
    uploadCoverImage,
    getMyProfile,
    getUserProfile,
    updateProfile,
    followUser,
    getAllUsers,
} = require("../controllers/userController");

router.get("/getAll", auth, getAllUsers);
router.get("/me", auth, getMyProfile);
router.get("/:id", auth, getUserProfile);
router.put("/update", auth, updateProfile);

// ✅ Updated routes for Base64
router.put("/profile-image", auth, uploadProfileImage);
router.put("/cover-image", auth, uploadCoverImage);
router.put("/follow/:id", auth, followUser);

module.exports = router;
