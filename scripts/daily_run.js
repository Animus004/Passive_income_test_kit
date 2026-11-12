/**
 * Autonomous Master Production Pipeline for YouTube Shorts
 * Single command execution: Topic Selection -> Gemini Script -> edge-tts Audio & Subtitles -> Remotion Headless Render
 * 
 * Usage:
 *   npm run build:daily
 *   node scripts/daily_run.js --topic "High-Frequency Trading Fiber Cables"
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GENERATE_SCRIPT = 'scripts/generate_script.js';
const FETCH_BROLL = 'scripts/fetch_broll.js';
const GENERATE_AUDIO = 'scripts/generate_audio.js';
const CURRENT_SHORT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'current_short.json');
const OUT_DIR = path.join(PROJECT_ROOT, 'out');

function parseArgs() {
  const rawArgs = process.argv.slice(2);
  const args = rawArgs.filter((a) => a !== '--');
  let topic = null;
  let dryRun = false;
  let publish = false;
  let composition = process.env.REMOTION_COMPOSITION || 'KurzgesagtExplainer';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--publish') {
      publish = true;
    } else if (args[i] === '--composition' && args[i + 1]) {
      composition = args[i + 1];
      i++;
    }
  }

  return { topic, dryRun, publish, composition };
}

function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    const formattedArgs = args.map((arg) =>
      typeof arg === 'string' && arg.includes(' ') && !arg.startsWith('"')
        ? `"${arg}"`
        : arg
    );

    console.log(`\n====================================================`);
    console.log(`🚀 [PIPELINE] ${description}`);
    console.log(`Command: ${command} ${formattedArgs.join(' ')}`);
    console.log(`====================================================\n`);

    const proc = spawn(command, formattedArgs, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Step [${description}] failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => reject(err));
  });
}

async function main() {
  const startTime = Date.now();
  const { topic, dryRun, publish, composition } = parseArgs();

  console.log('####################################################');
  console.log('🎬 AUTONOMOUS SHORTS PIPELINE: MASTER RUN INITIALIZED');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Composition Engine: "${composition}"`);
  if (topic) console.log(`Custom Topic Override: "${topic}"`);
  if (publish) console.log(`Auto-Publish: ENABLED (YouTube & Instagram)`);
  console.log('####################################################');

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // STEP 1: Automated Gemini Script Generation
  const scriptArgs = [GENERATE_SCRIPT];
  if (topic) {
    scriptArgs.push('--topic', topic);
  }
  await runCommand('node', scriptArgs, 'Step 1: Automated Gemini Script Generation');

  if (!fs.existsSync(CURRENT_SHORT_PATH)) {
    throw new Error(`Failed to find generated script at ${CURRENT_SHORT_PATH}`);
  }
  const currentShort = JSON.parse(fs.readFileSync(CURRENT_SHORT_PATH, 'utf-8'));
  console.log(`\n📝 Generated Video Title: "${currentShort.videoTitle}"`);

  // STEP 2: Automated B-Roll Media Fetcher
  await runCommand('node', [FETCH_BROLL], 'Step 2: Automated Topic B-Roll & Visual Asset Downloader');

  // STEP 3: TTS Synthesis & Timeline Synchronization
  await runCommand('node', [GENERATE_AUDIO], 'Step 3: TTS Synthesis & Timeline Synchronization');

  if (dryRun) {
    console.log('\n🏁 [DRY RUN] Script and audio generated. Skipping Remotion render.');
    return;
  }

  // STEP 3: Headless Remotion Render
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const outputFileName = `short_${timestampStr}.mp4`;
  const outputPath = path.join(OUT_DIR, outputFileName);
  const relativeOutputPath = `out/${outputFileName}`;

  const renderArgs = [
    'remotion',
    'render',
    'src/index.ts',
    composition,
    relativeOutputPath,
    '--concurrency=4',
    '--image-format=jpeg',
    '--overwrite',
  ];

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    renderArgs.push(`--browser-executable=${process.env.PUPPETEER_EXECUTABLE_PATH}`);
  }

  if (process.platform === 'linux') {
    renderArgs.push('--enable-multiprocess-on-linux');
  }

  await runCommand('npx', renderArgs, `Step 3: Headless Remotion Render [${composition}] (${outputFileName})`);

  // STEP 4: Verification
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Render output file was not found at ${outputPath}`);
  }

  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n====================================================');
  console.log('🎉 RENDER COMPLETED SUCCESSFULLY!');
  console.log(`📁 Master Video: ${outputPath}`);
  console.log(`📦 File Size: ${sizeMB} MB`);
  console.log(`⏱️ Total Execution Time: ${elapsedSec}s`);
  console.log(`🏷️ Title: "${currentShort.videoTitle}"`);
  console.log('====================================================\n');

  // STEP 5: Automated Multi-Platform Publishing (if --publish is enabled)
  if (publish) {
    await runCommand('node', ['scripts/publish_all.js', '--video', outputPath], 'Step 4: Autonomous YouTube / Social Publishing');
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\n❌ PIPELINE HALTED WITH ERROR:', err.message || err);
    process.exit(1);
  });
}

module.exports = { main };

