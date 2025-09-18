const express = require("express");
const router = express.Router();
const {
    getAllNotifications,
    markAsRead,
    deleteNotification,
} = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.get("/", auth, getAllNotifications);
router.patch("/:id/read", auth, markAsRead);
router.delete("/:id", auth, deleteNotification);

module.exports = router;
