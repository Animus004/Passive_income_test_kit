/**
 * ==============================================================================
 * Autonomous Factory State Store, D: Drive Workspace & Process Mutex
 * ==============================================================================
 * Uses Node v22+ built-in `node:sqlite` (DatabaseSync) — zero native addons.
 * Routes all heavy scratch artifacts, temp Chromium profiles, caches, SQLite DB,
 * pre-bundled Remotion output, and 7-day ready video buffer onto D:\ so C:\ stays untouched.
 */

import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '..');

const HAS_D_DRIVE = fs.existsSync('D:\\');
export const WORKSPACE_ROOT = process.env.FACTORY_WORKSPACE_DIR
  || (HAS_D_DRIVE ? 'D:\\factory_workspace' : path.join(PROJECT_ROOT, 'scratch', 'factory_workspace'));

export const PATHS = {
  root: WORKSPACE_ROOT,
  dbDir: path.join(WORKSPACE_ROOT, 'db'),
  dbFile: path.join(WORKSPACE_ROOT, 'db', 'factory.db'),
  tmp: path.join(WORKSPACE_ROOT, 'tmp'),
  jobs: path.join(WORKSPACE_ROOT, 'jobs'),
  ready: path.join(WORKSPACE_ROOT, 'ready'),
  bundle: path.join(WORKSPACE_ROOT, 'bundle'),
  logs: path.join(WORKSPACE_ROOT, 'logs'),
  locks: path.join(WORKSPACE_ROOT, 'locks'),
  bundleMeta: path.join(WORKSPACE_ROOT, 'bundle', 'bundle_meta.json'),
};

/**
 * Ensures all D:\factory_workspace folders exist and redirects OS temp variables
 * so Remotion/Chromium/Puppeteer never write GBs of caches onto C:\.
 */
