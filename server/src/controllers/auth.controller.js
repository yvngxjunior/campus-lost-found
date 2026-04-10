const prisma      = require('../config/prisma');
const { catchAsync } = require('../middleware/error.middleware');
const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 * Inscription avec email institutionnel + mot de passe
 */
exports.register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  // Vérifie le domaine campus (double sécurité après Joi)
  authService.validateEmailDomain(email);

  // Unicité email + username
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return res.status(409).json({ error: 'Email ou nom d\'utilisateur déjà utilisé' });
  }

  const passwordHash = await authService.hashPassword(password);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  const token = authService.signToken(user.id);
  res.status(201).json({ user, token });
});

/**
 * POST /api/auth/login
 * Authentification par email + mot de passe, retourne un JWT signé
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  if (user.status === 'INACTIVE') {
    return res.status(403).json({ error: 'Compte désactivé' });
  }

  const valid = await authService.verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = authService.signToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

/**
 * GET /api/auth/me
 * Retourne le profil de l'utilisateur authentifié (sans le hash)
 */
exports.me = catchAsync(async (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});
