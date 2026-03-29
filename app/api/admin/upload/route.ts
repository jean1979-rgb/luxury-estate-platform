export async function POST() {
  return new Response(
    JSON.stringify({ error: "Upload desactivado en producción" }),
    { status: 403 }
  );
}
