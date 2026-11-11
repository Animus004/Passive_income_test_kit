/**
 * Standalone 3x/day Scheduler for YouTube Shorts Automation
 * Fires daily at:
 * - 08:30 (Morning)
 * - 14:00 (Afternoon)
 * - 19:30 (Evening)
 */

const { autoPublish } = require('./auto_publish');

const SCHEDULE_TIMES = [
  { label: 'Morning', hour: 8, minute: 30 },
  { label: 'Afternoon', hour: 14, minute: 0 },
  { label: 'Evening', hour: 19, minute: 30 },
];

let lastRunDate = {};

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

console.log('===============================================================');
console.log('⏰ YOUTUBE SHORTS 3x/DAY AUTOMATION DAEMON RUNNING');
console.log('===============================================================');
console.log('Scheduled daily posting times:');
SCHEDULE_TIMES.forEach((s) => {
  const padH = String(s.hour).padStart(2, '0');
  const padM = String(s.minute).padStart(2, '0');
  console.log(`  ☀️ ${s.label.padEnd(10)}: ${padH}:${padM} (Local Time)`);
});
console.log('\nLeave this terminal open, or use Windows Task Scheduler.');
console.log('===============================================================\n');

async function checkSchedule() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayKey = now.toISOString().slice(0, 10);

  for (const s of SCHEDULE_TIMES) {
    const runKey = `${todayKey}_${s.label}`;
    if (currentHour === s.hour && currentMinute === s.minute && !lastRunDate[runKey]) {
      lastRunDate[runKey] = true;
      console.log(`\n🔔 TRIGGERING ${s.label.toUpperCase()} POST at ${formatTime(now)}...`);
      try {
        await autoPublish();
      } catch (err) {
        console.error(`❌ Error in ${s.label} auto-publish:`, err);
      }
    }
  }
}

// Check every 30 seconds
setInterval(checkSchedule, 30 * 1000);
checkSchedule();

