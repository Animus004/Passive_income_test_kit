import path from 'path';
import { fileURLToPath } from 'url';
import { auditOddlyVideo } from './oddly_watchdog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const enVideo = path.join(PROJECT_ROOT, 'out', 'oddly_auto_en.mp4');
  const enManifest = path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_en.json');
  const enReport = await auditOddlyVideo({
    videoPath: enVideo,
    manifestPath: enManifest,
    language: 'en',
    topicTitle: 'COFFEE SHOPS ARE A HOSTAGE CRISIS',
  });

  const hiVideo = path.join(PROJECT_ROOT, 'out', 'oddly_auto_hi.mp4');
  const hiManifest = path.join(PROJECT_ROOT, 'src', 'data', 'oddly_manifest_hi.json');
  const hiReport = await auditOddlyVideo({
    videoPath: hiVideo,
    manifestPath: hiManifest,
    language: 'hi',
    topicTitle: '₹800 KI COFFEE KA SAAZISH',
  });

  console.log('\n====================================');
  console.log(`EN Passed: ${enReport.passed}`);
  console.log(`HI Passed: ${hiReport.passed}`);
  console.log('====================================\n');

  if (!enReport.passed || !hiReport.passed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
