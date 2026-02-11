const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

exports.createProduct = async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
};