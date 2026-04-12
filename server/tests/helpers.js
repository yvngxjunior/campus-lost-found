const request = require('supertest');
const app     = require('../src/app');

/**
 * Register a user and return { token, userId }
 */
async function registerAndLogin(email, password = 'TestPass123!') {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ email, password, firstName: 'Test', lastName: 'User' });

  if (reg.status === 201) {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    return { token: login.body.token, userId: login.body.user?.id };
  }

  // User may already exist in repeated runs
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return { token: login.body.token, userId: login.body.user?.id };
}

module.exports = { app, registerAndLogin };
