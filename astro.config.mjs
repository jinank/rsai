import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

const isVercelBuild = Boolean(process.env.VERCEL);

export default defineConfig({
  site: process.env.SITE_URL || 'https://rethinksoft.app',
  output: 'server',
  adapter: isVercelBuild ? vercel() : node({ mode: 'standalone' }),
});
