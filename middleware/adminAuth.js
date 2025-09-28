module.exports = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        // ✅ Works with both conditions (role OR isAdmin)
        if (req.user.role !== "admin" && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
        }

        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        res.status(500).json({
            success: false,
            message: "Admin authentication failed",
        });
    }
};
