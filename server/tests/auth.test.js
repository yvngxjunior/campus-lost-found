const request = require('supertest');
const app     = require('../src/app');

const EMAIL    = `test_auth_${Date.now()}@eleve.isep.fr`;
const PASSWORD = 'SecurePass123!';
let   TOKEN    = '';

// ─── POST /api/auth/register ───────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('creates a new user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: EMAIL, password: PASSWORD, firstName: 'Jean', lastName: 'Dupont' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: EMAIL });
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: EMAIL, password: PASSWORD, firstName: 'Jean', lastName: 'Dupont' });

    expect(res.status).toBe(409);
  });

  it('rejects non-campus email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'hacker@gmail.com', password: PASSWORD, firstName: 'A', lastName: 'B' });

    expect(res.status).toBe(400);
  });

  it('rejects missing password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `other_${Date.now()}@eleve.isep.fr`, firstName: 'A', lastName: 'B' });

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('returns a JWT on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    TOKEN = res.body.token;
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: 'WrongPass!' });

    expect(res.status).toBe(401);
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@eleve.isep.fr', password: PASSWORD });

    expect(res.status).toBe(401);
  });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns the authenticated user profile', async () => {
    // Ensure TOKEN is populated (may run independently)
    if (!TOKEN) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: EMAIL, password: PASSWORD });
      TOKEN = res.body.token;
    }

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', EMAIL);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
