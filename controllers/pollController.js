const Poll = require('../models/Poll');

exports.createPoll = async (req, res) => {
    try {
        const { question, options, postId } = req.body;

        if (!question || !options || options.length < 2)
            return res.status(400).json({ error: 'Poll must have at least 2 options' });

        const poll = new Poll({
            question,
            options: options.map(opt => ({ text: opt })),
            user: req.user._id,
            post: postId
        });

        await poll.save();
        res.status(201).json(poll);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create poll' });
    }
};

exports.votePoll = async (req, res) => {
    try {
        const { pollId, optionIndex } = req.body;
        const userId = req.user._id;

        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ error: 'Poll not found' });

        // Ensure user hasn't already voted
        const alreadyVoted = poll.options.some(option =>
            option.votes.includes(userId)
        );
        if (alreadyVoted)
            return res.status(400).json({ error: 'You have already voted' });

        // Add vote
        poll.options[optionIndex].votes.push(userId);
        await poll.save();

        // Optional: Real-time update
        req.io.emit('pollVoted', {
            pollId: poll._id,
            optionIndex,
            totalVotes: poll.options[optionIndex].votes.length
        });

        res.status(200).json({ message: 'Vote recorded', poll });
    } catch (err) {
        res.status(500).json({ error: 'Failed to vote in poll' });
    }
};

exports.getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.pollId).populate('user', 'name');
        if (!poll) return res.status(404).json({ error: 'Poll not found' });

        const result = {
            question: poll.question,
            options: poll.options.map(opt => ({
                text: opt.text,
                votes: opt.votes.length
            }))
        };

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get poll result' });
    }
};
