const User = require("../models/User");
const cloudinary = require("../utils/cloudinary"); // ✅ Check file name (lowercase)

// =======================
// GET ALL USERS
// =======================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate("masjid"); // 👈 masjid include
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// ✅ GET MY PROFILE (with Masjid)
// =======================
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("masjid"); // 👈 masjid details populate
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to get profile", error: err.message });
    }
};

// =======================
// ✅ GET USER PROFILE (with Masjid)
// =======================
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("masjid"); // 👈 masjid details populate
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed", error: err.message });
    }
};

// =======================
// ✅ UPDATE PROFILE
// =======================
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, bio },
            { new: true }
        ).select("-password").populate("masjid");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to update profile", error: err.message });
    }
};

// =======================
// ✅ Upload Profile Image (Base64)
// =======================
exports.uploadProfileImage = async (req, res) => {
    try {
        const { base64 } = req.body;
        if (!base64) return res.status(400).json({ message: "No image provided" });

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64, {
            folder: 'profile_images',
        });

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: result.secure_url },
            { new: true }
        ).populate("masjid");

        res.json({ message: "Profile image updated", profileImage: user.profileImage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Image upload failed", error: err.message });
    }
};

// =======================
// ✅ Upload Cover Image (Base64)
// =======================
exports.uploadCoverImage = async (req, res) => {
    try {
        const { base64 } = req.body;
        if (!base64) return res.status(400).json({ message: "No image provided" });

        const result = await cloudinary.uploader.upload(base64, {
            folder: 'cover_images',
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { coverImage: result.secure_url },
            { new: true }
        ).populate("masjid");

        res.json({ message: "Cover image updated", coverImage: user.coverImage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Image upload failed", error: err.message });
    }
};

// =======================
// ✅ FOLLOW / UNFOLLOW USER
// =======================
exports.followUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        if (req.user.id === targetId)
            return res.status(400).json({ message: "Cannot follow yourself" });

        const user = await User.findById(req.user.id);
        const target = await User.findById(targetId);
        if (!target) return res.status(404).json({ message: "User not found" });

        const io = req.io;
        const onlineUsers = req.onlineUsers;

        if (target.followers.includes(user._id)) {
            // Unfollow
            target.followers.pull(user._id);
            user.following.pull(target._id);
            await target.save();
            await user.save();

            const targetSocketId = onlineUsers.get(targetId.toString());
            if (targetSocketId) {
                io.to(targetSocketId).emit("followUpdate", {
                    followersCount: target.followers.length,
                    action: "unfollow",
                    userId: user._id.toString(),
                });
            }

            return res.json({ message: "Unfollowed", followers: target.followers });
        } else {
            // Follow
            target.followers.push(user._id);
            user.following.push(target._id);
            await target.save();
            await user.save();

            const targetSocketId = onlineUsers.get(targetId.toString());
            if (targetSocketId) {
                io.to(targetSocketId).emit("followUpdate", {
                    followersCount: target.followers.length,
                    action: "follow",
                    userId: user._id.toString(),
                });

                io.to(targetSocketId).emit("receiveNotification", {
                    type: "follow",
                    data: {
                        from: user._id,
                        name: user.name,
                        profileImage: user.profileImage,
                    },
                });
            }

            return res.json({ message: "Followed", followers: target.followers });
        }
    } catch (err) {
        console.error("Error in followUser:", err);
        res.status(500).json({ message: "Follow/unfollow failed", error: err.message });
    }
};
