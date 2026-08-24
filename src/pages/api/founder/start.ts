import type { APIRoute } from 'astro';
import { createFounderBusiness } from '../../../lib/db';

const validStages = new Set(['idea', 'validating', 'building', 'launched', 'growing']);

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.formData();
  if (String(body.get('company') || '').trim()) return new Response(null, { status: 204 });

  const email = String(body.get('email') || '').trim();
  const founderName = String(body.get('founderName') || '').trim();
  const businessName = String(body.get('businessName') || '').trim();
  const idea = String(body.get('idea') || '').trim();
  const targetCustomer = String(body.get('targetCustomer') || '').trim();
  const category = String(body.get('category') || '').trim();
  const stage = String(body.get('stage') || '').trim();
  const websiteUrl = String(body.get('websiteUrl') || '').trim();
  const primaryGoal = String(body.get('primaryGoal') || '').trim();
  const monthlyRevenue = Math.max(0, Math.min(10_000_000, Number(body.get('monthlyRevenue') || 0)));
  const customerCount = Math.max(0, Math.min(1_000_000, Number(body.get('customerCount') || 0)));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Enter a valid work email.' }, { status: 400 });
  if (founderName.length < 2 || founderName.length > 80) return Response.json({ error: 'Enter your name.' }, { status: 400 });
  if (businessName.length < 2 || businessName.length > 100) return Response.json({ error: 'Enter a business or working project name.' }, { status: 400 });
  if (idea.length < 20 || idea.length > 800) return Response.json({ error: 'Describe the problem and product in at least 20 characters.' }, { status: 400 });
  if (targetCustomer.length < 5 || targetCustomer.length > 200) return Response.json({ error: 'Describe the specific customer you want to serve.' }, { status: 400 });
  if (!category || category.length > 60) return Response.json({ error: 'Choose a market category.' }, { status: 400 });
  if (!validStages.has(stage)) return Response.json({ error: 'Choose your current stage.' }, { status: 400 });
  if (primaryGoal.length < 10 || primaryGoal.length > 240) return Response.json({ error: 'Set one clear 30-day outcome.' }, { status: 400 });
  if (websiteUrl) {
    try { if (new URL(websiteUrl).protocol !== 'https:') throw new Error(); }
    catch { return Response.json({ error: 'Use a complete HTTPS website URL or leave it blank.' }, { status: 400 }); }
  }

  const created = createFounderBusiness({
    email, founderName, businessName, idea, targetCustomer, category, stage, websiteUrl,
    monthlyRevenue: Number.isFinite(monthlyRevenue) ? monthlyRevenue : 0,
    customerCount: Number.isFinite(customerCount) ? customerCount : 0,
    primaryGoal,
  });
  cookies.set('rethink_founder', `${created.id}.${created.accessToken}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
  });
  return Response.json({ ok: true, redirect: `/founder/${created.id}`, score: created.rethinkScore }, { status: 201 });
};
