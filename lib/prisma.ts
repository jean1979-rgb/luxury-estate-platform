import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl =
  process.env.DATABASE_URL ||
  "file:/Users/christiansanchez/Documents/luxury-estate-local-data/dev.db";

const prismaClient = (() => {
  if (databaseUrl.startsWith("file:")) {
    const adapter = new PrismaBetterSqlite3({
      url: databaseUrl,
    });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
})();

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
