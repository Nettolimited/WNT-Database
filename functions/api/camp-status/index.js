import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

// GET /api/camp-status?camp_id=xxx&report_date=yyy&player_id=zzz
export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const campId = url.searchParams.get('camp_id');
  const reportDate = url.searchParams.get('report_date');
  const playerId = url.searchParams.get('player_id');
  if (!campId) return err('camp_id required');
  
  if (playerId) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM camp_player_status WHERE camp_id = ? AND player_id = ? ORDER BY report_date DESC'
    ).bind(campId, playerId).all();
    return json({ statuses: results });
  }
  
  if (reportDate) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM camp_player_status WHERE camp_id = ? AND report_date = ?'
    ).bind(campId, reportDate).all();
    return json({ statuses: results });
  } else {
    // Latest status per player (simplified fallback)
    const { results } = await env.DB.prepare(
      'SELECT *, MAX(report_date) FROM camp_player_status WHERE camp_id = ? GROUP BY player_id'
    ).bind(campId).all();
    return json({ statuses: results });
  }
}

// POST /api/camp-status  — upsert one player's status
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.camp_id || !body?.player_id) return err('camp_id and player_id required');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const rDate = body.report_date || today;

  await env.DB.prepare(`
    INSERT INTO camp_player_status
      (camp_id, player_id, report_date, status, injury_note, sleep, soreness, mood, rpe, notes, updated_at,
       symptom_date, rest_days, can_train, treatment_plan, body_parts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)
    ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET
      status         = excluded.status,
      injury_note    = excluded.injury_note,
      sleep          = excluded.sleep,
      soreness       = excluded.soreness,
      mood           = excluded.mood,
      rpe            = excluded.rpe,
      notes          = excluded.notes,
      updated_at     = excluded.updated_at,
      symptom_date   = excluded.symptom_date,
      rest_days      = excluded.rest_days,
      can_train      = excluded.can_train,
      treatment_plan = excluded.treatment_plan,
      body_parts     = excluded.body_parts
  `).bind(
    body.camp_id,
    body.player_id,
    rDate,
    body.status         ?? 'available',
    body.injury_note    ?? '',
    body.sleep          ?? 0,
    body.soreness       ?? 0,
    body.mood           ?? 0,
    body.rpe            ?? 0,
    body.notes          ?? '',
    body.symptom_date   ?? '',
    body.rest_days      ?? '',
    body.can_train      ?? '',
    body.treatment_plan ?? '',
    body.body_parts     ?? ''
  ).run();

  return json({ ok: true });
}
