import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

// GET /api/camp-schedules?camp_id=
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const campId = url.searchParams.get('camp_id');

  if (!campId) return err('camp_id required');

  const { results } = await env.DB.prepare(
    'SELECT * FROM camp_schedules WHERE camp_id=? ORDER BY schedule_date ASC, time_start ASC'
  ).bind(campId).all();

  return json({ schedules: results });
}

// POST — Insert or Update schedule
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.camp_id || !body?.schedule_date || !body?.time_start || !body?.time_end || !body?.title)
    return err('camp_id, schedule_date, time_start, time_end, title are required');

  if (body.id) {
    // Update existing
    await env.DB.prepare(`
      UPDATE camp_schedules SET
        schedule_date = ?, time_start = ?, time_end = ?, title = ?, type = ?, notes = ?, video_url = ?
      WHERE id = ? AND camp_id = ?
    `).bind(
      body.schedule_date, body.time_start, body.time_end, body.title,
      body.type || 'Training', body.notes || '', body.video_url || '',
      body.id, body.camp_id
    ).run();
  } else {
    // Insert new
    await env.DB.prepare(`
      INSERT INTO camp_schedules (camp_id, schedule_date, time_start, time_end, title, type, notes, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.camp_id, body.schedule_date, body.time_start, body.time_end, body.title,
      body.type || 'Training', body.notes || '', body.video_url || ''
    ).run();
  }

  return json({ ok: true });
}

// DELETE /api/camp-schedules?id=
export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return err('id required');

  await env.DB.prepare('DELETE FROM camp_schedules WHERE id=?').bind(id).run();
  return json({ ok: true });
}
