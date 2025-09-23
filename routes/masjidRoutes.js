const express = require("express");
const {
    registerMasjid,
    updateMasjid,
    deleteMasjid,
    getAllMasjids,
    getMasjidById,
    getMyMasjid // updated for single masjid
} = require("../controllers/masjidController");
const masjidAuth = require("../middleware/masjidAuth");

const router = express.Router();

// Public routes
router.get("/", getAllMasjids);
router.get("/:id", getMasjidById);

// Private routes
router.post("/register", masjidAuth, registerMasjid);
router.get("/my", masjidAuth, getMyMasjid); // use "/my" instead of "/"
router.put("/:id", masjidAuth, updateMasjid);
router.delete("/:id", masjidAuth, deleteMasjid);

module.exports = router;
