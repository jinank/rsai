import fs from 'node:fs';
import path from 'node:path';

export type Verdict = 'yes' | 'kinda' | 'no';
export type PriorArt = { title: string; url: string };
export type AppEntry = {
  slug: string;
  name: string;
  domain: string;
  category: string;
  priceMonthly: number;
  verdict: Verdict;
  whatYouLose: string[];
  priorArt: PriorArt[];
  prompt: string;
  notes: string;
};

const appsDir = path.resolve(process.cwd(), 'data/apps');

export function getApps(): AppEntry[] {
  return fs.readdirSync(appsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(appsDir, file), 'utf8')) as AppEntry)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getApp(slug: string): AppEntry | undefined {
  return getApps().find((app) => app.slug === slug);
}

export const categoryEmoji: Record<string, string> = {
  Analytics: '📈', Automation: '⚡', Documents: '✍️', Docs: '📝', Forms: '🧩',
  Marketing: '📣', Projects: '🗂️', Scheduling: '📅', SEO: '🔎', Social: '📡',
  Support: '🎧', Video: '🎥',
};

export const verdictCopy = {
  yes: { short: 'STARTER', label: 'Approachable starter build', kicker: 'BUILD NOW' },
  kinda: { short: 'ADVANCED', label: 'Advanced product build', kicker: 'BUILD DEEP' },
  no: { short: 'EXPERT', label: 'Expert level system', kicker: 'BUILD A NICHE' },
} as const;
