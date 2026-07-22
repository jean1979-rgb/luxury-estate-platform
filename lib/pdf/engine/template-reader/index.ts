import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadTemplateJson(page: number) {
  const file = path.join(
    process.cwd(),
    "lib",
    "pdf",
    "templates-json",
    `page${page}.json`,
  );

  return JSON.parse(await readFile(file, "utf8"));
}
