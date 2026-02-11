const request = require('supertest');
const app = require('../app');
const setup = require('./setup');
const User = require('../models/User');

beforeAll(async () => { await setup.connect(); });
afterAll(async () => { await setup.closeDatabase(); });
afterEach(async () => { await setup.clearDatabase(); });

describe('Products', () => {
  test('create product requires auth', async () => {
    const res = await request(app).post('/api/products').send({ name: 'p1', price: 10 });
    expect(res.status).toBe(401);
  });

  test('admin user can create and list product', async () => {
    const email = 'a@b.com';
    const password = '123456';
    const reg = await request(app).post('/api/auth/register').send({ email, password });
    // promote user to admin for this test
    const userId = reg.body.user.id;
    await User.findByIdAndUpdate(userId, { role: 'admin' });
    const login = await request(app).post('/api/auth/login').send({ email, password });
    const token = login.body.token;
    const create = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send({ name: 'p1', price: 10 });
    expect(create.status).toBe(201);
    const list = await request(app).get('/api/products');
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);
  });
});
