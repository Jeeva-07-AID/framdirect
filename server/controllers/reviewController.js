const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  const { farmerId, rating, comment } = req.body;
  const buyerId = req.user.id; // From authMiddleware

  try {
    if (!farmerId || !rating) {
      return res.status(400).json({ msg: 'Please provide farmer ID and rating' });
    }

    const review = new Review({
      farmer: farmerId,
      buyer: buyerId,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Aggregating and updating the farmer's average rating
    const reviews = await Review.find({ farmer: farmerId });
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await User.findByIdAndUpdate(farmerId, { averageRating: averageRating.toFixed(1) });

    res.status(201).json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .populate('buyer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
