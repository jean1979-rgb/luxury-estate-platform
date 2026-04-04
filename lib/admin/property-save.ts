import type { AdminPropertyInput, AdminPropertyRecord } from "@/types/admin";

export async function saveProperty(params: {
  payload: AdminPropertyInput;
  forcedPropertyId?: string | null;
}): Promise<
  | { mode: "studio"; propertyId: string; payload: AdminPropertyInput }
  | { mode: "property"; saved: AdminPropertyRecord }
> {
  const { payload, forcedPropertyId } = params;

  if (forcedPropertyId) {
    const sceneRes = await fetch(`/api/broker/scenes/${forcedPropertyId}`, {
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

    return {
      mode: "studio",
      propertyId: forcedPropertyId,
      payload,
    };
  }

  const res = await fetch("/api/broker/properties", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.message || "No se pudo guardar.");
  }

  return {
    mode: "property",
    saved: data.property as AdminPropertyRecord,
  };
}
