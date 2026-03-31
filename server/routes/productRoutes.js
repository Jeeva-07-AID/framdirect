const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

// Get all products (Buyer)
router.get('/', productController.getAllProducts);
// Get products by farmer (Farmer viewing their own, or buyer viewing specific farmer)
router.get('/farmer', auth, productController.getProductsByFarmer);
router.get('/farmer/:farmerId', auth, productController.getProductsByFarmer);
// Add a new product (Farmer only)
router.post('/', auth, productController.addProduct);
// Update a product (Farmer only)
router.put('/:id', auth, productController.updateProduct);
// Delete a product (Farmer only)
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
