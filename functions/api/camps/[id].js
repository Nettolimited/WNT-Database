import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestGet({ env, params }) {
  const row = await env.DB.prepare('SELECT * FROM camps WHERE id = ?').bind(params.id).first();
  if (!row) return err('Camp not found', 404);
  return json({
    ...row,
    playerIds:    JSON.parse(row.player_ids     || '[]'),
    playerShirts: JSON.parse(row.player_shirts  || '{}'),
  });
}

export async function onRequestPut({ request, env, params }) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON');
  await env.DB.prepare(
    'UPDATE camps SET name=?, camp_date=?, camp_date_end=?, competition=?, description=?, team_level=?, player_ids=?, player_shirts=? WHERE id=?'
  ).bind(
    body.name, body.campDate ?? '', body.campDateEnd ?? '', body.competition ?? '',
    body.description ?? '', body.teamLevel ?? 'Senior',
    JSON.stringify(body.playerIds ?? []),
    JSON.stringify(body.playerShirts ?? {}),
    params.id
  ).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM camps WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
