import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

export async function onRequestGet({ env, params }) {
  const row = await env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(params.id).first();
  if (!row) return err('Not found', 404);
  return json({ ...row, tags: JSON.parse(row.tags || '[]') });
}

export async function onRequestPut({ request, env, params }) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON');
  await env.DB.prepare(
    'UPDATE videos SET title=?, url=?, type=?, match_id=?, player_id=?, opponent=?, tags=?, notes=? WHERE id=?'
  ).bind(
    body.title,
    body.url,
    body.type      ?? 'match',
    body.matchId   ?? null,
    body.playerId  ?? null,
    body.opponent  ?? '',
    JSON.stringify(body.tags ?? []),
    body.notes     ?? '',
    params.id,
  ).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
