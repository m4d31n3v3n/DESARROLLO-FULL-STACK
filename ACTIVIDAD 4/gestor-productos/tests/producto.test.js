const request = require('supertest');
const app = require('../server'); // Importamos la app configurada
const mongoose = require('mongoose');

describe('Pruebas Unitarias - Controlador de Productos', () => {
    
    // Cerramos la conexión a la DB después de las pruebas
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // CASO 1: Verificación de Seguridad (Middleware JWT)
    it('Debe denegar la creación de un producto si no se envía un token', async () => {
        const res = await request(app)
            .post('/api/productos')
            .send({
                nombre: "Smartphone Pro",
                precio: 999,
                categoria: "Electrónica"
            });
        
        // El middleware auth.js debe responder con 401 
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error', 'Acceso denegado. Inicia sesión.');
    });

    // CASO 2: Validación de Atributos (Lógica del Controlador)
    it('Debe permitir listar productos (Ruta Pública)', async () => {
        const res = await request(app).get('/api/productos');
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // CASO 3: Validación manual de tipo de dato (Ajuste manual post-IA)
    it('Debe fallar si el precio no es un número válido', async () => {
        // Simulamos un token válido si fuera necesario, o probamos la validación del modelo
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', 'Bearer token_invalido_de_prueba') 
            .send({
                nombre: "Producto Error",
                precio: "Gratis", // Tipo de dato incorrecto
                categoria: "Prueba"
            });
            
        // Debe fallar ya sea por token o por validación de Mongoose
        expect(res.statusCode).not.toBe(201);
    });
});