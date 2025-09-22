const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
    createPoll,
    votePoll,
    getPoll
} = require('../controllers/pollController');

router.post('/', auth, createPoll);
router.put('/vote', auth, votePoll);
router.get('/:pollId', auth, getPoll);

module.exports = router;
