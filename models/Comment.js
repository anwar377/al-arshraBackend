const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
