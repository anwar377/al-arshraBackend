const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/adminAuth');
const {
    getAllUsers,
    toggleBanUser,
    getAllPosts,
    deletePost
} = require('../controllers/adminController');

router.use(auth, isAdmin);

router.get('/users', getAllUsers);
router.put('/ban-user/:id', toggleBanUser);
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);

module.exports = router;
