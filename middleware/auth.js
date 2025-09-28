const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB so role & isAdmin are always fresh
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user; // ✅ role & isAdmin included
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};

module.exports = auth;
