import { json, err, deserialize, serialize } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestGet({ env, params }) {
  const row = await env.DB.prepare('SELECT * FROM players WHERE id = ?')
    .bind(params.id).first();
  if (!row) return err('Player not found', 404);
  return json(deserialize(row));
}

export async function onRequestPut({ request, env, params }) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON');

  const s = serialize(body);
  const result = await env.DB.prepare(`
    UPDATE players SET
      active=?, nick=?, name=?, thai_name=?, pos=?, alt_pos=?, dob=?, foot=?, height=?,
      team=?, club=?, shirt=?, caps=?, int_goals=?, stats=?, int_stats=?,
      radar=?, career=?, photo_key=?, updated_at=?
    WHERE id=?
  `).bind(
    s.active, s.nick, s.name, s.thai_name, s.pos, s.alt_pos, s.dob, s.foot, s.height,
    s.team, s.club, s.shirt, s.caps, s.int_goals, s.stats, s.int_stats,
    s.radar, s.career, s.photo_key, s.updated_at,
    params.id
  ).run();

  if (result.meta.changes === 0) return err('Player not found', 404);
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM players WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
