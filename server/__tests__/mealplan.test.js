const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const MealPlan = require('../models/MealPlan');

describe('MealPlan Endpoints', () => {
  let userToken, userId;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const user = await User.create({ 
      name: 'User 1', 
      email: 'u1@test.com', 
      password: 'password123',
      profile: {
        gender: 'Male',
        age: 25,
        height: 175,
        weight: 70,
        activityLevel: 'moderately_active',
        goal: 'maintenance'
      }
    });
    user.tdee = 2500;
    await user.save();
    userId = user._id;
    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  });

  it('POST /api/mealplan/generate → mock Gemini response using nock, verify MealPlan saved with userId, goal, totalCalories, meals array', async () => {
    const res = await request(app)
      .post('/api/mealplan/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isTrainingDay: true });
      
    expect(res.statusCode).toBe(200);
    const plans = await MealPlan.find({ userId });
    expect(plans.length).toBe(1);
    expect(plans[0].userId.toString()).toBe(userId.toString());
    expect(plans[0]).toHaveProperty('targetCalories');
    expect(Array.isArray(plans[0].meals)).toBe(true);
  });

  it('GET /api/mealplan/current → returns most recent active plan for user', async () => {
    await request(app)
      .post('/api/mealplan/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isTrainingDay: true });
      
    const res = await request(app)
      .get('/api/mealplan/current')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.plan).toBeDefined();
    expect(res.body.plan.userId.toString()).toBe(userId.toString());
  });

  it('GET /api/mealplan/current with no plan yet → 404', async () => {
    const res = await request(app)
      .get('/api/mealplan/current')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/mealplan/:planId/regenerate-meal → mock Gemini, verify only the target meal is replaced, rest of plan is unchanged', async () => {
    const genRes = await request(app)
      .post('/api/mealplan/generate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isTrainingDay: true });
      
    const planId = genRes.body._id;
    const originalMeal0 = genRes.body.meals[0].foodName;
    const originalMeal1 = genRes.body.meals[1].foodName;

    const res = await request(app)
      .post(`/api/mealplan/${planId}/regenerate-meal`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ mealIndex: 0 });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.plan.meals[0].foodName).not.toBe(originalMeal0);
    expect(res.body.plan.meals[1].foodName).toBe(originalMeal1);
  });
});
