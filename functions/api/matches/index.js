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
    'SELECT * FROM matches ORDER BY match_date ASC, created_at ASC'
  ).all();
  return json({ matches: results.map(r => ({ ...r, lineup: JSON.parse(r.lineup || '[]'), is_private: !!r.is_private })) });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.opponent) return err('opponent required', 400);
  const id = body.id || ('m_' + Date.now());
  await env.DB.prepare(
    'INSERT INTO matches (id, opponent, competition, match_date, home_score, away_score, team_level, lineup, notes, is_private, fifa_rank_change, fifa_pts_change) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(
    id,
    body.opponent,
    body.competition  ?? '',
    body.matchDate    ?? '',
    body.homeScore    ?? 0,
    body.awayScore    ?? 0,
    body.teamLevel    ?? 'Senior',
    JSON.stringify(body.lineup ?? []),
    body.notes        ?? '',
    body.isPrivate    ? 1 : 0,
    body.fifaRankChange ?? 0,
    body.fifaPtsChange  ?? 0
  ).run();
  return json({ ok: true, id }, 201);
}
