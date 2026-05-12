import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { sendMail } from "../lib/email/send-mail";

async function main() {
  const email = "ksadeplayainmobiliaria@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email },
    include: { brokerProfile: true },
  });

  if (!user) {
    console.log("❌ No encontré broker con email:", email);
    return;
  }

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.privateestatesmexico.com";

  const verifyUrl = `${baseUrl}/api/broker/verify-email?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "Verifica tu cuenta en Private Estates Mexico",
    html: `
      <div style="font-family:Arial,sans-serif;background:#050505;color:#ffffff;padding:32px;">
        <div style="max-width:560px;margin:0 auto;border:1px solid rgba(255,255,255,.14);padding:28px;">
          <p style="letter-spacing:.28em;text-transform:uppercase;color:#999;font-size:11px;">Private Estates Mexico</p>
          <h1 style="font-weight:300;">Verifica tu correo</h1>
          <p style="color:#cfcfcf;line-height:1.6;">
            Para continuar con tu cuenta broker, confirma tu correo electrónico.
          </p>
          <p style="margin:28px 0;">
            <a href="${verifyUrl}" style="background:#ffffff;color:#000000;text-decoration:none;padding:14px 22px;border-radius:10px;display:inline-block;">
              Verificar cuenta
            </a>
          </p>
          <p style="color:#888;font-size:12px;line-height:1.5;">
            Este enlace expira en 24 horas. Después de verificar tu correo, tu cuenta quedará pendiente de aprobación.
          </p>
        </div>
      </div>
    `,
  });

  console.log("✅ Correo de verificación reenviado a:", user.email);
  console.log("Link:", verifyUrl);
}

main()
  .catch((error) => {
    console.error("❌ Error reenviando verificación:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
