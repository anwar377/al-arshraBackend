const User = require('../models/User');
const Post = require('../models/Post');

// ---------------- USERS ----------------

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to get users' });
    }
};

// Toggle ban/unban user (returns updated user)
exports.toggleBanUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({
            message: `User ${user.isBanned ? "banned" : "unbanned"}`,
            user, // send updated user
        });
    } catch (err) {
        res.status(500).json({ error: err.message || "Failed to update user status" });
    }
};

// Delete user and related data (returns deleted user ID)
exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Remove related posts
        await Post.deleteMany({ user: user._id });

        // Remove user from followers/following of other users
        await User.updateMany({ following: user._id }, { $pull: { following: user._id } });
        await User.updateMany({ followers: user._id }, { $pull: { followers: user._id } });

        res.status(200).json({
            message: "User and related data deleted",
            userId: user._id,
        });
    } catch (err) {
        res.status(500).json({ error: err.message || "Failed to delete user" });
    }
};

// ---------------- POSTS ----------------

// Get all posts (admin only)
exports.getAllPosts = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const posts = await Post.find().populate("user", "name email");
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message || "Failed to get posts" });
    }
};

// Delete post (returns deleted post ID)
exports.deletePost = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        res.status(200).json({
            message: "Post deleted",
            postId: post._id,
        });
    } catch (err) {
        res.status(500).json({ error: err.message || "Failed to delete post" });
    }
};
