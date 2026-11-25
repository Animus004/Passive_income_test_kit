/**
 * ==============================================================================
 * Phase 1 Autonomous 1,000+ Video Factory Orchestrator
 * ==============================================================================
 * Single clean entrypoint for Windows Task Scheduler or manual runs:
 *   --mode produce    : Tops up the ready buffer in D:\factory_workspace\ready (target=6)
 *   --mode publish    : Schedules up to 3 Shorts via publishAt + current slot IG/FB Reels
 *   --mode analytics  : Syncs YouTube view/retention metrics & prunes >7d archived files
 *   --mode status     : Prints complete SQLite buffer, upload, and disk health summary
 *   --mode daily      : Full produce-if-needed -> publish -> analytics cycle
 */

import fs from 'fs';
import { execSync } from 'child_process';
import { PATHS, ensureWorkspaceAndEnv, getFactoryDb } from './factory_db.mjs';
import { runFactoryBufferBatch } from './factory_worker.mjs';
import {
  dispatchScheduledPublishes,
  syncAnalyticsFeedback,
  pruneArchivedWorkspaceMedia,
} from './publish_dispatcher.mjs';
import { ensureTopicMatrixSeeded } from './topic_matrix_engine.mjs';

ensureWorkspaceAndEnv();

function printStatus() {
  const db = getFactoryDb();
  ensureTopicMatrixSeeded();

  const totalTopics = db.prepare('SELECT COUNT(*) as c FROM topics').get().c;
  const unusedTopics = db.prepare('SELECT COUNT(*) as c FROM topics WHERE used_count = 0').get().c;
  const readyJobs = db.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'ready'").get().c;
  const publishedJobs = db.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'published'").get().c;
  const dlqJobs = db.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'dead_letter'").get().c;
  const scheduledYt = db.prepare("SELECT COUNT(*) as c FROM uploads WHERE platform = 'youtube' AND status = 'scheduled'").get().c;

  console.log('===============================================================');
  console.log('🏭 PHASE 1 AUTONOMOUS 1,000+ VIDEO FACTORY — LIVE STATUS');
  console.log('===============================================================');
  console.log(`📁 Workspace Root    : ${PATHS.root}`);
  console.log(`🗄️ SQLite DB         : ${PATHS.dbFile}`);
  console.log(`🧠 Topic Matrix      : ${unusedTopics} unused / ${totalTopics} total coherent seeds`);
  console.log(`🎞️ Ready Buffer      : ${readyJobs} QA-verified MP4s ready in ${PATHS.ready}`);
  console.log(`📅 YouTube Scheduled : ${scheduledYt} queued ahead (Option A: 3/day spaced IST)`);
  console.log(`🚀 Total Published   : ${publishedJobs}`);
  console.log(`⚠️ Dead-Letter Queue : ${dlqJobs}`);
  console.log('===============================================================');
}

async function main() {
  const args = process.argv.slice(2);
  const modeIdx = args.indexOf('--mode');
  const mode = (modeIdx >= 0 && args[modeIdx + 1]) ? args[modeIdx + 1] : 'status';
  const isDryRun = args.includes('--dry-run');
  const withSocial = args.includes('--social');

  if (mode === 'status') {
    printStatus();
    return;
  }

  if (mode === 'produce') {
    await runFactoryBufferBatch({ targetBuffer: 6 });
    printStatus();
    return;
  }

  if (mode === 'publish') {
    const db = getFactoryDb();
    const readyCount = db.prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'ready'").get().c;
    if (readyCount === 0) {
      console.log('⚠️ Ready buffer empty at publish tick — producing 1 fresh episode safely under lock...');
      await runFactoryBufferBatch({ maxProduce: 1, targetBuffer: 1 });
    }
    await dispatchScheduledPublishes({ maxYouTubeSchedules: 3, publishSocialNow: withSocial, isDryRun });
    pruneArchivedWorkspaceMedia(7);
    printStatus();
    return;
  }

  if (mode === 'analytics') {
    await syncAnalyticsFeedback();
    pruneArchivedWorkspaceMedia(7);
    printStatus();
    return;
  }

  if (mode === 'daily') {
    await runFactoryBufferBatch({ targetBuffer: 6 });
    await dispatchScheduledPublishes({ maxYouTubeSchedules: 3, publishSocialNow: withSocial, isDryRun });
    try { await syncAnalyticsFeedback(); } catch (_) {}
    pruneArchivedWorkspaceMedia(7);
    printStatus();
    return;
  }

  throw new Error(`Unknown mode "${mode}". Use produce | publish | analytics | status | daily`);
}

main().catch((err) => {
  console.error('❌ Orchestrator error:', err);
  process.exit(1);
});
