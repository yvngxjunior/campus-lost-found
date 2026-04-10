const { PrismaClient } = require('@prisma/client');

// Singleton pattern — reuse the same instance across hot-reloads in dev
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

module.exports = globalForPrisma.prisma;
