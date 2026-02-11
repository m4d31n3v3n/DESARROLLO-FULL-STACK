const request = require('supertest');
const app = require('../app');
const setup = require('./setup');
const User = require('../models/User');

beforeAll(async () => { await setup.connect(); });
afterAll(async () => { await setup.closeDatabase(); });
afterEach(async () => { await setup.clearDatabase(); });

describe('Auth', () => {
  test('register and login flow', async () => {
    const email = 'test@example.com';
    const password = 'pass1234';
    const reg = await request(app).post('/api/auth/register').send({ email, password });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();

    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });

  test('rejects invalid login', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'no@no.com', password: 'x' });
    expect(res.status).toBe(401);
  });
});
