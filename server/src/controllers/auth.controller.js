const prisma   = require('../config/prisma');
const { catchAsync } = require('../middleware/error.middleware');
const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 */
exports.register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate campus email domain
  authService.validateEmailDomain(email);

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return res.status(409).json({ error: 'Email or username already in use' });
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
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.status === 'INACTIVE') return res.status(403).json({ error: 'Account deactivated' });

  const valid = await authService.verifyPassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = authService.signToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

/**
 * GET /api/auth/me
 */
exports.me = catchAsync(async (req, res) => {
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});
