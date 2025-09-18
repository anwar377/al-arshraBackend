const Notification = require("../models/Notification");

// 🔘 GET all notifications for logged-in user
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ to: req.user.id })
            .populate("from", "name profileImage")
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// 🟢 Mark as Read
exports.markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ message: "Notification not found" });

        notif.isRead = true;
        await notif.save();

        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Failed to mark as read" });
    }
};

// ❌ DELETE notification
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete notification" });
    }
};

// 🛠 Helper to Create a Notification (used in other controllers)
exports.createNotification = async (type, from, to, postId = null) => {
    try {
        if (from.toString() === to.toString()) return; // no self-notify

        await Notification.create({ type, from, to, postId });
    } catch (err) {
        console.error("Notification create error:", err.message);
    }
};
