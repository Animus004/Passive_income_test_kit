/**
 * ==============================================================================
 * Option-A Anti-Spam Scheduled Publisher & Analytics Feedback Sync
 * ==============================================================================
 * - Enforces Option A safety: max 3 YouTube Shorts per IST day at spaced windows
 *   (10:00 AM, 02:00 PM, 09:00 PM IST) using YouTube `publishAt` + `privacyStatus: 'private'`
 * - Prevents duplicate uploads via SQLite `md5_registry` & `uploads` table
 * - Supports Meta (Instagram Reels + Facebook Page) with quota pre-check + retries
 * - Prunes old uploaded MP4 files from D:\factory_workspace\ready (> 7 days)
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import {
  PATHS,
  PROJECT_ROOT,
  ensureWorkspaceAndEnv,
  getFactoryDb,
} from './factory_db.mjs';
import {
  getYouTubeClient,
  uploadPhase1YouTube,
  uploadPhase1Instagram,
  uploadPhase1Facebook,
  getInstagramPublishingLimit,
} from './publish_phase1.js';
import { sendTelegramReelAlert } from './telegram_notifier.js';
import { google } from 'googleapis';

ensureWorkspaceAndEnv();
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const IST_SLOTS_HOURS = [10, 14, 21]; // 10:00 AM, 02:00 PM, 09:00 PM IST (>= 4h gap)

/**
 * Formats an IST date/hour slot into ISO-8601 string accepted by YouTube `status.publishAt`.
 */
function buildIstSlotIso(dayOffset, hourIst) {
  const nowUtc = Date.now();
  const istOffsetMs = 5.5 * 3600 * 1000;
  const nowIst = new Date(nowUtc + istOffsetMs);
  const y = nowIst.getUTCFullYear();
  const m = String(nowIst.getUTCMonth() + 1).padStart(2, '0');
  const d = nowIst.getUTCDate() + dayOffset;

  const targetUtc = new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), d, hourIst, 0, 0));
  // Convert IST wall-clock back to exact UTC -> ISO with +05:30 or trailing Z
  const utcMs = targetUtc.getTime() - istOffsetMs;
  if (utcMs <= nowUtc + 15 * 60 * 1000) return null; // Must be >= 15 mins in future
  return new Date(utcMs).toISOString();
}

/**
 * Finds the earliest unoccupied spaced IST publish slot over the next 21 days.
 */
function findNextAvailablePublishSlot(db) {
  const existing = db
    .prepare(
      `SELECT scheduled_publish_at FROM uploads
       WHERE platform = 'youtube' AND scheduled_publish_at IS NOT NULL AND status IN ('scheduled', 'published')`
    )
    .all()
    .map((r) => new Date(r.scheduled_publish_at).getTime());

  for (let day = 0; day <= 21; day++) {
    for (const hr of IST_SLOTS_HOURS) {
      const iso = buildIstSlotIso(day, hr);
      if (!iso) continue;
      const ms = new Date(iso).getTime();
      const occupied = existing.some((exMs) => Math.abs(exMs - ms) < 90 * 60 * 1000);
      if (!occupied) {
        return iso;
      }
    }
  }
  return buildIstSlotIso(1, 10);
}

/**
 * Dispatches ready buffered videos to YouTube native scheduled queue + optional immediate IG/FB.
 */
