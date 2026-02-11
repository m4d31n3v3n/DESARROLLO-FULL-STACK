const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

// NO conectes aquí, server.js ya lo hace. Solo limpia si es necesario.
describe('Pruebas de Controlador de Productos', () => {
    it('Debe fallar (401) al crear un producto sin token de seguridad', async () => {
        const response = await request(app)
            .post('/api/products')
            .send({ name: "Laptop", price: 1000 });
        
        expect(response.statusCode).toBe(401);
    });
});