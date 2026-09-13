import { PrismaClient } from '@prisma/client';
import env from './env.js';

let prisma;

if (env.isProd) {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  // In development, reuse the Prisma Client across hot-reloads
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

export default prisma;
