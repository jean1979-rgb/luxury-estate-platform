import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email/send-mail";

function formatPrice(price?: string | null, currency?: string | null) {
  const raw = String(price ?? "").trim();

  if (!raw) return "Precio disponible bajo solicitud";
  if (/bajo solicitud/i.test(raw)) return raw;

  const clean = raw.replace(/[$,\s]/g, "");
  const numericPrice = Number(clean);

  const formatted = Number.isFinite(numericPrice)
    ? `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(numericPrice)}`
    : raw;

  return `${formatted}${currency ? ` ${currency}` : ""}`;
}

function formatArea(value?: number | null) {
  if (value == null) return "N/D";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} m²`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const propertyId = String(body.propertyId || "").trim();
    const recipientEmail = String(body.recipientEmail || "").trim();
    const recipientName = String(body.recipientName || "").trim();
    const customMessage = String(body.message || "").trim();

    if (!propertyId) {
      return NextResponse.json({ error: "Falta propertyId." }, { status: 400 });
    }

    if (!recipientEmail || !recipientEmail.includes("@")) {
      return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
    }

    const property = await prisma.brokerProperty.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Propiedad no encontrada." }, { status: 404 });
    }

    const publicUrl = `https://privateestatesmexico.com/properties/${property.slug || property.id}`;
    const price = formatPrice(property.price, property.currency);
    const area = formatArea(property.areaTotal ?? property.areaInterior);
    const coverImage = property.coverImage || "";
    const greeting = recipientName ? `Estimado(a) ${escapeHtml(recipientName)},` : "Hola,";
    const subject = `${property.title} | Private Estates Mexico`;

    const html = `
      <div style="margin:0;padding:0;background:#080808;color:#f5f1eb;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:720px;margin:0 auto;padding:32px 18px;">
          <div style="border:1px solid rgba(255,255,255,0.12);background:#111;padding:28px;">
            <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#d6c3a1;">
              Private Estates Mexico
            </div>

            ${coverImage ? `
              <div style="margin-top:24px;">
                <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(property.title)}" style="display:block;width:100%;max-height:420px;object-fit:cover;border:1px solid rgba(255,255,255,0.12);" />
              </div>
            ` : ""}

            <h1 style="margin:26px 0 0;font-size:34px;line-height:1.05;font-weight:300;color:#ffffff;">
              ${escapeHtml(property.title)}
            </h1>

            ${property.tagline ? `
              <p style="margin:16px 0 0;font-size:16px;line-height:1.7;color:rgba(245,241,235,0.76);">
                ${escapeHtml(property.tagline)}
              </p>
            ` : ""}

            <div style="margin-top:26px;border-top:1px solid rgba(255,255,255,0.12);border-bottom:1px solid rgba(255,255,255,0.12);padding:18px 0;">
              <div style="font-size:14px;line-height:1.9;color:rgba(245,241,235,0.78);">
                <strong style="color:#ffffff;">Precio:</strong> ${escapeHtml(price)}<br />
                <strong style="color:#ffffff;">Ubicación:</strong> ${escapeHtml(property.location || property.city || "Ubicación premium")}<br />
                <strong style="color:#ffffff;">Recámaras:</strong> ${escapeHtml(property.bedrooms ?? "N/D")}<br />
                <strong style="color:#ffffff;">Baños:</strong> ${escapeHtml(property.bathrooms ?? "N/D")}<br />
                <strong style="color:#ffffff;">Superficie:</strong> ${escapeHtml(area)}
              </div>
            </div>

            <p style="margin:26px 0 0;font-size:15px;line-height:1.8;color:rgba(245,241,235,0.74);">
              ${greeting}
            </p>

            ${customMessage ? `
              <p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:rgba(245,241,235,0.74);">
                ${escapeHtml(customMessage).replaceAll("\n", "<br />")}
              </p>
            ` : `
              <p style="margin:14px 0 0;font-size:15px;line-height:1.8;color:rgba(245,241,235,0.74);">
                Le compartimos esta propiedad seleccionada dentro de Private Estates Mexico.
              </p>
            `}

            <div style="margin-top:28px;">
              <a href="${escapeHtml(publicUrl)}" style="display:inline-block;border:1px solid #d6c3a1;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;">
                Ver propiedad
              </a>
            </div>

            <p style="margin:30px 0 0;font-size:13px;line-height:1.7;color:rgba(245,241,235,0.48);">
              Si desea información adicional o agendar una visita privada, estaremos encantados de asistirle.
            </p>
          </div>
        </div>
      </div>
    `;

    await sendMail({
      to: recipientEmail,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("share-property error", error);
    return NextResponse.json({ error: "No se pudo enviar la propiedad." }, { status: 500 });
  }
}