export async function dispatchScheduledPublishes({
  maxYouTubeSchedules = 3,
  publishSocialNow = false,
  isDryRun = false,
} = {}) {
  const db = getFactoryDb();

  const readyJobs = db
    .prepare(
      `SELECT j.* FROM jobs j
       LEFT JOIN uploads u ON j.id = u.job_id AND u.platform = 'youtube'
       WHERE j.status = 'ready' AND u.id IS NULL
       ORDER BY j.created_at ASC
       LIMIT ?`
    )
    .all(maxYouTubeSchedules);

  if (readyJobs.length === 0) {
    console.log('📭 [DISPATCHER] No unscheduled ready videos in buffer.');
    return { scheduled: 0 };
  }

  let scheduledCount = 0;
  for (const job of readyJobs) {
    if (!job.video_path || !fs.existsSync(job.video_path)) {
      console.warn(`⚠️ Skipping job ${job.id}: video missing at ${job.video_path}`);
      continue;
    }

    const publishAtIso = findNextAvailablePublishSlot(db);
    const title = job.title_hi
      ? `${job.title_hinglish || job.topic_text} | ${job.title_hi}`
      : job.topic_text;

    try {
      const ytRes = await uploadPhase1YouTube({
        videoPath: job.video_path,
        title,
        description: job.description_hi || job.topic_text,
        publishAt: isDryRun ? null : publishAtIso,
        isDryRun,
      });

      if (!isDryRun && ytRes.success) {
        db.prepare(
          `INSERT INTO uploads (job_id, platform, stream_md5, remote_id, remote_url, scheduled_publish_at, status, attempts)
           VALUES (?, 'youtube', ?, ?, ?, ?, 'scheduled', 1)`
        ).run(job.id, job.stream_md5, ytRes.videoId, ytRes.url, publishAtIso);

        db.prepare(`UPDATE jobs SET status = 'published', updated_at = datetime('now') WHERE id = ?`).run(job.id);
        scheduledCount++;
      }
    } catch (err) {
      console.error(`❌ YouTube dispatch error [${job.id}]: ${err.message}`);
      db.prepare(
        `INSERT OR REPLACE INTO uploads (job_id, platform, stream_md5, scheduled_publish_at, status, attempts, last_error)
         VALUES (?, 'youtube', ?, ?, 'failed', 1, ?)`
      ).run(job.id, job.stream_md5, publishAtIso, err.message);
    }

    // Immediate Meta Social Dispatch (only 1 per window when triggered during an active publish window)
    if (publishSocialNow && scheduledCount === 1) {
      const igQuota = await getInstagramPublishingLimit();
      if (igQuota.available) {
        try {
          const igRes = await uploadPhase1Instagram({
            videoPath: job.video_path,
            caption: job.title_hi || title,
            isDryRun,
          });
          if (!isDryRun && igRes.success) {
            db.prepare(
              `INSERT OR IGNORE INTO uploads (job_id, platform, stream_md5, remote_id, status, attempts)
               VALUES (?, 'instagram', ?, ?, 'published', 1)`
            ).run(job.id, job.stream_md5, igRes.id);
          }
        } catch (igErr) {
          console.warn(`⚠️ IG publish failed, sending Telegram fallback: ${igErr.message}`);
          await sendTelegramReelAlert({
            videoPath: job.video_path,
            title,
            caption: `${job.title_hi || title}\n\n#Reels #HindiShorts #IndianHistory`,
            reason: igErr.message,
            platform: 'Instagram',
          });
        }
      } else {
        console.log(`⏳ Instagram 24h limit reached (${igQuota.quotaUsage}/${igQuota.quotaTotal}). Skipping IG.`);
      }

      try {
        const fbRes = await uploadPhase1Facebook({
          videoPath: job.video_path,
          title: job.title_hi || title,
          description: job.description_hi || '',
          isDryRun,
        });
        if (!isDryRun && fbRes.success) {
          db.prepare(
            `INSERT OR IGNORE INTO uploads (job_id, platform, stream_md5, remote_id, status, attempts)
             VALUES (?, 'facebook', ?, ?, 'published', 1)`
          ).run(job.id, job.stream_md5, fbRes.videoId);
        }
      } catch (fbErr) {
        console.warn(`⚠️ Facebook Reel notice: ${fbErr.message}`);
      }
    }
  }

  return { scheduled: scheduledCount };
}

/**
 * Queries live YouTube performance metrics and adjusts SQLite `topics.priority_score`
 * so high-performing historical/modern archetypes automatically earn more weight.
 */
