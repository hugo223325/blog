export async function onRequest(context) {
  return new Response(JSON.stringify({ ok: true, from: "pages-function" }), {
    headers: { "Content-Type": "application/json" },
  });
}
