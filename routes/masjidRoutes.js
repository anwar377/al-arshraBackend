const express = require("express");
const {
    registerMasjid,
    updateMasjid,
    deleteMasjid,
    getAllMasjids,
    getMasjidById,
    getMyMasjid
} = require("../controllers/masjidController");
const masjidAuth = require("../middleware/masjidAuth");

const router = express.Router();

// Public routes
router.get("/", getAllMasjids);

// Private routes
router.get("/my", masjidAuth, getMyMasjid); // MUST be before /:id
router.get("/:id", getMasjidById);          // Fetch any masjid by ID
router.post("/register", masjidAuth, registerMasjid);
router.put("/:id", masjidAuth, updateMasjid);
router.delete("/:id", masjidAuth, deleteMasjid);

module.exports = router;
