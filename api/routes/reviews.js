const express = require('express');
const Review = require('../models/Review');

const router = express.Router();

router.get('/:establishmentId', async (req, res) => {
    try {
        const reviews = await Review.find({ establishment: req.params.establishmentId }).populate('user', 'username');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
