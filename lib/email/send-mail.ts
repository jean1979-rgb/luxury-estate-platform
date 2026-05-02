import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "smtpout.secureserver.net";
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || user;

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!user || !pass || !from) {
    console.warn("SMTP no configurado. Email no enviado:", { to, subject });
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Private Estates Mexico" <${from}>`,
    to,
    subject,
    html,
  });
}