export function ensureWorkspaceAndEnv() {
  for (const dir of [
    PATHS.root,
    PATHS.dbDir,
    PATHS.tmp,
    PATHS.jobs,
    PATHS.ready,
    PATHS.bundle,
    PATHS.logs,
    PATHS.locks,
  ]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  process.env.TMP = PATHS.tmp;
  process.env.TEMP = PATHS.tmp;
  process.env.TMPDIR = PATHS.tmp;
  process.env.PUPPETEER_TMP_DIR = PATHS.tmp;
  return PATHS;
}

let _dbInstance = null;

export function getFactoryDb() {
  if (_dbInstance) return _dbInstance;
  ensureWorkspaceAndEnv();

  const db = new DatabaseSync(PATHS.dbFile);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 8000;');
  db.exec('PRAGMA synchronous = NORMAL;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_key TEXT NOT NULL UNIQUE,
      topic_text TEXT NOT NULL,
      pillar TEXT NOT NULL,
      era TEXT NOT NULL CHECK(era IN ('ancient', 'modern')),
      primary_role TEXT NOT NULL,
      secondary_role TEXT,
      angle TEXT NOT NULL,
      preferred_mood TEXT DEFAULT 'epic',
      priority_score REAL DEFAULT 1.0,
      source TEXT DEFAULT 'matrix',
      used_count INTEGER DEFAULT 0,
      last_used_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      topic_id INTEGER REFERENCES topics(id),
      topic_text TEXT NOT NULL,
      era TEXT NOT NULL,
      slot TEXT NOT NULL,
      mood TEXT DEFAULT 'epic',
      status TEXT NOT NULL DEFAULT 'queued',
      job_dir TEXT NOT NULL,
      manifest_path TEXT,
      audio_path TEXT,
      video_path TEXT,
      stream_md5 TEXT,
      title_hi TEXT,
      title_hinglish TEXT,
      description_hi TEXT,
      vision_score REAL DEFAULT 0,
      repair_attempts INTEGER DEFAULT 0,
      error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL REFERENCES jobs(id),
      platform TEXT NOT NULL,
      stream_md5 TEXT,
      remote_id TEXT,
      remote_url TEXT,
      scheduled_publish_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      last_error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(job_id, platform)
    );

    CREATE TABLE IF NOT EXISTS analytics (
      remote_id TEXT PRIMARY KEY,
      job_id TEXT REFERENCES jobs(id),
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      retention_score REAL DEFAULT 0,
      fetched_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS md5_registry (
      stream_md5 TEXT PRIMARY KEY,
      source_title TEXT,
      recorded_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_topics_avail ON topics(used_count, priority_score DESC);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_uploads_sched ON uploads(platform, scheduled_publish_at, status);
  `);

  migrateLegacyHistory(db);
  _dbInstance = db;
  return db;
}

export function normalizeTopicKey(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

export function computeWordNGrams(text, n = 3) {
  const words = normalizeTopicKey(text).split(' ').filter(Boolean);
  if (words.length <= n) return new Set([words.join(' ')]);
  const grams = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    grams.add(words.slice(i, i + n).join(' '));
  }
  return grams;
}

export function jaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const g of setA) {
    if (setB.has(g)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Seeds legacy topic & MD5 history into SQLite once so historical episodes never repeat.
 */
function migrateLegacyHistory(db) {
  const insMd5 = db.prepare('INSERT OR IGNORE INTO md5_registry (stream_md5, source_title) VALUES (?, ?)');
  const insTopic = db.prepare(`
    INSERT OR IGNORE INTO topics
      (topic_key, topic_text, pillar, era, primary_role, angle, used_count, last_used_at, source)
    VALUES (?, ?, 'legacy', 'modern', 'modern_creator', 'legacy_seed', 1, ?, 'legacy_migration')
  `);

  const oddlyPath = path.join(PROJECT_ROOT, 'scratch', 'oddly_history.json');
  if (fs.existsSync(oddlyPath)) {
    try {
      const items = JSON.parse(fs.readFileSync(oddlyPath, 'utf-8')) || [];
      for (const item of items) {
        if (item.hiStreamMD5) insMd5.run(item.hiStreamMD5, item.titleHi || item.topic || 'legacy');
        if (item.enStreamMD5) insMd5.run(item.enStreamMD5, item.titleEn || item.topic || 'legacy');
        if (item.topic) {
          insTopic.run(normalizeTopicKey(item.topic), item.topic, item.timestamp || new Date().toISOString());
        }
      }
    } catch (_) {}
  }

  const uploadHistPath = path.join(PROJECT_ROOT, 'data', 'upload_history.json');
  if (fs.existsSync(uploadHistPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(uploadHistPath, 'utf-8'));
      const list = Array.isArray(raw) ? raw : (raw?.uploads || []);
      for (const u of list) {
        if (u.videoStreamMD5) insMd5.run(u.videoStreamMD5, u.title || 'legacy_upload');
      }
    } catch (_) {}
  }
}

export function isStreamMd5Seen(db, md5) {
  if (!md5) return false;
  const row = db.prepare('SELECT stream_md5 FROM md5_registry WHERE stream_md5 = ?').get(md5);
  return Boolean(row);
}

export function registerStreamMd5(db, md5, title = '') {
  if (!md5) return;
  db.prepare('INSERT OR IGNORE INTO md5_registry (stream_md5, source_title) VALUES (?, ?)').run(md5, title);
}

/**
 * File-based cross-process mutex so overlapping Task Scheduler triggers never crash 7.37 GB RAM.
 */
export function acquireProcessLock(lockName = 'factory_render', staleTimeoutMs = 45 * 60 * 1000) {
  ensureWorkspaceAndEnv();
  const lockFile = path.join(PATHS.locks, `${lockName}.lock`);

  if (fs.existsSync(lockFile)) {
    try {
      const meta = JSON.parse(fs.readFileSync(lockFile, 'utf-8'));
      const ageMs = Date.now() - (meta.startedAt || 0);
      let pidAlive = false;
      if (meta.pid) {
        try {
          process.kill(meta.pid, 0);
          pidAlive = true;
        } catch (_) {
          pidAlive = false;
        }
      }
      if (pidAlive && ageMs < staleTimeoutMs) {
        return null; // Another live process owns the lock
      }
      fs.unlinkSync(lockFile);
    } catch (_) {
      try { fs.unlinkSync(lockFile); } catch (__) {}
    }
  }

  try {
    const fd = fs.openSync(lockFile, 'wx');
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: Date.now(), lockName }, null, 2));
    fs.closeSync(fd);
  } catch (_) {
    return null;
  }

  return () => {
    try {
      if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
    } catch (_) {}
  };
}
