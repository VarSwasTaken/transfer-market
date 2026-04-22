import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

type PrismaCache = {
  pool: Pool | null;
  client: PrismaClient | null;
};

declare global {
  var prismaCache: PrismaCache | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prismaCache?: PrismaCache;
};

const cached =
  globalForPrisma.prismaCache ??
  (globalForPrisma.prismaCache = { pool: null, client: null });

if (!cached.pool) {
  cached.pool = new Pool({ connectionString });
}

if (!cached.client) {
  const adapter = new PrismaPg(cached.pool);
  cached.client = new PrismaClient({ adapter });
}

export const prisma = cached.client;
