import { json, err } from '../_shared.js';

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestDelete({ env, params }) {
  const code = (params.code || '').trim().toUpperCase();
  if (!code) return err('code required', 400);
  await env.DB.prepare('DELETE FROM clubs WHERE code = ?').bind(code).run();
  return json({ ok: true });
}
