import type { APIRoute } from 'astro';
import { addCreatorSubmission } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.formData();
  if (String(body.get('company') || '').trim()) return new Response(null, { status: 204 });
  const email = String(body.get('email') || '').trim();
  const name = String(body.get('productName') || '').trim();
  const url = String(body.get('productUrl') || '').trim();
  const publicProfileUrl = String(body.get('publicProfileUrl') || '').trim();
  const replacementName = String(body.get('replacementName') || '').trim();
  const repositoryUrl = String(body.get('repositoryUrl') || '').trim();
  const demoAccess = String(body.get('demoAccess') || '').trim();
  const preferredPrice = String(body.get('preferredPrice') || '').trim();
  const notes = String(body.get('notes') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Enter a real email address.' }, { status: 400 });
  if (name.length < 2 || name.length > 80) return Response.json({ error: 'Enter a product name.' }, { status: 400 });
  if (replacementName.length < 2 || replacementName.length > 80) return Response.json({ error: 'Tell us what the product replaces.' }, { status: 400 });
  const validateHttpsUrl = (value: string) => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  if (!validateHttpsUrl(url)) return Response.json({ error: 'The live product must use a complete HTTPS URL.' }, { status: 400 });
  if (!validateHttpsUrl(publicProfileUrl)) return Response.json({ error: 'Enter a complete public persona URL.' }, { status: 400 });
  if (repositoryUrl.length < 5 || demoAccess.length < 5 || notes.length < 20) return Response.json({ error: 'Provide repository access, demo access, and product details.' }, { status: 400 });
  if (body.get('ownershipConfirmed') !== 'yes' || body.get('liveConfirmed') !== 'yes') return Response.json({ error: 'Confirm ownership and permission to audit the live product.' }, { status: 400 });
  const added = addCreatorSubmission({ email, productName: name, productUrl: url, publicProfileUrl, replacementName, repositoryUrl: repositoryUrl.slice(0, 300), demoAccess: demoAccess.slice(0, 1000), preferredPrice: preferredPrice.slice(0, 80), notes: notes.slice(0, 2000) });
  return Response.json({ ok: true, message: added ? 'REVIEW REQUESTED. RETHINKSOFT WILL CONTACT YOU DIRECTLY.' : 'THIS PRODUCT IS ALREADY IN PRIVATE REVIEW.' });
};
