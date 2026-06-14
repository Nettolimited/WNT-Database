import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

// PUT /api/staff/:id
export async function onRequestPut({ request, env, params }) {
  const { id } = params;
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid body');

  await env.DB.prepare(`
    UPDATE staff SET
      name = ?, thai_name = ?, nickname = ?, role_category = ?, photo_url = ?, photo_scale = ?, personal_info = ?, active = ?, dob = ?, age = ?
    WHERE id = ?
  `).bind(
    body.name || '',
    body.thai_name || '',
    body.nickname || '',
    body.role_category || '',
    body.photo_url || '',
    body.photo_scale || 1.0,
    body.personal_info || '',
    body.active ?? 1,
    body.dob || '',
    body.age !== undefined ? body.age : null,
    id
  ).run();

  return json({ ok: true });
}

// DELETE /api/staff/:id
export async function onRequestDelete({ env, params }) {
  const { id } = params;
  await env.DB.prepare('DELETE FROM staff WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
