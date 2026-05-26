import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}

export async function onRequestGet({ env, params }) {
  const row = await env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(params.id).first();
  if (!row) return err('Match not found', 404);
  return json({ ...row, lineup: JSON.parse(row.lineup || '[]'), is_private: !!row.is_private });
}

export async function onRequestPut({ request, env, params }) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON');
  await env.DB.prepare(
    'UPDATE matches SET opponent=?, competition=?, match_date=?, home_score=?, away_score=?, team_level=?, lineup=?, notes=?, is_private=? WHERE id=?'
  ).bind(
    body.opponent,
    body.competition  ?? '',
    body.matchDate    ?? '',
    body.homeScore    ?? 0,
    body.awayScore    ?? 0,
    body.teamLevel    ?? 'Senior',
    JSON.stringify(body.lineup ?? []),
    body.notes        ?? '',
    body.isPrivate    ? 1 : 0,
    params.id,
  ).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM matches WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
