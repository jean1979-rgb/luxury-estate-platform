import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@privateestates.mx";
  const password = "Admin12345!";
  const passwordHash = await bcrypt.hash(password, 10);

  const exists = await prisma.user.findUnique({
    where: { email },
  });

  if (exists) {
    console.log("Admin ya existe");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Private Estates Admin",
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin creado:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
