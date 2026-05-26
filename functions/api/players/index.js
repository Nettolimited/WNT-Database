import { json, err, deserialize, serialize } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM players ORDER BY team, pos, name'
  ).all();
  return json({ players: results.map(deserialize) });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.id || !body?.name) return err('id and name are required');

  const s = serialize(body);
  await env.DB.prepare(`
    INSERT INTO players
      (id, nick, name, thai_name, pos, alt_pos, dob, foot, height, team, club,
       shirt, caps, int_goals, stats, int_stats, radar, career, photo_key, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.id, s.nick, s.name, s.thai_name, s.pos, s.alt_pos,
    s.dob, s.foot, s.height, s.team, s.club,
    s.shirt, s.caps, s.int_goals, s.stats, s.int_stats, s.radar, s.career,
    s.photo_key, s.updated_at
  ).run();

  return json({ ok: true, id: body.id }, 201);
}
