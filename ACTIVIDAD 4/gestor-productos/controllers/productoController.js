const Producto = require('../models/Producto');

exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

exports.crearProducto = async (req, res) => {
    try {
        const { nombre, precio, categoria } = req.body;
        const nuevoProducto = new Producto({ 
            nombre, 
            precio, 
            categoria, 
            usuarioId: req.user.id 
        });
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear producto' });
    }
};