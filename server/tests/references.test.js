const request = require('supertest');
const app     = require('../src/app');

describe('GET /api/categories', () => {
  it('returns a list of categories (public)', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/locations', () => {
  it('returns a list of locations (public)', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
