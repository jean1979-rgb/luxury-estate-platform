import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

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
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
