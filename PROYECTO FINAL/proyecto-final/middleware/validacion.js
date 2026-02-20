// Middleware de validación de datos

const validarRegistro = (req, res, next) => {
    const { email, password, nombre } = req.body;

    if (!email || !password || !nombre) {
        return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos.' });
    }

    if (email.length < 5 || !email.includes('@')) {
        return res.status(400).json({ error: 'Email inválido.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (nombre.length < 2) {
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
    }

    next();
};

const validarLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    next();
};

const validarTarea = (req, res, next) => {
    const { titulo } = req.body;

    if (!titulo || titulo.length < 3) {
        return res.status(400).json({ error: 'El título debe tener al menos 3 caracteres.' });
    }

    if (titulo.length > 200) {
        return res.status(400).json({ error: 'El título no puede exceder 200 caracteres.' });
    }

    next();
};

const validarPaginacion = (req, res, next) => {
    const { pagina = 1, limite = 10 } = req.query;

    if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({ error: 'Número de página inválido.' });
    }

    if (isNaN(limite) || limite < 1 || limite > 100) {
        return res.status(400).json({ error: 'Límite debe estar entre 1 y 100.' });
    }

    req.paginacion = {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        saltar: (parseInt(pagina) - 1) * parseInt(limite)
    };

    next();
};

module.exports = { validarRegistro, validarLogin, validarTarea, validarPaginacion };
