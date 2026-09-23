import { authConfigured, makeSessionCookie, passwordMatches } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  if (!authConfigured(env)) return Response.json({ error: 'Login has not been configured' }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  if (!(await passwordMatches(body.password, env))) {
    return Response.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  return Response.json({ ok: true, role: 'medical' }, {
    headers: { 'Set-Cookie': await makeSessionCookie(env), 'Cache-Control': 'no-store' }
  });
}
