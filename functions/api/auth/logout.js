import { clearSessionCookie } from '../_auth.js';

export async function onRequestPost() {
  return Response.json({ ok: true }, {
    headers: { 'Set-Cookie': clearSessionCookie(), 'Cache-Control': 'no-store' }
  });
}
