const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now },
});

const optionSchema = new mongoose.Schema({
    option: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    image: { type: String, default: "" }, // NEW: poll image support
    options: [optionSchema],
});

const postSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String },
        image: { type: String, default: "" },
        poll: pollSchema, // updated schema
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        comments: [commentSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
