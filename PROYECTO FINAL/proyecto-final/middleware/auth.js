const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Acceso denegado. Inicia sesión.' });

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verificado;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Token no válido o expirado.' });
    }
};

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

// Middleware para verificar rol específico
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ error: `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}` });
        }
        next();
    };
};

module.exports = { verificarToken, verificarAdmin, verificarRol };