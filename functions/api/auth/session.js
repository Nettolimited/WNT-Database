import { authConfigured, getSession } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const session = await getSession(request, env);
  return Response.json({ authenticated: Boolean(session), role: session?.role || null, configured: authConfigured(env) }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
