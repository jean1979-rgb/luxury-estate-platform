import fs from "fs/promises";
import path from "path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

function cleanUrl(value) {
  if (!value) return "";
  return String(value).replace(/\s+/g, "").trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const adminFile = path.join(process.cwd(), "data/admin/properties.json");

async function run() {
  const rl = readline.createInterface({ input, output });

  const raw = await fs.readFile(adminFile, "utf8");
  const adminItems = JSON.parse(raw);

  const adminWithScenes = adminItems
    .map((item) => {
      const scenes = Array.isArray(item.scenes360) ? item.scenes360.length : 0;
      const hotspots = Array.isArray(item.scenes360)
        ? item.scenes360.reduce(
            (acc, s) => acc + (Array.isArray(s.hotspots) ? s.hotspots.length : 0),
            0
          )
        : 0;

      return {
        id: String(item.id || ""),
        slug: String(item.slug || ""),
        title: String(item.title || ""),
        scenes,
        hotspots,
        item,
      };
    })
    .filter((x) => x.scenes > 0 || x.hotspots > 0);

  const brokerItems = await prisma.brokerProperty.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 50,
  });

  console.log("\n===== ADMIN JSON con escenas/hotspots =====");
  if (adminWithScenes.length === 0) {
    console.log("No encontré propiedades admin con escenas/hotspots.");
  } else {
    adminWithScenes.forEach((x, i) => {
      console.log(
        `${i + 1}. ${x.id} | ${x.slug} | ${x.title} | scenes=${x.scenes} | hotspots=${x.hotspots}`
      );
    });
  }

  console.log("\n===== BROKER PROPERTIES =====");
  brokerItems.forEach((x, i) => {
    console.log(`${i + 1}. ${x.id} | ${x.title} | ${x.slug}`);
  });

  const adminAnswer = await rl.question(
    "\nEscribe el NÚMERO de la propiedad ADMIN que quieres pasar a Prisma: "
  );

  const brokerAnswer = await rl.question(
    "Escribe el NÚMERO de la propiedad BROKER destino: "
  );

  await rl.close();

  const adminIndex = Number(adminAnswer) - 1;
  const brokerIndex = Number(brokerAnswer) - 1;

  if (!Number.isInteger(adminIndex) || !adminWithScenes[adminIndex]) {
    throw new Error("Selección ADMIN inválida.");
  }

  if (!Number.isInteger(brokerIndex) || !brokerItems[brokerIndex]) {
    throw new Error("Selección BROKER inválida.");
  }

  const source = adminWithScenes[adminIndex].item;
  const target = brokerItems[brokerIndex];

  await prisma.sceneHotspot.deleteMany({
    where: {
      scene: {
        propertyId: target.id,
      },
    },
  });

  await prisma.propertyScene360.deleteMany({
    where: { propertyId: target.id },
  });

  await prisma.brokerProperty.update({
    where: { id: target.id },
    data: {
      title: source.title || undefined,
      slug: source.slug || undefined,
      status: source.status || undefined,
      propertyType: source.propertyType || undefined,
      location: source.location || undefined,
      price: source.price || undefined,
      currency: source.currency || undefined,
      bedrooms: Number.isFinite(Number(source.bedrooms)) ? Number(source.bedrooms) : undefined,
      bathrooms: Number.isFinite(Number(source.bathrooms)) ? Number(source.bathrooms) : undefined,
      areaInterior: Number.isFinite(Number(source.areaInterior)) ? Number(source.areaInterior) : undefined,
      areaTotal: Number.isFinite(Number(source.areaTotal)) ? Number(source.areaTotal) : undefined,
      coverImage: cleanUrl(source.coverImage) || undefined,
      gallery: Array.isArray(source.gallery) ? source.gallery.map(cleanUrl) : undefined,
      tagline: source.tagline || undefined,
      description: source.description || undefined,
      luxuryScore: Number.isFinite(Number(source.luxuryScore)) ? Number(source.luxuryScore) : undefined,
      featured: Boolean(source.featured),
      published: Boolean(source.published),
      scenes360: source.scenes360 ?? undefined,
    },
  });

  const scenes = Array.isArray(source.scenes360) ? source.scenes360 : [];

  for (let i = 0; i < scenes.length; i += 1) {
    const scene = scenes[i];

    const createdScene = await prisma.propertyScene360.create({
      data: {
        propertyId: target.id,
        title: String(scene.title || `Escena ${i + 1}`).trim(),
        image: cleanUrl(scene.image),
        thumbnail: cleanUrl(scene.thumbnail || scene.image) || null,
        initialYaw: Number.isFinite(Number(scene.initialYaw)) ? Number(scene.initialYaw) : 0,
        initialPitch: Number.isFinite(Number(scene.initialPitch)) ? Number(scene.initialPitch) : 0,
        sortOrder: i,
      },
    });

    const hotspots = Array.isArray(scene.hotspots) ? scene.hotspots : [];

    for (let j = 0; j < hotspots.length; j += 1) {
      const h = hotspots[j];

      await prisma.sceneHotspot.create({
        data: {
          sceneId: createdScene.id,
          pitch: Number.isFinite(Number(h.pitch)) ? Number(h.pitch) : 0,
          yaw: Number.isFinite(Number(h.yaw)) ? Number(h.yaw) : 0,
          label: String(h.label || `Hotspot ${j + 1}`).trim(),
          targetSceneId: h.targetSceneId ? slugify(h.targetSceneId) : null,
          type: h.type || "nav",
        },
      });
    }
  }

  const scenesCount = await prisma.propertyScene360.count({
    where: { propertyId: target.id },
  });

  const hotspotsCount = await prisma.sceneHotspot.count({
    where: {
      scene: {
        propertyId: target.id,
      },
    },
  });

  console.log("\n===== MIGRACIÓN OK =====");
  console.log(JSON.stringify({
    ok: true,
    adminSourceId: source.id,
    brokerTargetId: target.id,
    brokerTargetTitle: target.title,
    scenes: scenesCount,
    hotspots: hotspotsCount,
  }, null, 2));
}

run()
  .catch((error) => {
    console.error("\nERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
