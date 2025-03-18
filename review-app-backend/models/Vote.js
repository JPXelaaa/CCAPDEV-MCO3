const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  voteType: {
    type: String,
    enum: ['helpful', 'unhelpful'],
    required: true
  }
}, { timestamps: true });

// Ensure a user can only have one vote per review
voteSchema.index({ user: 1, review: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
