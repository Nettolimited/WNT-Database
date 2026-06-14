import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

// GET /api/staff
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM staff ORDER BY name ASC').all();
  return json({ staff: results });
}

// POST /api/staff
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.id) return err('id is required');

  await env.DB.prepare(`
    INSERT INTO staff (id, name, thai_name, nickname, role_category, photo_url, photo_scale, personal_info, active, dob, age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.id,
    body.name || '',
    body.thai_name || '',
    body.nickname || '',
    body.role_category || '',
    body.photo_url || '',
    body.photo_scale || 1.0,
    body.personal_info || '',
    body.active ?? 1,
    body.dob || '',
    body.age !== undefined ? body.age : null
  ).run();

  return json({ ok: true, id: body.id });
}
