import fs from "fs/promises";
import path from "path";

const API_KEY = process.env.TOKKO_API_KEY;

if (!API_KEY) {
  console.error("Falta TOKKO_API_KEY en .env.local");
  process.exit(1);
}

const OUT_FILE = path.join(process.cwd(), "data/platform/properties.json");

function firstNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function getOperationType(op = {}) {
  const raw =
    op?.operation_type_id ??
    op?.operation_id ??
    op?.type ??
    op?.operation_type;

  if (typeof raw === "number" && Number.isFinite(raw)) return raw;

  const value = String(raw || "").toLowerCase().trim();

  if (
    value.includes("tempor") ||
    value.includes("vacacion") ||
    value.includes("night")
  ) return 3;

  if (
    value.includes("rent") ||
    value.includes("renta") ||
    value.includes("alquiler") ||
    value.includes("lease")
  ) return 2;

  if (
    value.includes("sale") ||
    value.includes("venta")
  ) return 1;

  return null;
}

function normalizeOperation(operations = [], hasTemporaryRent = false) {
  const types = new Set(
    operations
      .map((op) => getOperationType(op))
      .filter(Boolean)
  );

  if (types.has(1) && (types.has(2) || types.has(3) || hasTemporaryRent)) {
    return "sale_and_rent";
  }
  if (types.has(3) || hasTemporaryRent) return "temporary_rent";
  if (types.has(2)) return "rent";
  return "sale";
}

function getOperationPrice(op = {}) {
  const directPrice = firstNumber(op?.price);
  if (directPrice !== null) {
    return {
      price: directPrice,
      currency: op?.currency || "MXN",
    };
  }

  if (Array.isArray(op?.prices)) {
    for (const entry of op.prices) {
      const nestedPrice = firstNumber(entry?.price);
      if (nestedPrice !== null) {
        return {
          price: nestedPrice,
          currency: entry?.currency || op?.currency || "MXN",
        };
      }
    }
  }

  return {
    price: null,
    currency: op?.currency || "MXN",
  };
}

function getMainPrice(operations = [], operationMode = "sale") {
  if (!Array.isArray(operations) || operations.length === 0) {
    return { price: null, currency: "MXN" };
  }

  const typePriority =
    operationMode === "sale" ? [1, 2, 3]
    : operationMode === "rent" ? [2, 3, 1]
    : operationMode === "temporary_rent" ? [3, 2, 1]
    : [1, 2, 3];

  for (const type of typePriority) {
    const found = operations.find((op) => getOperationType(op) === type);
    if (found) {
      const pricing = getOperationPrice(found);
      if (pricing.price !== null) return pricing;
    }
  }

  for (const op of operations) {
    const pricing = getOperationPrice(op);
    if (pricing.price !== null) return pricing;
  }

  return { price: null, currency: "MXN" };
}

function pickImages(item) {
  if (!Array.isArray(item?.photos)) return [];
  return item.photos
    .map((p) => p?.image || p?.url || p?.big || p?.original)
    .filter(Boolean);
}

function pickVideos(item) {
  if (!Array.isArray(item?.videos)) return [];
  return item.videos
    .map((v) => v?.url || v?.link || v?.video || v)
    .filter(Boolean);
}

function pickLocation(item) {
  const parts = [
    item?.location?.full_location,
    item?.location?.name,
    item?.location?.short_location,
    item?.address,
  ].filter(Boolean);

  return parts[0] || "Ubicación premium";
}

function isLuxuryEligible(item, normalizedPrice) {
  const rawLocation = JSON.stringify(item?.location || "").toLowerCase();
  const title = String(item?.publication_title || item?.title || "").toLowerCase();

  const zoneBoost =
    rawLocation.includes("brisas") ||
    rawLocation.includes("diamante") ||
    rawLocation.includes("playa") ||
    rawLocation.includes("cabo") ||
    rawLocation.includes("punta mita") ||
    rawLocation.includes("riviera maya");

  return (normalizedPrice !== null && normalizedPrice >= 20000000) || zoneBoost || title.includes("luxury");
}

function normalizeTokkoProperty(item) {
  const tokkoId = item?.id?.toString?.() || item?.id_property?.toString?.() || crypto.randomUUID();
  const operationMode = normalizeOperation(item?.operations || [], Boolean(item?.has_temporary_rent));
  const pricing = getMainPrice(item?.operations || [], operationMode);

// 🔥 FILTRO HARD >= 15M
if (!pricing.price || pricing.price < 15000000) {
  return null;
}
  const images = pickImages(item);
  const videos = pickVideos(item);
  

  return {
    id: `tokko-${tokkoId}`,
    source: "tokko",
    tokkoId,
    operationMode,
    base: {
      title: item?.publication_title || item?.title || "Propiedad de lujo",
      description: item?.description || "",
      locationLabel: pickLocation(item),
      publicUrl: item?.public_url || "",
      price: pricing.price,
      currency: pricing.currency,
      lat: item?.geo_lat ?? null,
      lng: item?.geo_long ?? null,
      videos,
      images,
    },
    editorial: {
      title: item?.publication_title || item?.title || "Propiedad de lujo",
      tagline: "",
      descriptionLuxury: "",
      featuredPlatform: false,
      collection: "",
      brokerName: "Casa de Playa Inmobiliaria",
    },
    media: {
      videoType: videos.length ? "youtube" : undefined,
      videoUrl: videos[0] || "",
      videoPoster: images[0] || "",
      matterportUrl: "",
      scenes360: [],
    },
    rental: {
      enabled: operationMode === "rent" || operationMode === "temporary_rent" || operationMode === "sale_and_rent",
      temporary: operationMode === "temporary_rent",
      pricePerNight: operationMode === "temporary_rent" ? pricing.price : null,
      pricePerWeek: null,
      pricePerMonth: operationMode === "rent" ? pricing.price : null,
      minNights: null,
      maxGuests: null,
      servicesIncluded: [],
      seasonPricing: operationMode === "temporary_rent",
    },
    map: {
      showMap: true,
      mapMode: "approx",
      googleMapsUrl: "",
    },
    lifestyle: {
      luxuryPartners: [],
      experiences: [],
      lifestyleTags: [],
    },
    status: {
      published: false,
      featured: false,
      
    },
  };
}

async function fetchTokko() {
  const url = `https://www.tokkobroker.com/api/v1/property/?lang=es_ar&format=json&limit=200&key=${API_KEY}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } }).filter(Boolean);

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Tokko ${res.status}: ${txt}`);
  }

  return res.json();
}

const data = await fetchTokko();
const objects = Array.isArray(data?.objects) ? data.objects : [];
const normalized = objects.map(normalizeTokkoProperty);
const onlyLuxury = normalized.filter(Boolean);

await fs.writeFile(OUT_FILE, JSON.stringify(onlyLuxury, null, 2), "utf8");

console.log(JSON.stringify({
  ok: true,
  fetched: objects.length,
  luxury: onlyLuxury.length,
  wrote: "data/platform/properties.json"
}, null, 2));
