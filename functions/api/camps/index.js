import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM camps ORDER BY camp_date DESC, created_at DESC'
  ).all();

  // Fetch all camp staff relations
  const { results: staffRelations } = await env.DB.prepare(
    'SELECT camp_id, staff_id, role FROM camp_staff'
  ).all();

  // Group by camp_id
  const staffByCamp = {};
  for (const rel of staffRelations) {
    if (!staffByCamp[rel.camp_id]) {
      staffByCamp[rel.camp_id] = { staffIds: [], staffRoles: {} };
    }
    staffByCamp[rel.camp_id].staffIds.push(rel.staff_id);
    staffByCamp[rel.camp_id].staffRoles[rel.staff_id] = rel.role;
  }

  return json({ camps: results.map(c => {
    const rel = staffByCamp[c.id] || { staffIds: [], staffRoles: {} };
    return { 
      ...c, 
      playerIds: JSON.parse(c.player_ids || '[]'),
      staffIds: rel.staffIds,
      staffRoles: rel.staffRoles
    };
  }) });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body?.name) return err('name required');
  const id = 'camp_' + Date.now();
  await env.DB.prepare(
    'INSERT INTO camps (id, name, camp_date, camp_date_end, competition, description, team_level, player_ids) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(id, body.name, body.campDate || '', body.campDateEnd || '', body.competition || '', body.description || '', body.teamLevel || 'Senior', '[]').run();
  return json({ ok: true, id }, 201);
}
