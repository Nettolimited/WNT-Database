export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const camp_id = url.searchParams.get('camp_id');
  const session_date = url.searchParams.get('session_date');
  const session = url.searchParams.get('session');
  const player_id = url.searchParams.get('player_id'); // Optional, to get specific player's history

  try {
    let query, params;
    if (player_id && camp_id && !session_date) {
      // Get history for one player in a camp
      query = `SELECT * FROM camp_gps WHERE camp_id = ? AND player_id = ? ORDER BY session_date DESC, session DESC`;
      params = [camp_id, player_id];
    } else if (camp_id && session_date && session) {
      if (session === 'All' || session === 'Daily') {
        query = `SELECT camp_id, player_id, session_date, ? as session,
                 SUM(total_dist) as total_dist,
                 AVG(m_per_min) as m_per_min,
                 SUM(hsr_dist) as hsr_dist,
                 SUM(sprint_dist) as sprint_dist,
                 SUM(explosive_effs) as explosive_effs,
                 SUM(accel_decel_effs) as accel_decel_effs,
                 MAX(max_vel) as max_vel,
                 MAX(percent_max_vel) as percent_max_vel,
                 SUM(total_pl) as total_pl,
                 SUM(gk_jumps) as gk_jumps,
                 SUM(gk_dive_total) as gk_dive_total,
                 SUM(gk_dive_left) as gk_dive_left,
                 SUM(gk_dive_right) as gk_dive_right,
                 SUM(gk_dive_centre) as gk_dive_centre,
                 SUM(gk_dive_load_left) as gk_dive_load_left,
                 SUM(gk_dive_load_right) as gk_dive_load_right,
                 SUM(gk_dive_load_centre) as gk_dive_load_centre,
                 SUM(gk_accel_load) as gk_accel_load,
                 SUM(zone1_dist) as zone1_dist,
                 SUM(zone2_dist) as zone2_dist,
                 SUM(zone3_dist) as zone3_dist,
                 SUM(zone4_dist) as zone4_dist,
                 SUM(zone5_dist) as zone5_dist,
                 SUM(zone6_dist) as zone6_dist
                 FROM camp_gps 
                 WHERE camp_id = ? AND session_date = ?
                 GROUP BY camp_id, player_id, session_date`;
        params = [session, camp_id, session_date];
      } else {
        query = `SELECT * FROM camp_gps WHERE camp_id = ? AND session_date = ? AND session = ?`;
        params = [camp_id, session_date, session];
      }
    } else if (camp_id && !session_date && !session) {
      // Get ALL players for ALL sessions (for Overall Dashboard)
      query = `SELECT * FROM camp_gps WHERE camp_id = ? ORDER BY session_date ASC`;
      params = [camp_id];
    } else {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify({ entries: results || [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { 
      camp_id, player_id, session_date, session, 
      total_dist, m_per_min, hsr_dist, sprint_dist, 
      explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl,
      gk_jumps, gk_dive_total, gk_dive_left, gk_dive_right, gk_dive_centre,
      gk_dive_load_left, gk_dive_load_right, gk_dive_load_centre, gk_accel_load,
      zone1_dist, zone2_dist, zone3_dist, zone4_dist, zone5_dist, zone6_dist
    } = data;

    if (!camp_id || !player_id || !session_date || !session) {
      return new Response(JSON.stringify({ error: 'Missing required keys' }), { status: 400 });
    }

    const query = `
      INSERT INTO camp_gps (
        camp_id, player_id, session_date, session,
        total_dist, m_per_min, hsr_dist, sprint_dist,
        explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl,
        gk_jumps, gk_dive_total, gk_dive_left, gk_dive_right, gk_dive_centre,
        gk_dive_load_left, gk_dive_load_right, gk_dive_load_centre, gk_accel_load,
        zone1_dist, zone2_dist, zone3_dist, zone4_dist, zone5_dist, zone6_dist,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(camp_id, player_id, session_date, session) DO UPDATE SET
        total_dist = excluded.total_dist,
        m_per_min = excluded.m_per_min,
        hsr_dist = excluded.hsr_dist,
        sprint_dist = excluded.sprint_dist,
        explosive_effs = excluded.explosive_effs,
        accel_decel_effs = excluded.accel_decel_effs,
        max_vel = excluded.max_vel,
        percent_max_vel = excluded.percent_max_vel,
        total_pl = excluded.total_pl,
        gk_jumps = excluded.gk_jumps,
        gk_dive_total = excluded.gk_dive_total,
        gk_dive_left = excluded.gk_dive_left,
        gk_dive_right = excluded.gk_dive_right,
        gk_dive_centre = excluded.gk_dive_centre,
        gk_dive_load_left = excluded.gk_dive_load_left,
        gk_dive_load_right = excluded.gk_dive_load_right,
        gk_dive_load_centre = excluded.gk_dive_load_centre,
        gk_accel_load = excluded.gk_accel_load,
        zone1_dist = excluded.zone1_dist,
        zone2_dist = excluded.zone2_dist,
        zone3_dist = excluded.zone3_dist,
        zone4_dist = excluded.zone4_dist,
        zone5_dist = excluded.zone5_dist,
        zone6_dist = excluded.zone6_dist,
        updated_at = datetime('now')
    `;
    
    await env.DB.prepare(query).bind(
      camp_id, player_id, session_date, session,
      total_dist || 0, m_per_min || 0, hsr_dist || 0, sprint_dist || 0,
      explosive_effs || 0, accel_decel_effs || 0, max_vel || 0, percent_max_vel || 0, total_pl || 0,
      gk_jumps || 0, gk_dive_total || 0, gk_dive_left || 0, gk_dive_right || 0, gk_dive_centre || 0,
      gk_dive_load_left || 0, gk_dive_load_right || 0, gk_dive_load_centre || 0, gk_accel_load || 0,
      zone1_dist || 0, zone2_dist || 0, zone3_dist || 0, zone4_dist || 0, zone5_dist || 0, zone6_dist || 0
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
