// Middleware centralizado de manejo de errores

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            detalles: Object.values(err.errors).map(e => e.message)
        });
    }

    // Error de duplicación (índice único)
    if (err.code === 11000) {
        const campo = Object.keys(err.keyValue)[0];
        return res.status(400).json({ error: `El ${campo} ya está registrado.` });
    }

    // Error de casting de ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido.' });
    }

    // Error general
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor'
    });
};

module.exports = errorHandler;
