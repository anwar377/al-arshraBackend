const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
    try {
        const { text, parent } = req.body;
        const comment = await Comment.create({
            user: req.user.id,
            post: req.params.id,
            text,
            parent: parent || null,
        });
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: "Comment failed", error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id })
            .populate("user", "name profileImage")
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "Fetch comments failed", error: err.message });
    }
};
