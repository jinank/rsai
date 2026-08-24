import type { APIRoute } from 'astro';
import { getFounderBusiness, setFounderGoalCompleted } from '../../../../lib/db';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const businessId = params.id || '';
  const session = cookies.get('rethink_founder')?.value || '';
  const separator = session.indexOf('.');
  const sessionId = separator > 0 ? session.slice(0, separator) : '';
  const token = separator > 0 ? session.slice(separator + 1) : '';
  if (sessionId !== businessId || !getFounderBusiness(businessId, token)) return Response.json({ error: 'Your private workspace session has expired.' }, { status: 401 });

  const body = await request.formData();
  const goalId = Number(body.get('goalId'));
  const completed = body.get('completed') === 'true';
  if (!Number.isInteger(goalId) || goalId < 1) return Response.json({ error: 'Unknown goal.' }, { status: 400 });
  const updated = setFounderGoalCompleted(businessId, goalId, completed);
  return updated ? Response.json({ ok: true, completed }) : Response.json({ error: 'Goal not found.' }, { status: 404 });
};
