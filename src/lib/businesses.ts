export type LaunchBusiness = {
  slug: string;
  name: string;
  icon: string;
  audience: string;
  description: string;
  customerPrice: string;
  licensePrice: number;
  status: 'founding' | 'planned';
  includes: string[];
};

export const launchBusinesses: LaunchBusiness[] = [
  { slug: 'ai-resume-builder', name: 'AI Resume Builder', icon: 'CV', audience: 'Job seekers and career coaches', description: 'Create tailored resumes, cover letters, and ATS-ready exports from one guided workspace.', customerPrice: '$9 to $29/mo', licensePrice: 199, status: 'founding', includes: ['AI writing workflow', 'PDF export', 'Subscriptions'] },
  { slug: 'ai-interview-coach', name: 'AI Interview Coach', icon: 'AI', audience: 'Candidates and recruiting teams', description: 'Run realistic mock interviews with role-specific questions, feedback, and progress tracking.', customerPrice: '$19 to $49/mo', licensePrice: 249, status: 'founding', includes: ['Mock interviews', 'AI feedback', 'User history'] },
  { slug: 'ai-content-studio', name: 'AI Content Studio', icon: '✦', audience: 'Creators and small agencies', description: 'Turn one idea into channel-ready posts, campaigns, and reusable brand content.', customerPrice: '$19 to $79/mo', licensePrice: 199, status: 'founding', includes: ['Brand profiles', 'Content generation', 'Export queue'] },
  { slug: 'ai-lead-finder', name: 'AI Lead Finder', icon: '◎', audience: 'Agencies and B2B sales teams', description: 'Build focused prospect lists, enrich company context, and prepare personalized outreach.', customerPrice: '$49 to $199/mo', licensePrice: 499, status: 'founding', includes: ['Lead workspace', 'AI enrichment', 'CSV export'] },
  { slug: 'niche-job-board', name: 'Niche Job Board', icon: 'JB', audience: 'Communities and industry operators', description: 'Launch a focused hiring marketplace with paid listings, employer accounts, and moderation.', customerPrice: '$19 to $99/listing', licensePrice: 299, status: 'founding', includes: ['Paid listings', 'Employer portal', 'Admin review'] },
];
