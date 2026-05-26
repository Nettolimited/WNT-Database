import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

// GET /api/camp-wellness?camp_id=&session_date=&session=AM
// or  /api/camp-wellness?camp_id=&player_id=  (history for one player)
export async function onRequestGet({ request, env }) {
  const url      = new URL(request.url);
  const campId   = url.searchParams.get('camp_id');
  const date     = url.searchParams.get('session_date');
  const session  = url.searchParams.get('session');
  const playerId = url.searchParams.get('player_id');

  if (!campId) return err('camp_id required');

  let rows;
  if (playerId) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM camp_wellness WHERE camp_id=? AND player_id=? ORDER BY session_date DESC, session DESC LIMIT 60'
    ).bind(campId, playerId).all();
    rows = results;
  } else if (date && session) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM camp_wellness WHERE camp_id=? AND session_date=? AND session=?'
    ).bind(campId, date, session).all();
    rows = results;
  } else if (date) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM camp_wellness WHERE camp_id=? AND session_date=?'
    ).bind(campId, date).all();
    rows = results;
  } else {
    return err('session_date or player_id required');
  }

  return json({ entries: rows });
}

// POST — upsert one entry
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.camp_id || !body?.player_id || !body?.session_date || !body?.session)
    return err('camp_id, player_id, session_date, session required');

  await env.DB.prepare(`
    INSERT INTO camp_wellness
      (camp_id, player_id, session_date, session,
       stress, sleep, appetite, mood, soreness, desire,
       rpe, duration, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(camp_id, player_id, session_date, session) DO UPDATE SET
      stress   = excluded.stress,
      sleep    = excluded.sleep,
      appetite = excluded.appetite,
      mood     = excluded.mood,
      soreness = excluded.soreness,
      desire   = excluded.desire,
      rpe      = excluded.rpe,
      duration = excluded.duration,
      notes    = excluded.notes
  `).bind(
    body.camp_id, body.player_id, body.session_date, body.session,
    body.stress   ?? 0,
    body.sleep    ?? 0,
    body.appetite ?? 0,
    body.mood     ?? 0,
    body.soreness ?? 0,
    body.desire   ?? 0,
    body.rpe      ?? 0,
    body.duration ?? 0,
    body.notes    ?? '',
  ).run();

  return json({ ok: true });
}
