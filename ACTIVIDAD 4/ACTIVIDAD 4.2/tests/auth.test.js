const request = require('supertest');
const app = require('../src/app');

describe('Auth - Login', () => {

  it('Debe fallar si no hay credenciales', async () => {
    const res = await request(app).post('/auth/login');
    expect(res.statusCode).toBe(404);
  });

});
