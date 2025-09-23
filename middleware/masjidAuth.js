const jwt = require("jsonwebtoken");
const User = require("../models/User");

const masjidAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ success: false, message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ success: false, message: "User not found" });

        req.user = user; // ✅ Attach user
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ success: false, message: "User not authenticated" });
    }
};

module.exports = masjidAuth;
