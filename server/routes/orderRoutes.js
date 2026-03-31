const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

// Create a new order (Buyer)
router.post('/', auth, orderController.createOrder);
// Get orders for the logged-in user (Buyer or Farmer)
router.get('/', auth, orderController.getOrders);
// Update order status (Farmer)
router.patch('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;
