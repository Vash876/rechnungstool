const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  } else {
    if (!global.__prisma) {
      global.__prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      });
    }
    prisma = global.__prisma;
  }
} catch (error) {
  console.error('Prisma initialization error:', error);
  throw new Error('Database connection failed');
}

module.exports = prisma;
