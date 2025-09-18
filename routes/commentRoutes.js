const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
    addComment,
    getComments
} = require("../controllers/commentController");

router.post("/:id", auth, addComment);
router.get("/:id", auth, getComments);

module.exports = router;
