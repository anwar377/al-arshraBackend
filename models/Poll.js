const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        options: [
            {
                text: String,
                votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
            }
        ],
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Poll', pollSchema);
