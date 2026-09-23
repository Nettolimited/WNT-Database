const COOKIE_NAME = 'wnt_staff_session';

function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const part = raw.split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : '';
}

export function authConfigured(env) {
  return Boolean(env.STAFF_PASSWORD_HASH && env.AUTH_SECRET);
}

export async function passwordMatches(password, env) {
  if (!authConfigured(env) || typeof password !== 'string') return false;
  return safeEqual(await sha256(password), String(env.STAFF_PASSWORD_HASH).trim().toLowerCase());
}

export async function makeSessionCookie(env) {
  const expires = Math.floor(Date.now() / 1000) + (12 * 60 * 60);
  const payload = `medical.${expires}`;
  const signature = await sign(payload, env.AUTH_SECRET);
  return `${COOKIE_NAME}=${encodeURIComponent(`${payload}.${signature}`)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function getSession(request, env) {
  if (!authConfigured(env)) return null;
  const token = readCookie(request, COOKIE_NAME);
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'medical') return null;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return null;
  const expected = await sign(`${parts[0]}.${parts[1]}`, env.AUTH_SECRET);
  return safeEqual(expected, parts[2]) ? { role: 'medical', expires } : null;
}

export async function requireMedical(request, env) {
  const session = await getSession(request, env);
  if (session) return null;
  return Response.json({ error: 'Login required' }, {
    status: 401,
    headers: { 'Cache-Control': 'no-store', 'WWW-Authenticate': 'Session' }
  });
}
