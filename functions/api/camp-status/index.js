import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

// GET /api/camp-status?camp_id=xxx
export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const campId = url.searchParams.get('camp_id');
  if (!campId) return err('camp_id required');
  const { results } = await env.DB.prepare(
    'SELECT * FROM camp_player_status WHERE camp_id = ?'
  ).bind(campId).all();
  return json({ statuses: results });
}

// POST /api/camp-status  — upsert one player's status
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.camp_id || !body?.player_id) return err('camp_id and player_id required');

  await env.DB.prepare(`
    INSERT INTO camp_player_status
      (camp_id, player_id, status, injury_note, sleep, soreness, mood, rpe, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(camp_id, player_id) DO UPDATE SET
      status      = excluded.status,
      injury_note = excluded.injury_note,
      sleep       = excluded.sleep,
      soreness    = excluded.soreness,
      mood        = excluded.mood,
      rpe         = excluded.rpe,
      notes       = excluded.notes,
      updated_at  = excluded.updated_at
  `).bind(
    body.camp_id,
    body.player_id,
    body.status      ?? 'available',
    body.injury_note ?? '',
    body.sleep       ?? 0,
    body.soreness    ?? 0,
    body.mood        ?? 0,
    body.rpe         ?? 0,
    body.notes       ?? '',
  ).run();

  return json({ ok: true });
}
