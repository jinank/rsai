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
  CREATE TABLE IF NOT EXISTS kit_interests (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    app_slug TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(email, app_slug)
  );
  CREATE TABLE IF NOT EXISTS creator_submissions (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    product_name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(email, product_url)
  );
`);
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

export function addKitInterest(email: string, appSlug: string) {
  const result = db.prepare('INSERT OR IGNORE INTO kit_interests (email, app_slug) VALUES (?, ?)').run(email.trim().toLowerCase(), appSlug);
  return result.changes > 0;
}

export function addCreatorSubmission(email: string, productName: string, productUrl: string, notes: string) {
  const result = db.prepare('INSERT OR IGNORE INTO creator_submissions (email, product_name, product_url, notes) VALUES (?, ?, ?, ?)').run(email.trim().toLowerCase(), productName.trim(), productUrl.trim(), notes.trim());
  return result.changes > 0;
}
