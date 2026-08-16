import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

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
