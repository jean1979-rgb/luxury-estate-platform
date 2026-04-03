import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import fs from "fs/promises";
import path from "path";

const file = path.join(process.cwd(), "data/admin/properties.json");

function cleanUrl(url) {
  if (!url) return "";
  return String(url).replace(/\s+/g, "").trim();
}

async function run() {
  const raw = await fs.readFile(file, "utf8");
  const items = JSON.parse(raw);

  console.log("Total admin properties:", items.length);

  for (const item of items) {
    const property = await prisma.brokerProperty.upsert({
      where: {
        ownerBrokerId_slug: {
          ownerBrokerId: "admin-migrated",
          slug: item.slug,
        },
      },
      update: {},
      create: {
        ownerBrokerId: "admin-migrated",
        title: item.title,
        slug: item.slug,
        city: item.location || "Acapulco",
      },
    });

    await prisma.propertyScene360.deleteMany({
      where: { propertyId: property.id },
    });

    if (Array.isArray(item.scenes360)) {
      let order = 0;

      for (const scene of item.scenes360) {
        const createdScene = await prisma.propertyScene360.create({
          data: {
            propertyId: property.id,
            title: scene.title || "Scene",
            image: cleanUrl(scene.image),
            thumbnail: cleanUrl(scene.thumbnail || scene.image),
            initialYaw: scene.initialYaw ?? 0,
            initialPitch: scene.initialPitch ?? 0,
            sortOrder: order++,
          },
        });

        if (Array.isArray(scene.hotspots)) {
          for (const h of scene.hotspots) {
            await prisma.sceneHotspot.create({
              data: {
                sceneId: createdScene.id,
                pitch: h.pitch,
                yaw: h.yaw,
                label: h.label || "",
                targetSceneId: h.targetSceneId || null,
                type: h.type || "nav",
              },
            });
          }
        }
      }
    }

    console.log("Migrated:", item.title);
  }

  console.log("DONE");
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
