// Image proxy — fetches any HTTPS image and returns it (bypasses CORS)

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
    },
  });
}

export async function onRequestGet({ request }) {
  const reqUrl = new URL(request.url);
  const target  = reqUrl.searchParams.get('url');
  if (!target) return new Response('Missing url param', { status: 400 });

  let parsed;
  try { parsed = new URL(target); } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  // Only allow HTTPS (no local network, no HTTP)
  if (parsed.protocol !== 'https:') {
    return new Response('Only HTTPS URLs allowed', { status: 403 });
  }

  try {
    const res = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
    if (!res.ok) return new Response('Upstream error ' + res.status, { status: 502 });

    const ct  = res.headers.get('content-type') || 'image/png';
    if (!ct.startsWith('image/')) return new Response('Not an image', { status: 415 });

    const buf = await res.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response('Fetch failed: ' + e.message, { status: 502 });
  }
}
