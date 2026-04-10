const router   = require('express').Router();
const { register, login, me } = require('../controllers/auth.controller');
const { authenticate }        = require('../middleware/auth.middleware');
const validate                = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../services/auth.service');

// POST /api/auth/register — inscription avec email campus + mot de passe
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login — authentification, retour d'un JWT signé
router.post('/login', validate(loginSchema), login);

// GET  /api/auth/me — profil de l'utilisateur connecté
router.get('/me', authenticate, me);

module.exports = router;
