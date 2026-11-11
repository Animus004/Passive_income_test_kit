/**
 * Fully Autonomous YouTube Shorts Engine
 * 1. Generates fresh viral script + dynamic storyboard via Gemini 2.5 Flash
 * 2. Generates Neural Edge-TTS voiceover + word timestamps (100% free)
 * 3. Renders 1080x1920 30fps vertical video via Remotion Dynamic Visual Director
 * 4. Uploads to YouTube as PUBLIC with title, description, tags & hashtags
 * 5. Logs to history.json to ensure 0 duplicate topics forever
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { generateNextShortScript } = require('./ai_script_engine');
const { uploadVideo } = require('./upload_youtube');

const ROOT_DIR = path.resolve(__dirname, '..');
const HISTORY_FILE = path.join(ROOT_DIR, 'history.json');
const PYTHON_SCRIPT = path.join(__dirname, 'generate_audio.py');

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function runCommand(command, args, cwd = ROOT_DIR) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️ Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Command "${command}" exited with code ${code}`));
      }
      resolve();
    });

    child.on('error', reject);
  });
}

async function autoPublish() {
  console.log('===============================================================');
  console.log('🤖 AUTONOMOUS AI YOUTUBE SHORTS PUBLISHER (ZERO-TOUCH ENGINE)');
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log('===============================================================\n');

  // Step 1: AI Brainstorms New Script + Dynamic Storyboard
  console.log('🧠 Step 1: Brainstorming unique viral script via Gemini 2.5 Flash...');
  const topic = await generateNextShortScript();
  console.log(`📌 Generated Topic: "${topic.title}"`);

  // Step 2: Voiceover + Word Boundaries via Edge-TTS
  console.log('\n🎙️ Step 2: Synthesizing voiceover and word boundaries via Edge-TTS...');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  await runCommand(pythonCmd, [
    PYTHON_SCRIPT,
    '--text',
    `"${topic.script.replace(/"/g, '\\"')}"`,
    '--voice',
    'en-US-ChristopherNeural',
  ]);

  // Step 3: Render Remotion Video with Dynamic Visual Director
  console.log('\n🎬 Step 3: Rendering 1080x1920 video with Dynamic Visual Director...');
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const outPath = path.join(ROOT_DIR, 'out', 'final_short.mp4');
  await runCommand(npxCmd, [
    'remotion',
    'render',
    'src/index.ts',
    'ShortVideo',
    'out/final_short.mp4',
    '--overwrite',
  ]);

  // Step 4: Publish to YouTube as PUBLIC
  console.log('\n🚀 Step 4: Uploading directly to YouTube as PUBLIC...');
  const description = `${topic.hook}\n\n${topic.script}\n\nSubscribe for daily mind-blowing tech and science shorts!\n\n${topic.hashtags}`;
  
  const uploadResult = await uploadVideo({
    videoPath: outPath,
    title: topic.title,
    description,
    tags: topic.tags,
    privacyStatus: process.env.YOUTUBE_PRIVACY_STATUS || 'public',
  });

  // Step 5: Save to History to ensure non-repetition
  const history = loadHistory();
  const entry = {
    id: topic.id,
    title: topic.title,
    videoId: uploadResult.id,
    videoUrl: `https://youtube.com/shorts/${uploadResult.id}`,
    publishedAt: new Date().toISOString(),
    status: 'public',
  };
  history.push(entry);
  saveHistory(history);

  console.log('\n===============================================================');
  console.log('🎉 REEL PRODUCED & PUBLISHED WITH ZERO HUMAN TOUCH!');
  console.log(`   Shorts Link: https://youtube.com/shorts/${uploadResult.id}`);
  console.log('===============================================================\n');

  return entry;
}

if (require.main === module) {
  autoPublish().catch((err) => {
    console.error('\n❌ Auto-publish error:', err.message);
    process.exit(1);
  });
}

module.exports = { autoPublish };
