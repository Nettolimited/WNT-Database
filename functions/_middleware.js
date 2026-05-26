// Cloudflare Access edge middleware.
// When Access is configured in the dashboard, Cloudflare rejects unauthenticated
// requests before they reach this function, so all we do here is add CORS
// headers and log the verified user identity for auditing.

export async function onRequest({ request, next }) {
  // Pre-flight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Cf-Access-Jwt-Assertion',
      },
    });
  }

  const response = await next();

  // Identify who made write operations (Access populates these headers)
  if (['POST','PUT','DELETE'].includes(request.method)) {
    const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'anonymous';
    response.headers.set('X-Acted-By', email);
  }

  return response;
}
