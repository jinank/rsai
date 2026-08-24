import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

const defaultDbPath = process.env.VERCEL ? path.join('/tmp', 'rethinksoft', 'site.db') : './data/site.db';
const dbPath = path.resolve(process.env.DATABASE_PATH || defaultDbPath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    app_slug TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (app_slug, ip_hash)
  );
  CREATE INDEX IF NOT EXISTS idx_votes_app_slug ON votes(app_slug);
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS creator_submissions (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    product_name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    public_profile_url TEXT NOT NULL DEFAULT '',
    replacement_name TEXT NOT NULL DEFAULT '',
    repository_url TEXT NOT NULL DEFAULT '',
    demo_access TEXT NOT NULL DEFAULT '',
    preferred_price TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(email, product_url)
  );
  CREATE TABLE IF NOT EXISTS community_products (
    id INTEGER PRIMARY KEY,
    blueprint_slug TEXT NOT NULL,
    product_name TEXT NOT NULL,
    builder_name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    product_url TEXT NOT NULL COLLATE NOCASE UNIQUE,
    public_profile_url TEXT NOT NULL,
    repository_url TEXT NOT NULL DEFAULT '',
    contact_email TEXT NOT NULL COLLATE NOCASE,
    marketplace_interest INTEGER NOT NULL DEFAULT 0 CHECK (marketplace_interest IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'listed' CHECK (status IN ('listed', 'hidden', 'sold')),
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_community_products_status_created ON community_products(status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_community_products_ip_created ON community_products(ip_hash, created_at DESC);
  CREATE TABLE IF NOT EXISTS founder_businesses (
    id TEXT PRIMARY KEY,
    access_token_hash TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    founder_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    idea TEXT NOT NULL,
    target_customer TEXT NOT NULL,
    category TEXT NOT NULL,
    stage TEXT NOT NULL,
    website_url TEXT NOT NULL DEFAULT '',
    monthly_revenue INTEGER NOT NULL DEFAULT 0,
    customer_count INTEGER NOT NULL DEFAULT 0,
    primary_goal TEXT NOT NULL,
    rethink_score INTEGER NOT NULL DEFAULT 50,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS founder_goals (
    id INTEGER PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES founder_businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    position INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_founder_goals_business ON founder_goals(business_id, position, id);
`);

const submissionColumns = new Set((db.prepare('PRAGMA table_info(creator_submissions)').all() as { name: string }[]).map((column) => column.name));
for (const [name, definition] of Object.entries({
  public_profile_url: "TEXT NOT NULL DEFAULT ''",
  replacement_name: "TEXT NOT NULL DEFAULT ''",
  repository_url: "TEXT NOT NULL DEFAULT ''",
  demo_access: "TEXT NOT NULL DEFAULT ''",
  preferred_price: "TEXT NOT NULL DEFAULT ''",
})) {
  if (!submissionColumns.has(name)) db.exec(`ALTER TABLE creator_submissions ADD COLUMN ${name} ${definition}`);
}
db.pragma('optimize');

export function getVoteCounts(): Record<string, number> {
  const rows = db.prepare('SELECT app_slug, COUNT(*) AS count FROM votes GROUP BY app_slug').all() as { app_slug: string; count: number }[];
  return Object.fromEntries(rows.map((row) => [row.app_slug, row.count]));
}

export function addVote(appSlug: string, ipHash: string) {
  const result = db.prepare('INSERT OR IGNORE INTO votes (app_slug, ip_hash) VALUES (?, ?)').run(appSlug, ipHash);
  const row = db.prepare('SELECT COUNT(*) AS count FROM votes WHERE app_slug = ?').get(appSlug) as { count: number };
  return { added: result.changes > 0, count: row.count };
}

export function addWaitlistEmail(email: string) {
  const result = db.prepare('INSERT OR IGNORE INTO waitlist (email) VALUES (?)').run(email.trim().toLowerCase());
  return result.changes > 0;
}

export function addCreatorSubmission(submission: { email: string; productName: string; productUrl: string; publicProfileUrl: string; replacementName: string; repositoryUrl: string; demoAccess: string; preferredPrice: string; notes: string }) {
  const result = db.prepare(`INSERT OR IGNORE INTO creator_submissions
    (email, product_name, product_url, public_profile_url, replacement_name, repository_url, demo_access, preferred_price, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(submission.email.trim().toLowerCase(), submission.productName.trim(), submission.productUrl.trim(), submission.publicProfileUrl.trim(), submission.replacementName.trim(), submission.repositoryUrl.trim(), submission.demoAccess.trim(), submission.preferredPrice.trim(), submission.notes.trim());
  return result.changes > 0;
}

export type CommunityProduct = {
  id: number;
  blueprintSlug: string;
  productName: string;
  builderName: string;
  tagline: string;
  productUrl: string;
  publicProfileUrl: string;
  repositoryUrl: string;
  marketplaceInterest: boolean;
  createdAt: number;
};

export function getCommunityProducts(): CommunityProduct[] {
  const rows = db.prepare(`SELECT id, blueprint_slug, product_name, builder_name, tagline, product_url,
    public_profile_url, repository_url, marketplace_interest, created_at
    FROM community_products WHERE status = 'listed' ORDER BY created_at DESC, id DESC`).all() as {
      id: number; blueprint_slug: string; product_name: string; builder_name: string; tagline: string;
      product_url: string; public_profile_url: string; repository_url: string; marketplace_interest: number; created_at: number;
    }[];
  return rows.map((row) => ({
    id: row.id,
    blueprintSlug: row.blueprint_slug,
    productName: row.product_name,
    builderName: row.builder_name,
    tagline: row.tagline,
    productUrl: row.product_url,
    publicProfileUrl: row.public_profile_url,
    repositoryUrl: row.repository_url,
    marketplaceInterest: row.marketplace_interest === 1,
    createdAt: row.created_at,
  }));
}

export function addCommunityProduct(submission: {
  blueprintSlug: string; productName: string; builderName: string; tagline: string; productUrl: string;
  publicProfileUrl: string; repositoryUrl: string; contactEmail: string; marketplaceInterest: boolean; ipHash: string;
}) {
  const recent = db.prepare('SELECT COUNT(*) AS count FROM community_products WHERE ip_hash = ? AND created_at > unixepoch() - 86400').get(submission.ipHash) as { count: number };
  if (recent.count >= 3) return { added: false, rateLimited: true, id: 0 };
  const result = db.prepare(`INSERT OR IGNORE INTO community_products
    (blueprint_slug, product_name, builder_name, tagline, product_url, public_profile_url, repository_url, contact_email, marketplace_interest, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      submission.blueprintSlug,
      submission.productName.trim(),
      submission.builderName.trim(),
      submission.tagline.trim(),
      submission.productUrl.trim(),
      submission.publicProfileUrl.trim(),
      submission.repositoryUrl.trim(),
      submission.contactEmail.trim().toLowerCase(),
      submission.marketplaceInterest ? 1 : 0,
      submission.ipHash,
    );
  return { added: result.changes > 0, rateLimited: false, id: Number(result.lastInsertRowid || 0) };
}

const hashAccessToken = (token: string) => createHash('sha256').update(token).digest('hex');

export type FounderBusiness = {
  id: string;
  email: string;
  founderName: string;
  businessName: string;
  idea: string;
  targetCustomer: string;
  category: string;
  stage: string;
  websiteUrl: string;
  monthlyRevenue: number;
  customerCount: number;
  primaryGoal: string;
  rethinkScore: number;
};

export type FounderGoal = {
  id: number;
  title: string;
  category: string;
  completed: boolean;
};

function calculateRethinkScore(input: { stage: string; idea: string; targetCustomer: string; websiteUrl: string; monthlyRevenue: number; customerCount: number; primaryGoal: string }) {
  let score = 28;
  if (input.idea.length >= 40) score += 8;
  if (input.targetCustomer.length >= 15) score += 10;
  if (input.primaryGoal.length >= 15) score += 10;
  if (input.stage === 'validating') score += 8;
  if (input.stage === 'building') score += 12;
  if (input.stage === 'launched') score += 18;
  if (input.stage === 'growing') score += 23;
  if (input.websiteUrl) score += 7;
  if (input.customerCount > 0) score += Math.min(8, input.customerCount * 2);
  if (input.monthlyRevenue > 0) score += Math.min(10, Math.ceil(input.monthlyRevenue / 250));
  return Math.max(35, Math.min(92, score));
}

function createInitialGoals(stage: string, targetCustomer: string, primaryGoal: string) {
  const customer = targetCustomer.length > 42 ? 'target customers' : targetCustomer.toLowerCase();
  if (stage === 'idea' || stage === 'validating') return [
    ['Interview five people who match your target customer', 'CUSTOMER'],
    ['Write a one-sentence problem and promise', 'POSITIONING'],
    ['Create a landing page for the proposed outcome', 'VALIDATION'],
    ['Ask 20 qualified people to join a pilot', 'DISTRIBUTION'],
    [`Define evidence that would prove: ${primaryGoal}`, 'MILESTONE'],
  ];
  return [
    [`Talk to five ${customer}`, 'CUSTOMER'],
    ['Contact 30 qualified prospects directly', 'DISTRIBUTION'],
    ['Publish three high-intent pages or founder posts', 'CONTENT'],
    ['Remove the largest activation or onboarding obstacle', 'PRODUCT'],
    [`Move this outcome forward: ${primaryGoal}`, 'MILESTONE'],
  ];
}

export function createFounderBusiness(input: {
  email: string; founderName: string; businessName: string; idea: string; targetCustomer: string; category: string;
  stage: string; websiteUrl: string; monthlyRevenue: number; customerCount: number; primaryGoal: string;
}) {
  const id = randomUUID();
  const accessToken = randomBytes(32).toString('hex');
  const rethinkScore = calculateRethinkScore(input);
  const transaction = db.transaction(() => {
    db.prepare(`INSERT INTO founder_businesses
      (id, access_token_hash, email, founder_name, business_name, idea, target_customer, category, stage, website_url, monthly_revenue, customer_count, primary_goal, rethink_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, hashAccessToken(accessToken), input.email.trim().toLowerCase(), input.founderName.trim(), input.businessName.trim(),
      input.idea.trim(), input.targetCustomer.trim(), input.category.trim(), input.stage, input.websiteUrl.trim(), input.monthlyRevenue,
      input.customerCount, input.primaryGoal.trim(), rethinkScore,
    );
    const insertGoal = db.prepare('INSERT INTO founder_goals (business_id, title, category, position) VALUES (?, ?, ?, ?)');
    createInitialGoals(input.stage, input.targetCustomer, input.primaryGoal).forEach(([title, category], index) => insertGoal.run(id, title, category, index));
  });
  transaction();
  return { id, accessToken, rethinkScore };
}

export function getFounderBusiness(id: string, accessToken: string): FounderBusiness | null {
  const row = db.prepare(`SELECT id, email, founder_name, business_name, idea, target_customer, category, stage, website_url,
    monthly_revenue, customer_count, primary_goal, rethink_score FROM founder_businesses
    WHERE id = ? AND access_token_hash = ?`).get(id, hashAccessToken(accessToken)) as {
      id: string; email: string; founder_name: string; business_name: string; idea: string; target_customer: string; category: string;
      stage: string; website_url: string; monthly_revenue: number; customer_count: number; primary_goal: string; rethink_score: number;
    } | undefined;
  if (!row) return null;
  return {
    id: row.id, email: row.email, founderName: row.founder_name, businessName: row.business_name, idea: row.idea,
    targetCustomer: row.target_customer, category: row.category, stage: row.stage, websiteUrl: row.website_url,
    monthlyRevenue: row.monthly_revenue, customerCount: row.customer_count, primaryGoal: row.primary_goal, rethinkScore: row.rethink_score,
  };
}

export function getFounderGoals(businessId: string): FounderGoal[] {
  const rows = db.prepare('SELECT id, title, category, completed FROM founder_goals WHERE business_id = ? ORDER BY position, id').all(businessId) as { id: number; title: string; category: string; completed: number }[];
  return rows.map((row) => ({ id: row.id, title: row.title, category: row.category, completed: row.completed === 1 }));
}

export function setFounderGoalCompleted(businessId: string, goalId: number, completed: boolean) {
  const result = db.prepare('UPDATE founder_goals SET completed = ? WHERE id = ? AND business_id = ?').run(completed ? 1 : 0, goalId, businessId);
  if (result.changes) db.prepare('UPDATE founder_businesses SET updated_at = unixepoch() WHERE id = ?').run(businessId);
  return result.changes > 0;
}
