const prisma = require('../config/prisma');
const { catchAsync } = require('../middleware/error.middleware');

/** GET /api/users/profile */
exports.getProfile = catchAsync(async (req, res) => {
  const { passwordHash: _, ...user } = req.user;
  res.json({ user });
});

/** PUT /api/users/profile */
exports.updateProfile = catchAsync(async (req, res) => {
  const { username } = req.body;

  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: req.user.id } },
    });
    if (taken) return res.status(409).json({ error: 'Username already taken' });
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { ...(username && { username }) },
    select: { id: true, username: true, email: true, role: true, updatedAt: true },
  });
  res.json({ user: updated });
});
