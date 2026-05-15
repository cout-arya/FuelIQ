const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

describe('Auth Middleware', () => {
  let token;
  let expiredToken;
  let user;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      onboardingComplete: false
    });

    process.env.JWT_SECRET = 'test_secret';
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '-1h' });
  });

  it('Valid JWT in Authorization header → req.user populated, next() called', async () => {
    const res = await request(app)
      .get('/api/nutrition/log/today')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).not.toBe(401);
  });

  it('Expired JWT → 401 with message "Token expired"', async () => {
    const res = await request(app)
      .get('/api/nutrition/log/today')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token expired');
  });

  it('Missing Authorization header → 401 with message "No token provided"', async () => {
    const res = await request(app)
      .get('/api/nutrition/log/today');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });
});
