const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

// Get farmer earnings and analytics metrics
router.get('/farmer/metrics', auth, dashboardController.getFarmerMetrics);
// Get buyer recommended farmers and nearby
router.get('/buyer/recommendations', auth, dashboardController.getBuyerRecommendations);
// Get reviews for a farmer
router.get('/farmer/:id/reviews', dashboardController.getFarmerReviews);
// Add a review
router.post('/farmer/:id/reviews', auth, dashboardController.addReview);

module.exports = router;
