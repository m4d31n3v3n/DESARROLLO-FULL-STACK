const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas protegidas
router.get('/', authMiddleware, productController.getProducts);
router.post('/', authMiddleware, productController.createProduct);

module.exports = router;