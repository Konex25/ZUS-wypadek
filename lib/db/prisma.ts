import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Użyj POSTGRES_URL dla Vercel Postgres lub DATABASE_URL dla innych
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL or POSTGRES_URL environment variable')
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    url: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

