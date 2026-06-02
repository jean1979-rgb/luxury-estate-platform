import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";

export async function saveProperty(params: {
  payload: AdminPropertyInput;
  forcedPropertyId?: string;
}): Promise<{ saved: AdminPropertyRecord }> {
  const { payload, forcedPropertyId } = params;

  const propertyId = forcedPropertyId || payload.id || "";
  const { scenes360: _ignoredScenes, ...propertyPayload } = payload;

  let saved: AdminPropertyRecord;

  if (!propertyId) {
    const createRes = await fetch("/api/broker/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(propertyPayload),
    });

    const createData = await createRes.json();

    if (!createRes.ok || !createData.ok) {
      throw new Error(createData.message || "No se pudo crear la propiedad.");
    }

    saved = createData.item || createData.property;

    if (!saved?.id) {
      throw new Error("La API creó la propiedad pero respondió sin id.");
    }

    if (payload.scenes360.length > 0) {
      const scenesRes = await fetch(`/api/broker/scenes/${saved.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scenes: payload.scenes360 }),
      });

      const scenesData = await scenesRes.json();

      if (!scenesRes.ok || !scenesData.ok) {
        throw new Error(scenesData.message || "La propiedad se creó, pero no se pudieron guardar las escenas 360.");
      }
    }

    return { saved };
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

  saved = data.item || data.property;

  if (!saved) {
    throw new Error("La API respondió sin item/property.");
  }

  return { saved };
}
