import { json } from '../_shared.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM clubs ORDER BY name'
  ).all();
  return json({ clubs: results });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  const code    = (body?.code    || '').trim().toUpperCase();
  const name    = (body?.name    || '').trim();
  const color   = (body?.color   || '#888888').trim();
  const country = (body?.country || '').trim().toUpperCase().slice(0, 3);
  if (!code || !name) return json({ error: 'code and name required' }, 400);
  try {
    await env.DB.prepare(
      'INSERT INTO clubs (code, name, color, logo_key, country) VALUES (?,?,?,?,?)'
    ).bind(code, name, color, null, country).run();
    return json({ ok: true, code }, 201);
  } catch (e) {
    return json({ error: 'Club code already exists or invalid' }, 409);
  }
}

export async function onRequestPut({ request, env, params }) {
  const body = await request.json().catch(() => null);
  if (!body?.code) return json({ error: 'code required' }, 400);
  const country = (body?.country || '').trim().toUpperCase().slice(0, 3);
  await env.DB.prepare(
    'UPDATE clubs SET name=?, color=?, logo_key=?, country=? WHERE code=?'
  ).bind(body.name, body.color, body.logo_key ?? null, country, body.code).run();
  return json({ ok: true });
}
