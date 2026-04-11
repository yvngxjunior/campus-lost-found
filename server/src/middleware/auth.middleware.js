const jwt    = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * authenticate — vérifie le JWT Bearer et attache req.user
 * Le payload JWT doit contenir { sub: userId, role: Role }
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
 * requireRole — garde de rôle générique, à utiliser après authenticate()
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

/**
 * requireAdmin — bloque tout utilisateur qui n'est pas ADMIN
 * À utiliser après authenticate()
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

/**
 * requireOwnerOrAdmin — autorise uniquement le propriétaire de la ressource ou un admin
 * À utiliser après authenticate()
 *
 * Par défaut, compare req.user.id avec req.params.userId
 * Vous pouvez passer un getter personnalisé : requireOwnerOrAdmin(req => req.params.id)
 *
 * @param {Function} [getOwnerId] - fonction qui reçoit req et retourne l'id du propriétaire
 */
function requireOwnerOrAdmin(getOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    if (req.user.role === 'ADMIN') {
      return next();
    }
    const ownerId = typeof getOwnerId === 'function'
      ? getOwnerId(req)
      : req.params.userId;

    if (!ownerId || req.user.id !== ownerId) {
      return res.status(403).json({ error: 'Accès refusé : vous n\'êtes pas le propriétaire de cette ressource' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole, requireAdmin, requireOwnerOrAdmin };
