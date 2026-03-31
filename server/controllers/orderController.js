const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  if (req.user.role !== 'Buyer') return res.status(403).json({ msg: 'Only buyers can order' });
  const { productId, quantity, paymentMethod, paymentStatus } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    if (product.quantity < quantity) return res.status(400).json({ msg: 'Insufficient quantity available' });

    const totalPrice = product.pricePerKg * quantity;

    const newOrder = new Order({
      buyer: req.user.id,
      farmer: product.farmer,
      product: productId,
      quantity,
      totalPrice,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentStatus || 'Pending'
    });

    // Reduce product quantity
    product.quantity -= quantity;
    await product.save();

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'Farmer') {
      orders = await Order.find({ farmer: req.user.id })
        .populate('buyer', 'name location phone')
        .populate('product', 'name category pricePerKg')
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ buyer: req.user.id })
        .populate('farmer', 'name location phone')
        .populate('product', 'name category pricePerKg image')
        .sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateOrderStatus = async (req, res) => {
  if (req.user.role !== 'Farmer') return res.status(403).json({ msg: 'Not authorized' });
  try {
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.farmer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    order.status = req.body.status;
    await order.save();
    
    // populate buyer/product to return updated order correctly
    order = await Order.findById(req.params.id)
        .populate('buyer', 'name location phone')
        .populate('product', 'name category pricePerKg');
        
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
