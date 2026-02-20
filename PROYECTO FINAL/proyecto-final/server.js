require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { verificarToken, verificarAdmin, verificarRol } = require('./middleware/auth');
const { validarRegistro, validarLogin, validarTarea, validarPaginacion } = require('./middleware/validacion');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexión DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Error DB:', err));

// --- MODELOS ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'user'], default: 'user' },
    nombre: { type: String, required: true },
    activo: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const tareaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String },
    completada: { type: Boolean, default: false },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Tarea = mongoose.model('Tarea', tareaSchema);

// --- RUTAS AUTH ---

// REGISTRO
app.post('/api/auth/register', validarRegistro, async (req, res, next) => {
    try {
        const { email, password, nombre } = req.body;
        
        const existe = await User.findOne({ email });
        if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, nombre, rol: 'user' });
        await user.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Usuario creado correctamente',
            usuario: { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol }
        });
    } catch (err) { 
        next(err);
    }
});

// LOGIN
app.post('/api/auth/login', validarLogin, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }
        
        if (!user.activo) {
            return res.status(403).json({ error: 'Usuario inactivo' });
        }

        const token = jwt.sign({ 
            id: user._id, 
            email: user.email, 
            rol: user.rol,
            nombre: user.nombre 
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ 
            success: true, 
            token,
            usuario: { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol }
        });
    } catch (err) {
        next(err);
    }
});

// Obtener perfil del usuario actual
app.get('/api/auth/perfil', verificarToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        next(err);
    }
});

// --- RUTAS TAREAS ---

// GET todas las tareas del usuario actual con paginación y filtros
app.get('/api/tareas', verificarToken, validarPaginacion, async (req, res, next) => {
    try {
        const { completada, busqueda } = req.query;
        const filtro = { usuarioId: req.user.id };

        // Filtro por estado
        if (completada !== undefined) {
            filtro.completada = completada === 'true';
        }

        // Búsqueda por título
        if (busqueda) {
            filtro.titulo = { $regex: busqueda, $options: 'i' };
        }

        const total = await Tarea.countDocuments(filtro);
        const tareas = await Tarea
            .find(filtro)
            .sort({ createdAt: -1 })
            .skip(req.paginacion.saltar)
            .limit(req.paginacion.limite)
            .select('-__v');

        res.json({
            tareas,
            paginacion: {
                pagina: req.paginacion.pagina,
                limite: req.paginacion.limite,
                total,
                páginas: Math.ceil(total / req.paginacion.limite)
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET tarea por ID
app.get('/api/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        const tarea = await Tarea.findById(req.params.id);
        
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        if (tarea.usuarioId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para ver esta tarea' });
        }

        res.json(tarea);
    } catch (err) {
        next(err);
    }
});

// POST crear tarea
app.post('/api/tareas', verificarToken, validarTarea, async (req, res, next) => {
    try {
        const { titulo, descripcion } = req.body;
        const nuevaTarea = new Tarea({
            titulo,
            descripcion,
            usuarioId: req.user.id
        });
        await nuevaTarea.save();
        res.status(201).json(nuevaTarea);
    } catch (err) {
        next(err);
    }
});

// PUT actualizar tarea
app.put('/api/tareas/:id', verificarToken, validarTarea, async (req, res, next) => {
    try {
        const tarea = await Tarea.findById(req.params.id);

        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        if (tarea.usuarioId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para actualizar esta tarea' });
        }

        const { titulo, descripcion, completada } = req.body;
        tarea.titulo = titulo || tarea.titulo;
        tarea.descripcion = descripcion !== undefined ? descripcion : tarea.descripcion;
        tarea.completada = completada !== undefined ? completada : tarea.completada;
        tarea.updatedAt = Date.now();

        await tarea.save();
        res.json(tarea);
    } catch (err) {
        next(err);
    }
});

// DELETE tarea
app.delete('/api/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        const tarea = await Tarea.findById(req.params.id);

        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        if (tarea.usuarioId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
        }

        await Tarea.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Tarea eliminada' });
    } catch (err) {
        next(err);
    }
});

// --- RUTAS ADMINISTRADOR ---

// GET todos los usuarios (solo admin)
app.get('/api/admin/usuarios', verificarToken, verificarAdmin, async (req, res, next) => {
    try {
        const usuarios = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (err) {
        next(err);
    }
});

// PUT cambiar rol de usuario (solo admin)
app.put('/api/admin/usuarios/:id/rol', verificarToken, verificarAdmin, async (req, res, next) => {
    try {
        const { rol } = req.body;
        
        if (!['admin', 'user'].includes(rol)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { rol },
            { new: true }
        ).select('-password');

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (err) {
        next(err);
    }
});

// DELETE desactivar usuario (solo admin)
app.delete('/api/admin/usuarios/:id', verificarToken, verificarAdmin, async (req, res, next) => {
    try {
        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        ).select('-password');

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ success: true, message: 'Usuario desactivado', usuario });
    } catch (err) {
        next(err);
    }
});

// --- API EXTERNA: CLIMA ---

// GET clima de una ciudad
app.get('/api/clima/:ciudad', verificarToken, async (req, res, next) => {
    try {
        const { ciudad } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key de clima no configurada' });
        }

        const respuesta = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
                params: {
                    q: ciudad,
                    appid: apiKey,
                    units: 'metric',
                    lang: 'es'
                }
            }
        );

        res.json({
            ciudad: respuesta.data.name,
            pais: respuesta.data.sys.country,
            temperatura: respuesta.data.main.temp,
            sensacion: respuesta.data.main.feels_like,
            humedad: respuesta.data.main.humidity,
            descripcion: respuesta.data.weather[0].description,
            viento: respuesta.data.wind.speed
        });
    } catch (err) {
        if (err.response?.status === 404) {
            res.status(404).json({ error: 'Ciudad no encontrada' });
        } else {
            next(err);
        }
    }
});

// --- MIDDLEWARE DE ERRORES (debe estar al final) ---
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));