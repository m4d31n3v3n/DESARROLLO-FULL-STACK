const request = require('supertest');
const app = require('../server');

describe('Pruebas de Autenticación (JWT)', () => {
    // Generamos un email único usando la fecha y hora actual
    // Esto garantiza que nunca intentaremos registrar el mismo correo dos veces
    const timestamp = Date.now();
    const mockUser = {
        email: `user${timestamp}@test.com`,
        password: 'password123'
    };

    it('Debe registrar un nuevo usuario exitosamente', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(mockUser);
        
        expect(res.statusCode).toBe(201);
    });

    it('Debe devolver un token JWT al iniciar sesión', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send(mockUser);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});