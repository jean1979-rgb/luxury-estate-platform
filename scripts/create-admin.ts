import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function readEnvValue(filePath: string, key: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const line = raw
    .split(/\r?\n/)
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${key}=`));

  if (!line) {
    throw new Error(`${key} not found in ${filePath}`);
  }

  const value = line.slice(key.length + 1).trim();

  if (!value) {
    throw new Error(`${key} is empty in ${filePath}`);
  }

  return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

process.env.DATABASE_URL = readEnvValue(".vercel/.env.production.local", "DATABASE_URL");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@privateestates.mx";
  const plainPassword = "Admin123!";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      name: "Admin",
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      name: "Admin",
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      name: true,
    },
  });

  console.log("ADMIN_OK");
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((error) => {
    console.error("ADMIN_ERROR");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
