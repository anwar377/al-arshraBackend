const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        bio: { type: String, default: "" },
        profileImage: { type: String, default: "" },
        coverImage: { type: String, default: "" },

        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        masjid: { type: mongoose.Schema.Types.ObjectId, ref: "Masjid" },

        isVerified: { type: Boolean, default: false },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isBanned: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
