import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";

export async function saveProperty(params: {
  payload: AdminPropertyInput;
  forcedPropertyId?: string | null;
}): Promise<{ saved: AdminPropertyRecord }> {
  const { payload, forcedPropertyId } = params;

  const propertyId = forcedPropertyId || payload.id || undefined;

  if (propertyId) {
    const sceneRes = await fetch(`/api/broker/scenes/${propertyId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scenes: payload.scenes360,
      }),
    });

    const sceneData = await sceneRes.json();

    if (!sceneRes.ok || !sceneData.ok) {
      throw new Error(sceneData.message || "No se pudieron guardar las escenas.");
    }
  }

  const res = await fetch("/api/broker/properties", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      ...(propertyId ? { id: propertyId } : {}),
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.message || "No se pudo guardar la propiedad.");
  }

  return {
    saved: data.property as AdminPropertyRecord,
  };
}
