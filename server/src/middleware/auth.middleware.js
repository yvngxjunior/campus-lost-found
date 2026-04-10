const jwt    = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * authenticate — vérifie le JWT Bearer et attache req.user
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'En-tête Authorization manquant ou invalide' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré, veuillez vous reconnecter' });
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
}

/**
 * requireRole — garde de rôle, à utiliser après authenticate()
 * @param {...string} roles  Ex: requireRole('ADMIN') ou requireRole('ADMIN', 'STAFF')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
