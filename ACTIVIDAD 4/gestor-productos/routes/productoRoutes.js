const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const verificarToken = require('../middleware/auth'); // Tu middleware existente 

router.get('/', productoController.obtenerProductos);
router.post('/', verificarToken, productoController.crearProducto);

module.exports = router;