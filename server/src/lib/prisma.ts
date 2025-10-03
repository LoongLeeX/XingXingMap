/**
 * Prisma Client 单例
 * 
 * 在开发环境中，避免热重载导致创建多个 Prisma Client 实例
 */

import { PrismaClient } from '@prisma/client';

// 调试：打印数据库 URL
console.log('🔍 [Prisma] DATABASE_URL:', process.env.DATABASE_URL);
console.log('🔍 [Prisma] NODE_ENV:', process.env.NODE_ENV);

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * 优雅关闭数据库连接
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * 数据库健康检查
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

