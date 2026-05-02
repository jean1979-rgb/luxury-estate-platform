import nodemailer from "nodemailer";

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  console.log("📨 sendMail START", { to, subject });

  if (!host || !port || !user || !pass || !from) {
    console.warn("❌ SMTP no configurado correctamente", {
      host,
      port,
      user,
      pass: pass ? "***" : undefined,
      from,
    });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    console.log("📨 sending email...");

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("✅ EMAIL SENT");
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
  }
}
