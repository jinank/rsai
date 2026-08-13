import type { APIRoute } from 'astro';
import { addKitInterest } from '../../lib/db';
import { getApp } from '../../lib/apps';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.formData();
  if (String(body.get('company') || '').trim()) return new Response(null, { status: 204 });
  const email = String(body.get('email') || '').trim();
  const slug = String(body.get('slug') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Enter a real email address.' }, { status: 400 });
  if (!getApp(slug)?.featured) return Response.json({ error: 'That launch kit is not available.' }, { status: 400 });
  const added = addKitInterest(email, slug);
  return Response.json({ ok: true, message: added ? 'RESERVED. YOU WILL GET FIRST ACCESS.' : 'YOUR ACCESS IS ALREADY RESERVED.' });
};
