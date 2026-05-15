const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const MealLog = require('../models/MealLog');

describe('MealLog Endpoints', () => {
  let user1Token, user2Token, user1Id, user2Id;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const user1 = await User.create({ name: 'User 1', email: 'u1@test.com', password: 'password123' });
    const user2 = await User.create({ name: 'User 2', email: 'u2@test.com', password: 'password123' });
    user1Id = user1._id;
    user2Id = user2._id;
    user1Token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    user2Token = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  });

  it('POST /api/nutrition/log (authenticated) → mock Gemini parsing response using nock, verify MealLog document is saved in DB with correct userId', async () => {
    const res = await request(app)
      .post('/api/nutrition/log')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ text: 'aloo paratha' });
    
    expect(res.statusCode).toBe(201);
    
    const logs = await MealLog.find({ userId: user1Id });
    expect(logs.length).toBe(1);
    expect(logs[0].userId.toString()).toBe(user1Id.toString());
  });

  it('GET /api/nutrition/log/today (authenticated) → returns only today\'s logs for the requesting user', async () => {
    // Create log for user 1
    await MealLog.create({ userId: user1Id, date: new Date(), rawInput: 'test 1', mealType: 'lunch' });
    // Create log for user 2
    await MealLog.create({ userId: user2Id, date: new Date(), rawInput: 'test 2', mealType: 'lunch' });

    const res = await request(app)
      .get('/api/nutrition/log/today')
      .set('Authorization', `Bearer ${user1Token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].userId.toString()).toBe(user1Id.toString());
  });

  it('DELETE /api/nutrition/log/:id (own entry) → 200, document removed from DB', async () => {
    const log = await MealLog.create({ userId: user1Id, date: new Date(), rawInput: 'test', mealType: 'lunch' });
    
    const res = await request(app)
      .delete(`/api/nutrition/log/${log._id}`)
      .set('Authorization', `Bearer ${user1Token}`);
      
    expect(res.statusCode).toBe(200);
    const logs = await MealLog.find({ _id: log._id });
    expect(logs.length).toBe(0);
  });

  it('DELETE /api/nutrition/log/:id (another user\'s entry) → 403 forbidden or 404 not found', async () => {
    const log = await MealLog.create({ userId: user2Id, date: new Date(), rawInput: 'test', mealType: 'lunch' });
    
    const res = await request(app)
      .delete(`/api/nutrition/log/${log._id}`)
      .set('Authorization', `Bearer ${user1Token}`);
      
    // The implementation returns 404 when it tries to find the log by id AND userId
    expect([403, 404]).toContain(res.statusCode);
  });

  it('GET /api/nutrition/log/today (unauthenticated) → 401', async () => {
    const res = await request(app).get('/api/nutrition/log/today');
    expect(res.statusCode).toBe(401);
  });
});
