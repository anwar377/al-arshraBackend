const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
    createPost,
    getAllPosts,
    getMyPosts,
    getUserPosts,
    editPost,
    deletePost,
    toggleLike,
    votePoll,
    addComment,
    getComments,
    addReply,
} = require("../controllers/postController");

// Create Post
router.post(
    "/create",
    auth,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "pollImage", maxCount: 1 },
    ]),
    createPost
);

router.get("/all", auth, getAllPosts);
router.get("/mine", auth, getMyPosts);
router.get("/user/:userId", auth, getUserPosts);

router.put("/:id", auth, upload.single("image"), editPost);
router.delete("/:id", auth, deletePost);

router.put("/like/:id", auth, toggleLike);
router.put("/vote/:id", auth, votePoll);

router.post("/comment", auth, addComment);
router.get("/:postId/comments", auth, getComments);
router.post("/reply", auth, addReply);

module.exports = router;