export async function syncAnalyticsFeedback() {
  const db = getFactoryDb();
  const rows = db
    .prepare(
      `SELECT u.remote_id, u.job_id, j.topic_id FROM uploads u
       JOIN jobs j ON j.id = u.job_id
       WHERE u.platform = 'youtube' AND u.remote_id IS NOT NULL
       ORDER BY u.created_at DESC LIMIT 40`
    )
    .all();

  if (rows.length === 0) {
    console.log('📊 [ANALYTICS] No factory YouTube uploads recorded yet to sync.');
    return { synced: 0 };
  }

  const auth = await getYouTubeClient();
  const youtube = google.youtube({ version: 'v3', auth });
  const ids = rows.map((r) => r.remote_id);

  const vRes = await youtube.videos.list({ part: ['statistics'], id: ids });
  const items = vRes.data.items || [];
  if (items.length === 0) return { synced: 0 };

  const upsertStats = db.prepare(`
    INSERT INTO analytics (remote_id, job_id, views, likes, comments, retention_score, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(remote_id) DO UPDATE SET
      views = excluded.views,
      likes = excluded.likes,
      comments = excluded.comments,
      retention_score = excluded.retention_score,
      fetched_at = datetime('now')
  `);

  let totalViews = 0;
  const parsed = items.map((v) => {
    const views = parseInt(v.statistics?.viewCount || '0', 10);
    const likes = parseInt(v.statistics?.likeCount || '0', 10);
    const comments = parseInt(v.statistics?.commentCount || '0', 10);
    totalViews += views;
    return { id: v.id, views, likes, comments };
  });

  const avgViews = Math.max(100, totalViews / parsed.length);
  const bumpTopic = db.prepare(`UPDATE topics SET priority_score = MIN(3.0, MAX(0.4, ?)) WHERE id = ?`);

  for (const item of parsed) {
    const row = rows.find((r) => r.remote_id === item.id);
    const ratio = item.views / avgViews;
    upsertStats.run(item.id, row?.job_id || null, item.views, item.likes, item.comments, Number(ratio.toFixed(2)));
    if (row?.topic_id) {
      bumpTopic.run(Number((1.0 + (ratio - 1.0) * 0.4).toFixed(2)), row.topic_id);
    }
  }

  console.log(`📊 [ANALYTICS SYNCED] Updated performance weights for ${parsed.length} Shorts (Avg Views: ${Math.round(avgViews)}).`);
  return { synced: parsed.length, avgViews: Math.round(avgViews) };
}

/**
 * Removes archived ready MP4s & per-job scratch dirs older than 7 days once YouTube upload is confirmed.
 */
export function pruneArchivedWorkspaceMedia(retentionDays = 7) {
  const db = getFactoryDb();
  const oldUploaded = db
    .prepare(
      `SELECT j.id, j.video_path, j.job_dir FROM jobs j
       JOIN uploads u ON u.job_id = j.id AND u.platform = 'youtube' AND u.status IN ('scheduled', 'published')
       WHERE j.status = 'published' AND j.updated_at < datetime('now', ?)`
    )
    .all(`-${retentionDays} days`);

  let pruned = 0;
  for (const item of oldUploaded) {
    try {
      if (item.video_path && fs.existsSync(item.video_path)) fs.unlinkSync(item.video_path);
      if (item.job_dir && fs.existsSync(item.job_dir)) fs.rmSync(item.job_dir, { recursive: true, force: true });
      pruned++;
    } catch (_) {}
  }

  if (pruned > 0) console.log(`🧹 [HYGIENE] Pruned ${pruned} archived >${retentionDays}-day jobs from D:\\factory_workspace.`);
  return pruned;
}

if (process.argv[1] && process.argv[1].endsWith('publish_dispatcher.mjs')) {
  const isDryRun = process.argv.includes('--dry-run');
  const publishSocialNow = process.argv.includes('--social');
  const syncStats = process.argv.includes('--sync-analytics');

  (async () => {
    if (syncStats) {
      await syncAnalyticsFeedback();
    } else {
      await dispatchScheduledPublishes({ maxYouTubeSchedules: 3, publishSocialNow, isDryRun });
      pruneArchivedWorkspaceMedia(7);
    }
  })().catch((err) => {
    console.error('❌ Dispatcher error:', err);
    process.exit(1);
  });
}
