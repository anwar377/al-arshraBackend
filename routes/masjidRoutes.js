const express = require("express");
const auth = require("../middleware/auth");
const {
    registerMasjid,
    updateMasjid,
    deleteMasjid,
    getAllMasjids,
    getMasjidById,
    getMyMasjid // updated for single masjid
} = require("../controllers/masjidController");

const router = express.Router();

// Public routes
router.get("/", getAllMasjids);
router.get("/:id", getMasjidById);

// Private routes
router.post("/register", auth, registerMasjid);
router.get("/my", auth, getMyMasjid); // use "/my" instead of "/"
router.put("/:id", auth, updateMasjid);
router.delete("/:id", auth, deleteMasjid);

module.exports = router;
