const request = require('supertest');
const app = require('../src/app');

describe('Productos protegidos', () => {

  it('Debe bloquear acceso sin token', async () => {
    const res = await request(app).post('/products');
    expect(res.statusCode).toBe(401);
  });

});
