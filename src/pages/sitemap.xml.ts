import type { APIRoute } from 'astro';
import { getApps } from '../lib/apps';

export const GET: APIRoute = ({ site }) => {
  const base = site!.toString().replace(/\/$/, '');
  const urls = ['', '/directory', ...getApps().map((app) => `/${app.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `\n  <url><loc>${base}${path}</loc><changefreq>${path ? 'monthly' : 'weekly'}</changefreq><priority>${path ? '0.8' : '1.0'}</priority></url>`).join('')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
