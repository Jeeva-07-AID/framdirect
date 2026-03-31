const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');

exports.getFarmerMetrics = async (req, res) => {
  if (req.user.role !== 'Farmer') return res.status(403).json({ msg: 'Not authorized' });

  try {
    const orders = await Order.find({ farmer: req.user.id });
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Calculate simple metrics based on orders
    let totalEarnings = 0;
    let todayEarnings = 0;
    let yesterdayEarnings = 0;

    const monthlyData = {}; // Format: "YYYY-MM"
    const dailyData = {};   // Format: "MM-DD"

    orders.forEach(order => {
      totalEarnings += order.totalPrice;
      const orderDate = new Date(order.createdAt);
      
      if (orderDate >= today) todayEarnings += order.totalPrice;
      else if (orderDate >= yesterday && orderDate < today) yesterdayEarnings += order.totalPrice;

      // Group by Month
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + order.totalPrice;

      // Group by Day (last 7 days ideally)
      const dayKey = `${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
      dailyData[dayKey] = (dailyData[dayKey] || 0) + order.totalPrice;
    });

    const metrics = {
      totalEarnings,
      todayEarnings,
      yesterdayEarnings,
      weeklyEarnings: todayEarnings + yesterdayEarnings * 5, // Mocked weekly
      monthlyEarnings: totalEarnings * 0.8, // Mocked relative
    };

    // Format for Recharts
    const chartData = Object.keys(dailyData).sort().map(key => ({
      name: key,
      revenue: dailyData[key],
      sales: Math.floor(dailyData[key] / 50) // Mock sales figure
    }));

    res.json({ metrics, chartData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getBuyerRecommendations = async (req, res) => {
  if (req.user.role !== 'Buyer') return res.status(403).json({ msg: 'Not authorized' });
  try {
    // Find top-rated farmers (Mock recommendation logic)
    const farmers = await User.find({ role: 'Farmer' })
      .sort({ averageRating: -1 })
      .limit(5)
      .select('name location averageRating avatar');
    
    res.json(farmers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.id })
      .populate('buyer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addReview = async (req, res) => {
  if (req.user.role !== 'Buyer') return res.status(403).json({ msg: 'Only buyers can review' });
  try {
    const { rating, comment } = req.body;
    const newReview = new Review({
      farmer: req.params.id,
      buyer: req.user.id,
      rating,
      comment
    });
    const review = await newReview.save();
    
    // Update Farmer Average Rating
    const allReviews = await Review.find({ farmer: req.params.id });
    const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(req.params.id, { averageRating: avg.toFixed(1) });

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
