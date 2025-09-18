const fs = require("fs");
const Post = require("../models/Post");
const cloudinary = require("../utils/cloudinary");
const { createNotification } = require("./notificationController");

// --------------------- Helper Functions --------------------- //

// Delete local file after upload
const deleteLocalFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
    });
};

// Emit notification helper
const emitNotification = async (io, type, fromUser, toUserId, postId) => {
    await createNotification(type, fromUser._id, toUserId, postId);
    io.to(toUserId).emit("receiveNotification", {
        type,
        data: {
            postId,
            from: fromUser._id,
            name: fromUser.name,
            profileImage: fromUser.profileImage || null,
        },
    });
};

// --------------------- Post Controllers --------------------- //

// CREATE POST

exports.createPost = async (req, res) => {
    try {
        const { text, isPoll, poll, image } = req.body;

        let mainImageUrl = '';
        let pollImageUrl = '';

        // Upload main image to Cloudinary
        if (image) {
            const uploaded = await cloudinary.uploader.upload(image, { folder: 'posts' });
            mainImageUrl = uploaded.secure_url;
        }

        // Upload poll image if exists
        if (isPoll && poll?.image) {
            const uploadedPoll = await cloudinary.uploader.upload(poll.image, { folder: 'polls' });
            pollImageUrl = uploadedPoll.secure_url;
        }

        const postData = {
            user: req.user.id,
            text: text || '',
            image: mainImageUrl
        };

        if (isPoll && poll) {
            postData.poll = {
                question: poll.question,
                image: pollImageUrl,
                options: poll.options.map(opt => ({ option: opt }))
            };
        }

        const post = await Post.create(postData);
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Post creation failed', error: err.message });
    }
};



// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 })
            .lean();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch posts", error: err.message });
    }
};

// GET MY POSTS
exports.getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.id })
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 })
            .lean();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch posts", error: err.message });
    }
};

// GET POSTS BY USER ID
exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 })
            .lean();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user posts", error: err.message });
    }
};

// EDIT POST
exports.editPost = async (req, res) => {
    try {
        const { text, poll } = req.body;
        let imageUrl;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
            deleteLocalFile(req.file.path);
        }

        const updateData = { text };
        if (poll) updateData.poll = JSON.parse(poll);
        if (imageUrl) updateData.image = imageUrl;

        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            updateData,
            { new: true }
        );

        if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Post update failed", error: err.message });
    }
};

// DELETE POST
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });

        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete post", error: err.message });
    }
};

// TOGGLE LIKE
exports.toggleLike = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user.id;
        const io = req.io;

        const post = await Post.findById(postId).populate("user", "_id name profileImage");
        if (!post) return res.status(404).json({ message: "Post not found" });

        const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

        if (alreadyLiked) {
            post.likes.pull(userId);
            await post.save();

            io.to(postId.toString()).emit("likeUpdated", {
                postId,
                likes: post.likes.map(id => id.toString()), // send full likes array
                liked: false,
            });

            return res.json({
                liked: false,
                likes: post.likes.map(id => id.toString()), // send full likes array
                message: "Post unliked",
            });
        }

        post.likes.push(userId);
        await post.save();

        if (post.user._id.toString() !== userId) {
            await emitNotification(io, "like", req.user, post.user._id, post._id);
        }

        io.to(postId.toString()).emit("likeUpdated", {
            postId,
            likes: post.likes.map(id => id.toString()), // send full likes array
            liked: true,
        });

        return res.json({
            liked: true,
            likes: post.likes.map(id => id.toString()), // send full likes array
            message: "Post liked",
        });
    } catch (err) {
        res.status(500).json({ message: "Like/unlike failed", error: err.message });
    }
};


// ADD COMMENT
exports.addComment = async (req, res) => {
    try {
        const { postId, text } = req.body;

        console.log(req.body)

        if (!text) return res.status(400).json({ message: "Comment text required" });

        // Check user (auth middleware must add req.user)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Push new comment
        post.comments.push({ user: req.user.id, text });
        await post.save();

        // Re-populate latest comment
        await post.populate("comments.user", "name profileImage");
        const newComment = post.comments[post.comments.length - 1];

        // Emit comment in real-time
        req.io.to(postId.toString()).emit("newComment", newComment);

        res.status(201).json(newComment);
    } catch (err) {
        console.error("Add Comment Error:", err);
        res.status(500).json({ message: "Failed to add comment", error: err.message });
    }
};


// GET COMMENTS OF A POST
exports.getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId)
            .populate("comments.user", "name profileImage")
            .populate("comments.replies.user", "name profileImage")
            .lean();

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.json(post.comments);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch comments", error: err.message });
    }
};


// ADD REPLY
exports.addReply = async (req, res) => {
    try {
        const { postId, commentId, text } = req.body;
        if (!text) return res.status(400).json({ message: "Reply text required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        comment.replies.push({ user: req.user.id, text });
        await post.save();

        const newReply = comment.replies[comment.replies.length - 1];
        await newReply.populate("user", "name profileImage");

        // Emit reply in real-time
        req.io.to(postId.toString()).emit("newReply", { commentId, reply: newReply });

        res.status(201).json(newReply);
    } catch (err) {
        res.status(500).json({ message: "Failed to add reply", error: err.message });
    }
};

// VOTE POLL
exports.votePoll = async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const userId = req.user.id;
        const post = await Post.findById(req.params.id);

        if (!post || !post.poll) return res.status(400).json({ message: "No poll available" });

        const alreadyVoted = post.poll.options.some((opt) => opt.votes.includes(userId));
        if (alreadyVoted) return res.status(400).json({ message: "You already voted" });

        if (optionIndex < 0 || optionIndex >= post.poll.options.length)
            return res.status(400).json({ message: "Invalid poll option" });

        post.poll.options[optionIndex].votes.push(userId);
        await post.save();

        // Emit real-time poll update
        req.io.to(post._id.toString()).emit("pollVoted", { postId: post._id, poll: post.poll });

        res.json(post.poll);
    } catch (err) {
        res.status(500).json({ message: "Voting failed", error: err.message });
    }
};
