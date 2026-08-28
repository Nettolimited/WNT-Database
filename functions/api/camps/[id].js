import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestGet({ env, params }) {
  const row = await env.DB.prepare('SELECT * FROM camps WHERE id = ?').bind(params.id).first();
  if (!row) return err('Camp not found', 404);

  // Fetch staff relations for this specific camp
  const { results: staffRelations } = await env.DB.prepare(
    'SELECT staff_id, role FROM camp_staff WHERE camp_id = ?'
  ).bind(params.id).all();

  const staffIds = staffRelations.map(rel => rel.staff_id);
  const staffRoles = {};
  for (const rel of staffRelations) {
    staffRoles[rel.staff_id] = rel.role;
  }

  return json({
    ...row,
    playerIds:    JSON.parse(row.player_ids     || '[]'),
    playerShirts: JSON.parse(row.player_shirts  || '{}'),
    staffIds,
    staffRoles
  });
}

export async function onRequestPut({ request, env, params }) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON');
  const id = params.id;
  const name = body.name ?? '';
  const campDate = body.campDate ?? body.camp_date ?? '';
  const campDateEnd = body.campDateEnd ?? body.camp_date_end ?? '';
  const competition = body.competition ?? '';
  const description = body.description ?? '';
  const teamLevel = body.teamLevel ?? body.team_level ?? 'Senior';
  const playerIds = JSON.stringify(body.playerIds ?? body.player_ids ?? []);
  const playerShirts = JSON.stringify(body.playerShirts ?? body.player_shirts ?? {});
  const staffIds = JSON.stringify(body.staffIds ?? body.staff_ids ?? []);
  const staffRoles = JSON.stringify(body.staffRoles ?? body.staff_roles ?? {});

  try {
    await env.DB.prepare(
      'UPDATE camps SET name=?, camp_date=?, camp_date_end=?, competition=?, description=?, team_level=?, player_ids=?, player_shirts=?, staff_ids=?, staff_roles=? WHERE id=?'
    ).bind(
      name, campDate, campDateEnd, competition, description, teamLevel,
      playerIds, playerShirts, staffIds, staffRoles, id
    ).run();
  } catch (e) {
    await env.DB.prepare(
      'UPDATE camps SET name=?, camp_date=?, camp_date_end=?, competition=?, description=?, team_level=?, player_ids=?, player_shirts=? WHERE id=?'
    ).bind(
      name, campDate, campDateEnd, competition, description, teamLevel,
      playerIds, playerShirts, id
    ).run();
  }
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const { id } = params;
  const targets = [
    { table: 'camps', col: 'id' },
    { table: 'camp_staff', col: 'camp_id' },
    { table: 'camp_player_status', col: 'camp_id' },
    { table: 'camp_wellness', col: 'camp_id' },
    { table: 'camp_gps', col: 'camp_id' },
    { table: 'camp_schedules', col: 'camp_id' },
  ];

  for (const t of targets) {
    try {
      await env.DB.prepare(`DELETE FROM ${t.table} WHERE ${t.col} = ?`).bind(id).run();
    } catch (e) {
      console.error(`Error deleting from ${t.table}:`, e);
    }
  }
  return json({ ok: true });
}
