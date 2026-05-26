// R2 image upload + retrieval.
// GET  /api/assets/{key}  → serve image from R2
// PUT  /api/assets/{key}  → upload image (body = raw bytes, Content-Type header required)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestGet({ env, params }) {
  if (!env.IMAGES) return new Response('R2 not configured', { status: 503 });

  const key = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const obj = await env.IMAGES.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers(CORS);
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
}

export async function onRequestPut({ request, env, params }) {
  if (!env.IMAGES) return new Response('R2 not configured', { status: 503 });

  const key = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const ct  = request.headers.get('Content-Type') || 'application/octet-stream';
  await env.IMAGES.put(key, request.body, { httpMetadata: { contentType: ct } });

  return Response.json({ ok: true, key }, { headers: CORS });
}
