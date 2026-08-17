export type FreeTool = {
  slug: string;
  name: string;
  category: 'Audit' | 'Data' | 'Content' | 'Website';
  icon: string;
  description: string;
  provider: string;
  status: 'available' | 'coming';
  url?: string;
  freeNote: string;
};

export const freeTools: FreeTool[] = [
  {
    slug: 'linkedin-audit',
    name: 'LinkedIn Audit',
    category: 'Audit',
    icon: 'in',
    description: 'Review your profile positioning, headline, proof, and conversion path with a focused founder checklist.',
    provider: 'Rethinksoft',
    status: 'coming',
    freeNote: 'Free Rethinksoft tool coming next',
  },
  {
    slug: 'seo-audit',
    name: 'SEO Audit',
    category: 'Audit',
    icon: 'SEO',
    description: 'Check the essential technical, content, metadata, and discoverability signals on any public website.',
    provider: 'Rethinksoft',
    status: 'coming',
    freeNote: 'Free Rethinksoft tool coming next',
  },
  {
    slug: 'google-maps-data-ai',
    name: 'Google Maps Data AI',
    category: 'Data',
    icon: 'MAP',
    description: 'Find and export fresh Google Maps business leads with contact data and email verification.',
    provider: 'MapsData',
    status: 'available',
    url: 'https://mapsdata.ai/',
    freeNote: '500 free credits, no card required',
  },
  {
    slug: 'auto-social-post-generator',
    name: 'Auto Social Post Generator',
    category: 'Content',
    icon: 'POST',
    description: 'Turn one product update into platform-ready posts, hooks, calls to action, and a reusable publishing plan.',
    provider: 'Rethinksoft',
    status: 'coming',
    freeNote: 'Free Rethinksoft tool coming next',
  },
  {
    slug: 'website-generator',
    name: 'Website Generator',
    category: 'Website',
    icon: 'WEB',
    description: 'Describe a product and generate a clear website structure, page copy, design direction, and build specification.',
    provider: 'Rethinksoft',
    status: 'coming',
    freeNote: 'Free Rethinksoft tool coming next',
  },
  {
    slug: 'ai-website-clone',
    name: 'AI Website Clone',
    category: 'Website',
    icon: 'COPY',
    description: 'Study a public website and recreate its layout system with original branding, content, and implementation.',
    provider: 'Rethinksoft',
    status: 'coming',
    freeNote: 'Free Rethinksoft tool coming next',
  },
  {
    slug: 'descript-video-editor',
    name: 'Descript Video Editor',
    category: 'Content',
    icon: 'VIDEO',
    description: 'Edit video through its transcript, create clips, improve audio, and use limited AI editing tools.',
    provider: 'Descript',
    status: 'available',
    url: 'https://www.descript.com/tools/video-editor',
    freeNote: 'Free plan with monthly usage limits',
  },
];

export const toolCategories = [...new Set(freeTools.map((item) => item.category))];

