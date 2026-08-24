export type Opportunity = {
  slug: string;
  name: string;
  category: string;
  audience: string;
  summary: string;
  score: number;
  market: 'Strong' | 'Promising' | 'Emerging';
  competition: 'Low' | 'Medium' | 'High';
  buildDifficulty: 'Low' | 'Medium' | 'High';
  revenuePotential: 'Medium' | 'High' | 'Very high';
  why: string[];
  risks: string[];
  validate: string[];
  customerPrice: string;
};

export const opportunities: Opportunity[] = [
  {
    slug: 'ai-interview-coach', name: 'AI Interview Coach', category: 'Recruiting', audience: 'Job seekers, career coaches, and recruiting teams',
    summary: 'Role-specific mock interviews with structured feedback and measurable improvement.', score: 82, market: 'Strong', competition: 'Medium', buildDifficulty: 'Low', revenuePotential: 'High', customerPrice: '$19 to $49/mo',
    why: ['Clear anxiety-driven customer pain', 'A focused MVP is practical to launch', 'Strong search demand and content surface'],
    risks: ['Crowded horizontal market', 'Differentiation must be role-specific', 'Repeat usage may fall after a job offer'],
    validate: ['Interview 10 active job seekers', 'Test a $19 monthly plan', 'Collect 20 qualified waitlist signups'],
  },
  {
    slug: 'proposal-copilot', name: 'Proposal Copilot', category: 'Sales', audience: 'Small agencies, consultants, and service businesses',
    summary: 'Turn discovery notes into persuasive, branded proposals and follow-up sequences.', score: 86, market: 'Strong', competition: 'Medium', buildDifficulty: 'Low', revenuePotential: 'Very high', customerPrice: '$39 to $129/mo',
    why: ['Direct connection to customer revenue', 'Buyers already pay for manual proposal work', 'Clear agency and vertical niches'],
    risks: ['Generic AI output is easy to copy', 'Needs a strong workflow advantage', 'Templates must fit each niche'],
    validate: ['Observe five proposal workflows', 'Pre-sell to three agencies', 'Measure time saved on a live proposal'],
  },
  {
    slug: 'local-review-ops', name: 'Local Review Operations', category: 'Marketing', audience: 'Multi-location clinics, home services, and agencies',
    summary: 'Request, monitor, route, and respond to customer reviews across locations.', score: 79, market: 'Strong', competition: 'High', buildDifficulty: 'Medium', revenuePotential: 'High', customerPrice: '$49 to $199/mo',
    why: ['Reputation has visible commercial value', 'Agencies can resell it', 'Multi-location reporting creates retention'],
    risks: ['Platform API dependencies', 'Competitive category', 'Compliance and response quality matter'],
    validate: ['Interview five local marketing agencies', 'Audit 50 local listings', 'Test a managed pilot before software'],
  },
  {
    slug: 'vertical-ai-receptionist', name: 'Vertical AI Receptionist', category: 'Customer Support', audience: 'Dental practices, clinics, and appointment businesses',
    summary: 'Answer common calls, qualify intent, and book appointments for one specific industry.', score: 84, market: 'Strong', competition: 'Medium', buildDifficulty: 'High', revenuePotential: 'Very high', customerPrice: '$199 to $799/mo',
    why: ['Missed calls have measurable cost', 'Vertical knowledge improves defensibility', 'High willingness to pay when bookings rise'],
    risks: ['Voice reliability must be excellent', 'Industry-specific compliance', 'Integrations create implementation work'],
    validate: ['Listen to 20 real calls', 'Run a concierge pilot with one practice', 'Track booked revenue from handled calls'],
  },
  {
    slug: 'niche-job-board', name: 'Niche Job Board', category: 'Recruiting', audience: 'Professional communities and industry operators',
    summary: 'A focused hiring marketplace with paid listings, curated talent, and useful industry content.', score: 74, market: 'Promising', competition: 'Medium', buildDifficulty: 'Low', revenuePotential: 'Medium', customerPrice: '$99 to $399/listing',
    why: ['Simple product and business model', 'Community can create organic distribution', 'Employers understand listing economics'],
    risks: ['Marketplace cold start', 'Needs a narrow trusted audience', 'Job cycles create uneven revenue'],
    validate: ['Choose one underserved role category', 'Recruit 100 candidates manually', 'Pre-sell five employer listings'],
  },
  {
    slug: 'property-document-assistant', name: 'Property Document Assistant', category: 'Real Estate', audience: 'Property managers and small real estate teams',
    summary: 'Extract obligations, dates, and action items from leases and property documents.', score: 81, market: 'Strong', competition: 'Low', buildDifficulty: 'Medium', revenuePotential: 'High', customerPrice: '$59 to $249/mo',
    why: ['Document review is repetitive and expensive', 'Clear vertical customer profile', 'Historical documents create product stickiness'],
    risks: ['Accuracy expectations are high', 'Legal disclaimers are required', 'Document formats vary widely'],
    validate: ['Collect 30 representative documents', 'Shadow three property managers', 'Charge for a manual document audit'],
  },
  {
    slug: 'course-support-agent', name: 'Course Support Agent', category: 'Education', audience: 'Cohort course operators and training companies',
    summary: 'Answer course questions from approved material and surface students who need human help.', score: 76, market: 'Promising', competition: 'Medium', buildDifficulty: 'Medium', revenuePotential: 'Medium', customerPrice: '$49 to $149/mo',
    why: ['Support load grows with enrollment', 'Source material already exists', 'Clear handoff between AI and instructor'],
    risks: ['Small creators have limited budgets', 'Hallucinations damage trust', 'Seasonal course activity'],
    validate: ['Analyze 200 historical support questions', 'Run a pilot inside one cohort', 'Measure instructor hours saved'],
  },
  {
    slug: 'invoice-chase-assistant', name: 'Invoice Chase Assistant', category: 'Finance', audience: 'Agencies, consultants, and small B2B service companies',
    summary: 'Monitor overdue invoices and run polite, context-aware follow-up until payment.', score: 88, market: 'Strong', competition: 'Low', buildDifficulty: 'Medium', revenuePotential: 'High', customerPrice: '$29 to $99/mo',
    why: ['Direct and measurable cash-flow impact', 'Existing process is manual and uncomfortable', 'Value is easy to demonstrate'],
    risks: ['Accounting integrations are required', 'Tone errors can harm relationships', 'Payment data needs careful handling'],
    validate: ['Interview 10 agency owners', 'Manually recover five overdue invoices', 'Test pricing tied to recovered cash'],
  },
];

export function getOpportunity(slug: string) {
  return opportunities.find((item) => item.slug === slug);
}
