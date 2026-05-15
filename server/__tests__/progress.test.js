const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const MealLog = require('../models/MealLog');
const WeightLog = require('../models/WeightLog');

describe('Progress and Export Endpoints', () => {
  let userToken, userId;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const user = await User.create({ name: 'User 1', email: 'u1@test.com', password: 'password123' });
    userId = user._id;
    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  });

  it('POST /api/progress/weight → saves WeightLog, returns updated entry', async () => {
    const res = await request(app)
      .post('/api/progress/weight')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ weight: 75 });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.weight).toBe(75);
    
    const logs = await WeightLog.find({ userId });
    expect(logs.length).toBe(1);
    expect(logs[0].weight).toBe(75);
  });

  it('GET /api/progress/summary → returns object with weeklyAdherence, weightTrend, currentStreak fields', async () => {
    await MealLog.create({ userId, date: new Date(), rawInput: 'test', mealType: 'lunch' });
    
    const res = await request(app)
      .get('/api/progress/summary')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('weeklyAdherence');
    expect(res.body).toHaveProperty('weightTrend');
    expect(res.body).toHaveProperty('currentStreak');
    expect(res.body.currentStreak).toBeGreaterThan(0);
  });

  it('GET /api/progress/summary with no logs → streak is 0', async () => {
    const res = await request(app)
      .get('/api/progress/summary')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.currentStreak).toBe(0);
  });

  it('POST /api/export → returns Content-Type: application/json with all MealLogs for the authenticated user', async () => {
    await MealLog.create({ userId, date: new Date(), rawInput: 'test meal', mealType: 'lunch' });
    
    const res = await request(app)
      .post('/api/export')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body).toHaveProperty('mealLogs');
    expect(res.body.mealLogs.length).toBe(1);
    expect(res.body.mealLogs[0].rawInput).toBe('test meal');
  });
});
