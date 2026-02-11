const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Pruebas de la API de Productos', () => {
    // Cerramos la conexión después de las pruebas
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('Debería denegar acceso a productos sin token', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(401);
    });
});