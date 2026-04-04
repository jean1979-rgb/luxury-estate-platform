import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";
import { mapTokkoToAdminProperty, isTokkoAdminItem, type TokkoAdminItem } from "./tokko-helpers";

export async function importTokkoProperty(
  raw: unknown,
  existingItems: AdminPropertyRecord[],
  slugify: (v: string) => string
): Promise<AdminPropertyInput> {
  if (!isTokkoAdminItem(raw)) {
    throw new Error("Tokko item inválido");
  }

  const item: TokkoAdminItem = raw;

  if (existingItems.some((p) => p.id === `admin-${item.id}`)) {
    throw new Error("Ya importada");
  }

  const base = mapTokkoToAdminProperty(item);

  return {
    ...base,
    slug: slugify(
      item.editorial?.title ||
      item.base?.title ||
      item.id ||
      "propiedad"
    ),
  };
}
