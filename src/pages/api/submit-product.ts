import type { APIRoute } from 'astro';
import { addCreatorSubmission } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.formData();
  if (String(body.get('company') || '').trim()) return new Response(null, { status: 204 });
  const email = String(body.get('email') || '').trim();
  const name = String(body.get('productName') || '').trim();
  const url = String(body.get('productUrl') || '').trim();
  const notes = String(body.get('notes') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Enter a real email address.' }, { status: 400 });
  if (name.length < 2 || name.length > 80) return Response.json({ error: 'Enter a product name.' }, { status: 400 });
  try { new URL(url); } catch { return Response.json({ error: 'Enter a complete product URL.' }, { status: 400 }); }
  const added = addCreatorSubmission(email, name, url, notes.slice(0, 1000));
  return Response.json({ ok: true, message: added ? 'SUBMITTED. WE WILL REVIEW THE PRODUCT.' : 'THIS PRODUCT IS ALREADY IN REVIEW.' });
};
