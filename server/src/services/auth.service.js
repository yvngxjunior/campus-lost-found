const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const Joi    = require('joi');

// ── Joi validation schemas ────────────────────────────────────────────────────

exports.registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

exports.loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Campus email domain whitelist ─────────────────────────────────────────────

exports.validateEmailDomain = (email) => {
  const allowed = (process.env.ALLOWED_EMAIL_DOMAINS || 'eleve.isep.fr,isep.fr')
    .split(',')
    .map(d => d.trim());
  const domain = email.split('@')[1];
  if (!allowed.includes(domain)) {
    const err = new Error(`Only campus emails are allowed (${allowed.join(', ')})`);
    err.statusCode = 403;
    throw err;
  }
};

// ── Password helpers ──────────────────────────────────────────────────────────

exports.hashPassword = (plain) => bcrypt.hash(plain, 12);
exports.verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// ── JWT helpers ───────────────────────────────────────────────────────────────

exports.signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
