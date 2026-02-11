const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Siempre debe ir arriba

const app = express();

// 1. Configuración de Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// 2. Validación de Variables de Entorno y Conexión a MongoDB
const dbURI = process.env.NODE_ENV === 'test' 
    ? 'mongodb://127.0.0.1:27017/test_db' // Base de datos local para tests
    : process.env.MONGO_URI;              // Atlas para producción

// Si no hay URI y no estamos en test, cerramos la app para evitar errores mayores
if (!dbURI && process.env.NODE_ENV !== 'test') {
    console.error("Error: No se encontró MONGO_URI en el archivo .env");
    process.exit(1);
}

// Conexión flexible: usa la URI real o una local de respaldo para tests
mongoose.connect(dbURI || 'mongodb://localhost:27017/test_db')
  .then(() => {
      if (process.env.NODE_ENV !== 'test') {
          console.log('✅ Conectado a MongoDB');
      }
  })
  .catch(err => console.error('❌ Error de conexión:', err));

// 3. Importación de Rutas
// Asegúrate de que estos archivos existan en la carpeta /routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));

// 4. Encendido del Servidor (Solo si no es un Test)
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}

// 5. Exportación para Jest
module.exports = app;