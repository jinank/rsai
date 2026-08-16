import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { getApp } from '../../lib/apps';
import { addCommunityProduct } from '../../lib/db';

const isHttpsUrl = (value: string) => {
  try { return new URL(value).protocol === 'https:'; }
  catch { return false; }
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.formData();
  if (String(body.get('company') || '').trim()) return new Response(null, { status: 204 });

  const blueprintSlug = String(body.get('blueprintSlug') || '').trim();
  const productName = String(body.get('productName') || '').trim();
  const builderName = String(body.get('builderName') || '').trim();
  const tagline = String(body.get('tagline') || '').trim();
  const productUrl = String(body.get('productUrl') || '').trim();
  const publicProfileUrl = String(body.get('publicProfileUrl') || '').trim();
  const repositoryUrl = String(body.get('repositoryUrl') || '').trim();
  const contactEmail = String(body.get('contactEmail') || '').trim();

  if (!getApp(blueprintSlug)) return Response.json({ error: 'Choose a product blueprint from the Rethinksoft library.' }, { status: 400 });
  if (productName.length < 2 || productName.length > 80) return Response.json({ error: 'Enter a product name under 80 characters.' }, { status: 400 });
  if (builderName.length < 2 || builderName.length > 60) return Response.json({ error: 'Enter the public builder name.' }, { status: 400 });
  if (tagline.length < 10 || tagline.length > 180) return Response.json({ error: 'Describe the product in 10 to 180 characters.' }, { status: 400 });
  if (!isHttpsUrl(productUrl)) return Response.json({ error: 'The product must have a live HTTPS website.' }, { status: 400 });
  if (!isHttpsUrl(publicProfileUrl)) return Response.json({ error: 'Enter a complete public persona URL.' }, { status: 400 });
  if (repositoryUrl && !isHttpsUrl(repositoryUrl)) return Response.json({ error: 'Repository links must use HTTPS.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return Response.json({ error: 'Enter a valid contact email.' }, { status: 400 });
  if (body.get('ownershipConfirmed') !== 'yes' || body.get('liveConfirmed') !== 'yes') return Response.json({ error: 'Confirm ownership and that the product is live.' }, { status: 400 });

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const ipHash = createHash('sha256').update(`${forwarded}:${process.env.IP_HASH_SALT || 'rethinksoft-community'}`).digest('hex');
  const result = addCommunityProduct({
    blueprintSlug,
    productName,
    builderName,
    tagline,
    productUrl,
    publicProfileUrl,
    repositoryUrl,
    contactEmail,
    marketplaceInterest: body.get('marketplaceInterest') === 'yes',
    ipHash,
  });

  if (result.rateLimited) return Response.json({ error: 'You can submit up to three products per day.' }, { status: 429 });
  if (!result.added) return Response.json({ error: 'That live product is already listed.' }, { status: 409 });
  return Response.json({ ok: true, id: result.id, message: 'YOUR PRODUCT IS NOW LISTED.' });
};
