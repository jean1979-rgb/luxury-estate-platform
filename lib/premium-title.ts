type PropertyTitleInput = {
  title?: string;
  location?: string;
};

function cleanZone(value?: string) {
  const raw = String(value || "").trim();

  return raw
    .replace(/^México\s*\|\s*Guerrero\s*\|\s*Acapulco de Juárez\s*\|\s*/i, "")
    .replace(/^México\s*\|\s*Guerrero\s*\|\s*Acapulco\s*\|\s*/i, "")
    .replace(/^Fraccionamiento\s+/i, "")
    .replace(/\s*Acapulco\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildPremiumTitle(input: PropertyTitleInput) {
  const title = String(input.title || "").toLowerCase();
  const zone = cleanZone(input.location) || "Acapulco";

  if (title.includes("penthouse") || title.includes(" ph ")) {
    return `Penthouse panorámico — ${zone}`;
  }

  if (title.includes("casa") || title.includes("villa")) {
    return `Villa — ${zone}`;
  }

  if (title.includes("playa") || title.includes("mar")) {
    return `Residencia frente al mar — ${zone}`;
  }

  return `Residencia — ${zone}`;
}
