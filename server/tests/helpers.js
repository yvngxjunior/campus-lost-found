const request = require('supertest');
const app     = require('../src/app');

/**
 * Register a user and return { token, userId }
 */
async function registerAndLogin(email, password = 'TestPass123!') {
  // Derive a unique username from the email local part
  const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

  const reg = await request(app)
    .post('/api/auth/register')
    .send({ email, password, username });

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
