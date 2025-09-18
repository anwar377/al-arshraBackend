const express = require("express");
const router = express.Router();
const {
    getChapters,
    getAyahs,
    getTranslations,
    getRecitation
} = require("../controllers/quranController");

// All chapters
router.get("/chapters", getChapters);

// Ayahs of a Surah
router.get("/chapters/:surahNumber/ayahs", getAyahs);

// Translations of a Surah
router.get("/chapters/:surahNumber/translations/:language", getTranslations);

// Recitations (two separate routes to avoid path-to-regexp ? issue)
// Without reciter
router.get("/chapters/:surahNumber/recitations", getRecitation);
// With reciter
router.get("/chapters/:surahNumber/recitations/:reciter", getRecitation);

module.exports = router;
