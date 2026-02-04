const express = require('express');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = '140506'; // En producción, usa variables de entorno

// Archivos de datos
const PATH_TAREAS = './tareas.json';
const PATH_USUARIOS = './usuarios.json';

app.use(express.json());

// --- FUNCIONES AUXILIARES PARA FS ---
async function leerArchivo(path) {
    try {
        const data = await fs.readFile(path, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return []; // Si el archivo no existe o está vacío
    }
}

async function escribirArchivo(path, data) {
    await fs.writeFile(path, JSON.stringify(data, null, 2));
}

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Acceso denegado, token inexistente' });

    try {
        const verificado = jwt.verify(token, SECRET_KEY);
        req.user = verificado;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token no es válido' });
    }
};

// --- RUTAS DE AUTENTICACIÓN ---

app.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const usuarios = await leerArchivo(PATH_USUARIOS);

        if (usuarios.find(u => u.email === email)) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = { id: Date.now(), email, password: hashedPassword };
        
        usuarios.push(nuevoUsuario);
        await escribirArchivo(PATH_USUARIOS, usuarios);

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        next(error);
    }
});

app.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const usuarios = await leerArchivo(PATH_USUARIOS);
        const usuario = usuarios.find(u => u.email === email);

        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        next(error);
    }
});

// --- RUTAS DE TAREAS (PROTEGIDAS) ---

// GET: Obtener todas las tareas
app.get('/tareas', verificarToken, async (req, res, next) => {
    try {
        const tareas = await leerArchivo(PATH_TAREAS);
        res.json(tareas);
    } catch (error) {
        next(error);
    }
});

// POST: Agregar nueva tarea
app.post('/tareas', verificarToken, async (req, res, next) => {
    try {
        const { titulo, descripcion } = req.body;
        const tareas = await leerArchivo(PATH_TAREAS);

        const nuevaTarea = {
            id: Date.now(),
            titulo,
            descripcion,
            usuarioId: req.user.id
        };

        tareas.push(nuevaTarea);
        await escribirArchivo(PATH_TAREAS, tareas);
        res.status(201).json(nuevaTarea);
    } catch (error) {
        next(error);
    }
});

// PUT: Actualizar tarea
app.put('/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion } = req.body;
        let tareas = await leerArchivo(PATH_TAREAS);

        const index = tareas.findIndex(t => t.id == id);
        if (index === -1) return res.status(404).json({ error: 'Tarea no encontrada' });

        tareas[index] = { ...tareas[index], titulo, descripcion };
        await escribirArchivo(PATH_TAREAS, tareas);

        res.json(tareas[index]);
    } catch (error) {
        next(error);
    }
});

// DELETE: Eliminar tarea
app.delete('/tareas/:id', verificarToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        let tareas = await leerArchivo(PATH_TAREAS);
        
        const nuevasTareas = tareas.filter(t => t.id != id);
        if (tareas.length === nuevasTareas.length) return res.status(404).json({ error: 'Tarea no encontrada' });

        await escribirArchivo(PATH_TAREAS, nuevasTareas);
        res.json({ success: true, message: 'Tarea eliminada' });
    } catch (error) {
        next(error);
    }
});

// --- MANEJO DE ERRORES (Middleware personalizado) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Algo salió mal en el servidor',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});