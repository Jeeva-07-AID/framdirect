const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };

    let products = await Product.find(query)
      .populate('farmer', 'name location averageRating avatar')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getProductsByFarmer = async (req, res) => {
  try {
    const farmerId = req.params.farmerId || req.user.id;
    const products = await Product.find({ farmer: farmerId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addProduct = async (req, res) => {
  if (req.user.role !== 'Farmer') return res.status(403).json({ msg: 'Not authorized' });
  const { name, category, pricePerKg, quantity, image } = req.body;
  try {
    const newProduct = new Product({
      farmer: req.user.id,
      name, category, pricePerKg, quantity, image
    });
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateProduct = async (req, res) => {
  if (req.user.role !== 'Farmer') return res.status(403).json({ msg: 'Not authorized' });
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    if (product.farmer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteProduct = async (req, res) => {
  if (req.user.role !== 'Farmer') return res.status(403).json({ msg: 'Not authorized' });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    if (product.farmer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    // Use deleteOne instead of deprecated remove()
    await product.deleteOne();
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).send('Server Error');
  }
};
