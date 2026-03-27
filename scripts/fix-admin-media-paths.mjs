import fs from "fs/promises";
import path from "path";

const ADMIN_JSON_PATH = path.join(process.cwd(), "data", "admin", "properties.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const OLD_ROOT = path.join(PUBLIC_DIR, "uploads", "propertys");
const NEW_ROOT = path.join(PUBLIC_DIR, "uploads", "properties");

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

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function moveDirContents(sourceDir, targetDir) {
  if (!(await exists(sourceDir))) return;

  await ensureDir(targetDir);
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(sourceDir, entry.name);
    const to = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await moveDirContents(from, to);
      const leftovers = await fs.readdir(from).catch(() => []);
      if (leftovers.length === 0) {
        await fs.rmdir(from).catch(() => {});
      }
      continue;
    }

    if (await exists(to)) {
      const parsed = path.parse(entry.name);
      const stamped = `${parsed.name}-migrated-${Date.now()}${parsed.ext}`;
      await fs.rename(from, path.join(targetDir, stamped));
    } else {
      await fs.rename(from, to);
    }
  }
}

function replacePathUrl(url, oldId, newId) {
  return String(url || "")
    .replace(/\/uploads\/propertys\//g, "/uploads/properties/")
    .replace(`/uploads/properties/${oldId}/`, `/uploads/properties/${newId}/`);
}

async function main() {
  const raw = await fs.readFile(ADMIN_JSON_PATH, "utf8");
  const records = JSON.parse(raw);

  await ensureDir(NEW_ROOT);

  const migrated = [];

  for (const record of records) {
    const newSlug = slugify(record.slug || record.title || record.id || "property");
    const newId = slugify(record.id === "temp-property" ? newSlug : (record.id || newSlug));
    const oldId = record.id || newId;

    const oldDirLegacy = path.join(OLD_ROOT, oldId);
    const oldDirNewRoot = path.join(NEW_ROOT, oldId);
    const finalDir = path.join(NEW_ROOT, newId);

    if (await exists(oldDirLegacy)) {
      await moveDirContents(oldDirLegacy, finalDir);
    }

    if (oldId !== newId && await exists(oldDirNewRoot)) {
      await moveDirContents(oldDirNewRoot, finalDir);
    }

    const next = {
      ...record,
      id: newId,
      slug: newSlug,
      coverImage: replacePathUrl(record.coverImage, oldId, newId),
      gallery: Array.isArray(record.gallery)
        ? record.gallery.map((item) => replacePathUrl(item, oldId, newId))
        : [],
      scenes360: Array.isArray(record.scenes360)
        ? record.scenes360.map((scene, index) => ({
            ...scene,
            id: slugify(scene.id || scene.title || `scene-${index + 1}`),
            title: scene.title || `Escena ${index + 1}`,
            image: replacePathUrl(scene.image, oldId, newId),
            thumbnail: replacePathUrl(scene.thumbnail || scene.image, oldId, newId),
            hotspots: Array.isArray(scene.hotspots) ? scene.hotspots : [],
          }))
        : [],
      updatedAt: new Date().toISOString(),
    };

    migrated.push(next);
  }

  migrated.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  await fs.writeFile(ADMIN_JSON_PATH, JSON.stringify(migrated, null, 2), "utf8");

  console.log(JSON.stringify({
    ok: true,
    properties: migrated.length,
    wrote: "data/admin/properties.json",
    uploadsRoot: "public/uploads/properties"
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
