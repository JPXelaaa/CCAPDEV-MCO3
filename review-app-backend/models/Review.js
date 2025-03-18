const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    rating: { type: Number, required: true },
    helpful: { type: Number, default: 0 },
    unhelpful: { type: Number, default: 0 },
    photos: [{
        data: Buffer,
        contentType: String
      }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    establishment: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [{
        content: String,
        establishmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Review', ReviewSchema);