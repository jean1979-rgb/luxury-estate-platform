import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";

export async function saveProperty(params: {
  payload: AdminPropertyInput;
  forcedPropertyId?: string;
}): Promise<{ saved: AdminPropertyRecord }> {
  const { payload, forcedPropertyId } = params;

  const propertyId = forcedPropertyId || payload.id || undefined;

  if (!propertyId) {
    throw new Error("No se pudo guardar: falta propertyId.");
  }

  const scenesRes = await fetch(`/api/broker/scenes/${propertyId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scenes: payload.scenes360 }),
  });

  const scenesData = await scenesRes.json();

  if (!scenesRes.ok || !scenesData.ok) {
    throw new Error(scenesData.message || "No se pudieron guardar las escenas.");
  }

  const { scenes360: _ignoredScenes, ...propertyPayload } = payload;

  const res = await fetch(`/api/broker/properties/${propertyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...propertyPayload,
      id: propertyId,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.message || "No se pudo guardar la propiedad.");
  }

  const saved = data.item || data.property;

  if (!saved) {
    throw new Error("La API respondió sin item/property.");
  }

  return { saved };
}
