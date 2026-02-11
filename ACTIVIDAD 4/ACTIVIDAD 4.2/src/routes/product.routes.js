const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const Product = require('../models/product.model');

router.post('/', auth, async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

module.exports = router;
