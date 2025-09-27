const express = require("express");
const {
    registerMasjid,
    updateMasjid,
    deleteMasjid,
    getAllMasjids,
    getMasjidById,
    getMyMasjid,
    getPendingMasjids,
    approveMasjid,
    rejectMasjid,
} = require("../controllers/masjidController");

const masjidAuth = require("../middleware/masjidAuth");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// ---------------- PUBLIC ROUTES ----------------
// Get all approved masjids
router.get("/", getAllMasjids);
// Get single approved masjid by ID
router.get("/:id", getMasjidById);

// ---------------- PRIVATE USER ROUTES ----------------
// Get logged-in user's masjid
router.get("/my", masjidAuth, getMyMasjid);
// Register a new masjid
router.post("/register", masjidAuth, registerMasjid);
// Update masjid (only creator)
router.put("/:id", masjidAuth, updateMasjid);
// Delete masjid (only creator)
router.delete("/:id", masjidAuth, deleteMasjid);

// ---------------- ADMIN ROUTES ----------------
// Get all pending masjids
router.get("/admin/pending", masjidAuth, adminAuth, getPendingMasjids);
// Approve masjid
router.put("/:id/approve", masjidAuth, adminAuth, approveMasjid);
// Reject masjid
router.put("/:id/reject", masjidAuth, adminAuth, rejectMasjid);

module.exports = router;
