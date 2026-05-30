import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

// GET /api/camp-staff?camp_id=
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const campId = url.searchParams.get('camp_id');

  if (!campId) return err('camp_id required');

  const { results } = await env.DB.prepare(
    'SELECT * FROM camp_staff WHERE camp_id=? ORDER BY created_at ASC'
  ).bind(campId).all();

  return json({ staff: results });
}

// POST — Insert or Update staff
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.camp_id || !body?.name || !body?.role)
    return err('camp_id, name, role are required');

  if (body.id) {
    // Update existing
    await env.DB.prepare(`
      UPDATE camp_staff SET
        name = ?, role = ?, notes = ?
      WHERE id = ? AND camp_id = ?
    `).bind(
      body.name, body.role, body.notes || '', body.id, body.camp_id
    ).run();
  } else {
    // Insert new
    await env.DB.prepare(`
      INSERT INTO camp_staff (camp_id, name, role, notes)
      VALUES (?, ?, ?, ?)
    `).bind(
      body.camp_id, body.name, body.role, body.notes || ''
    ).run();
  }

  return json({ ok: true });
}

// DELETE /api/camp-staff?id=
export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return err('id required');

  await env.DB.prepare('DELETE FROM camp_staff WHERE id=?').bind(id).run();
  return json({ ok: true });
}
