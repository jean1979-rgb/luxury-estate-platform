import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  Artboard,
  TemplateItem,
} from "../core/types";

interface TemplateDocument {
  name?: string;
  fullName?: string;
  colorSpace?: string;
  width?: number;
  height?: number;
  layers?: unknown[];
  artboards: Artboard[];
}

interface TemplateJson {
  document: TemplateDocument;
  items: TemplateItem[];
}

export interface TemplateContract {
  document(): TemplateDocument;
  artboard(index?: number): Artboard | undefined;
  field(name: string): TemplateItem | undefined;
  dynamic(name: string): TemplateItem | undefined;
}

export async function loadTemplate(
  page: number,
): Promise<TemplateContract> {
  const file = path.join(
    process.cwd(),
    "lib",
    "pdf",
    "templates",
    `page${page}.json`,
  );

  const json = JSON.parse(
    await readFile(file, "utf8"),
  ) as TemplateJson;

  const fields = new Map<string, TemplateItem>();
  const dynamics = new Map<string, TemplateItem>();

  for (const item of json.items) {
    const contractItem =
      item as TemplateItem & {
        field?: string;
        name?: string;
      };

    if (
      contractItem.field &&
      contractItem.field !== "dynamic" &&
      !fields.has(contractItem.field)
    ) {
      fields.set(
        contractItem.field,
        contractItem,
      );
    }

    if (
      contractItem.layer === "Dinámico" &&
      contractItem.field === "dynamic" &&
      contractItem.name &&
      !dynamics.has(contractItem.name)
    ) {
      dynamics.set(
        contractItem.name,
        contractItem,
      );
    }
  }

  return {
    document() {
      return json.document;
    },

    artboard(index = 0) {
      return json.document.artboards[index];
    },

    field(name: string) {
      return fields.get(name);
    },

    dynamic(name: string) {
      return dynamics.get(name);
    },
  };
}
