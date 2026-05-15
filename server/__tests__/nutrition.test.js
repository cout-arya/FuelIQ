const request = require('supertest');
const app = require('../app');

describe('Nutrition Endpoints', () => {
  it('GET /api/nutrition/search?q=aloo+paratha → array of results, each has calories, protein, carbs, fat fields', async () => {
    const res = await request(app).get('/api/nutrition/search?q=aloo+paratha');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('calories');
    expect(res.body[0]).toHaveProperty('protein');
    expect(res.body[0]).toHaveProperty('carbs');
    expect(res.body[0]).toHaveProperty('fat');
  });

  it('GET /api/nutrition/search?q=randomdish999 → empty array (not 404)', async () => {
    const res = await request(app).get('/api/nutrition/search?q=randomdish999');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('GET /api/nutrition/search without q param → 400 with validation error', async () => {
    const res = await request(app).get('/api/nutrition/search');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Query parameter q is required');
  });

  it('GET /api/nutrition/dish/:id with valid id → full macro breakdown object', async () => {
    const res = await request(app).get('/api/nutrition/dish/dummy_id');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('calories');
    expect(res.body).toHaveProperty('protein');
    expect(res.body).toHaveProperty('carbs');
    expect(res.body).toHaveProperty('fat');
  });

  it('GET /api/nutrition/dish/:id with invalid id → 404', async () => {
    const res = await request(app).get('/api/nutrition/dish/invalid_id');
    expect(res.statusCode).toBe(404);
  });
});
