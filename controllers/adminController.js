const User = require('../models/User');
const Post = require('../models/Post');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get users' });
    }
};

exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'name');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get posts' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
};
