require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('./middleware/auth'); // Middleware proporcionado 

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para servir el index.html 

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado para Gestión de Productos'))
    .catch(err => console.error('❌ Error DB:', err));

// --- MODELOS ---
const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const Producto = mongoose.model('Producto', new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}));

// --- RUTAS DE AUTENTICACIÓN ---

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existe = await User.findOne({ email });
        if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ success: true, message: 'Usuario creado' });
    } catch (err) { 
        res.status(500).json({ error: 'Error al registrar' }); 
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    // Firma del token usando la clave del archivo .env 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
});

// --- RUTAS DE PRODUCTOS (RECURSOS) ---

// Obtener todos los productos (Público)
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Crear producto (Protegido con JWT) 
app.post('/api/productos', verificarToken, async (req, res) => {
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
        res.status(400).json({ error: 'Error al guardar producto' });
    }
});

// Eliminar producto (Protegido con JWT) 
app.delete('/api/productos/:id', verificarToken, async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000; // Usa el puerto definido en .env 
app.listen(PORT, () => console.log(`Servidor de Productos en http://localhost:${PORT}`));

module.exports = app; // Importante para las pruebas unitarias con Jest