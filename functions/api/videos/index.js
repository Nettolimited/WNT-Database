import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM videos ORDER BY created_at DESC'
  ).all();
  return json({ videos: results.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') })) });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.url) return err('title and url required', 400);
  const id = 'v_' + Date.now();
  await env.DB.prepare(
    'INSERT INTO videos (id, title, url, type, match_id, player_id, opponent, tags, notes) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(
    id,
    body.title,
    body.url,
    body.type      ?? 'match',
    body.matchId   ?? null,
    body.playerId  ?? null,
    body.opponent  ?? '',
    JSON.stringify(body.tags ?? []),
    body.notes     ?? '',
  ).run();
  return json({ ok: true, id }, 201);
}
