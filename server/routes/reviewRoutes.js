const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/reviews
// @desc    Add a review for a farmer
// @access  Private (Buyer)
router.post('/', auth, reviewController.createReview);

// @route   GET api/reviews/:farmerId
// @desc    Get all reviews for a specific farmer
// @access  Public
router.get('/:farmerId', reviewController.getFarmerReviews);

module.exports = router;
