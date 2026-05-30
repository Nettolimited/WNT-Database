export function cors(r) {
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return r;
}

export function json(data, status = 200) {
  return cors(Response.json(data, { status }));
}

export function err(msg, status = 400) {
  return json({ error: msg }, status);
}

export function deserialize(row) {
  return {
    id:        row.id,
    active:    row.active !== 0,
    nick:      row.nick || '',
    name:      row.name,
    thaiName:  row.thai_name || '',
    pos:       row.pos,
    altPos:    JSON.parse(row.alt_pos   || '[]'),
    dob:       row.dob   || '',
    foot:      row.foot  || 'R',
    height:    row.height || 165,
    team:      row.team  || 'Senior',
    club:      row.club  || '',
    shirt:     row.shirt || 0,
    caps:      row.caps  || 0,
    intGoals:  row.int_goals || 0,
    stats:     JSON.parse(row.stats     || '{}'),
    intStats:  JSON.parse(row.int_stats || '{}'),
    radar:     JSON.parse(row.radar     || '{}'),
    career:    JSON.parse(row.career    || '[]'),
    photoKey:  row.photo_key || null,
    updatedAt: row.updated_at,
  };
}

export function serialize(p) {
  return {
    active:     p.active !== false ? 1 : 0,
    nick:       p.nick      ?? '',
    name:       p.name,
    thai_name:  p.thaiName  ?? '',
    pos:        p.pos,
    alt_pos:    JSON.stringify(p.altPos   ?? []),
    dob:        p.dob       ?? '',
    foot:       p.foot      ?? 'R',
    height:     p.height    ?? 165,
    team:       p.team      ?? 'Senior',
    club:       p.club      ?? '',
    shirt:      p.shirt     ?? 0,
    caps:       p.caps      ?? 0,
    int_goals:  p.intGoals  ?? 0,
    stats:      JSON.stringify(p.stats    ?? {}),
    int_stats:  JSON.stringify(p.intStats ?? {}),
    radar:      JSON.stringify(p.radar    ?? {}),
    career:     JSON.stringify(p.career   ?? []),
    photo_key:  p.photoKey  ?? null,
    updated_at: new Date().toISOString(),
  };
}
