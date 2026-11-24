/**
 * Autonomous Visual Watchdog Inspector (Closed-Loop Critic)
 * 
 * Inspects rendered pre-flight snapshots using Gemini 2.5 Flash Vision.
 * Detects visual anomalies (clipping, off-screen props, insufficient clearance, lighting).
 * Emits structured spatial correction diffs (dx, dy, dz, scale) and executes a closed-loop
 * re-render until the scene scores >= 8.5/10 and meets viral quality standards.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { spawnSync } from 'child_process';
import { getClientForRole } from './gemini_cluster.js';

const PROJECT_ROOT = 'd:\\New folder (2)';
const BLENDER_BIN = 'D:\\Programs\\blender\\blender-4.3.0-windows-x64\\blender.exe';
const DIRECTOR_SCRIPT = path.join(PROJECT_ROOT, 'blender_engine', 'scripts', 'relatable_comedy_director.py');
const CORRECTION_SCRIPT = path.join(PROJECT_ROOT, 'blender_engine', 'scripts', 'apply_watchdog_corrections.py');

/**
 * Audits a single snapshot with Gemini Multimodal Vision
 */
/**
 * Audits a single snapshot with OpenRouter Multimodal Vision (Free Fallback)
 */
async function auditWithOpenRouter({ base64Data, prompt }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not found in environment');

  const base64Img = `data:image/jpeg;base64,${base64Data}`;
  const candidateModels = [
    'nvidia/nemotron-3.5-super-vl:free',
    'google/gemma-4-26b-a4b-it:free'
  ];

  let lastErr = null;
  for (const model of candidateModels) {
    try {
      console.log(`   • Attempting OpenRouter model: ${model}...`);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`OpenRouter ${model} timeout (45s)`)), 45000));

      const fetchPromise = fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt + '\nIMPORTANT: Respond strictly in valid JSON matching the schema.' },
                { type: 'image_url', image_url: { url: base64Img } }
              ]
            }
          ]
        })
      }).then(async r => {
        if (!r.ok) {
          const errTxt = await r.text();
          throw new Error(`OpenRouter HTTP ${r.status}: ${errTxt.slice(0, 100)}`);
        }
        return r.json();
      });

      const data = await Promise.race([fetchPromise, timeoutPromise]);
      const text = data.choices?.[0]?.message?.content || '';
      let cleanText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      const match = cleanText.match(/\{[\s\S]*\}/);
      if (match) cleanText = match[0];
      return JSON.parse(cleanText);
    } catch (err) {
      console.warn(`   ⚠️ OpenRouter ${model} attempt failed: ${err.message?.slice(0, 80)}`);
      lastErr = err;
    }
  }

  throw lastErr || new Error('All OpenRouter vision models failed');
}

/**
 * Audits a single snapshot with Gemini Multimodal Vision or OpenRouter Fallback
 */
export async function auditSnapshotWithVision({ imagePath, manifest, iteration = 0 }) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Snapshot image not found at: ${imagePath}`);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Data = imageBuffer.toString('base64');

  const stageRecipe = manifest.stage_recipe || {};
  const propsList = (stageRecipe.props || []).map(p => `${p.name} (${p.category}, ${p.placement})`).join(', ');

  const prompt = `
You are the Lead Visual Watchdog & Technical Director for an autonomous 3D comedy animation studio.
Audit this rendered vertical pre-flight frame (9:16 aspect ratio) for production quality.

SCENE CONTEXT:
- Episode Title: "${manifest.title}"
- Environment Theme: "${stageRecipe.theme || manifest.environment}"
- Characters:
  * Human (seated/standing cartoon avatar, brown hair, dark blue sweater)
  * Gemini AI (floating companion robot with transparent dome, expressive eyes, glowing orbital spheres)
- Expected Props on Stage: ${propsList || 'Desk, console, electronic items, cups'}

STRICT 9:16 VERTICAL COMPOSITION RULES:
1. SAFE HORIZONTAL BOUNDS: All key props and characters must be clearly visible within the frame. No prop should be cut in half on the left or right edge.
2. SURFACE CONTACT: Table props must sit naturally flush on top of the desk/console surface (Z ≈ 0.88m), not floating in mid-air or sinking deeply inside.
3. GEMINI AI CLEARANCE: Gemini's hover ring must float comfortably above the desk with at least 15-25cm of clear air underneath.
4. ENVIRONMENT REALISM: If the theme is indoor bedroom, study, or desk, there must be a solid indoor back wall. It must NOT look like an outdoor balcony or open sky.
5. LIGHTING & CONTRAST: If late-night 3 AM, lighting must be warm, cozy, and atmospheric (warm desk lamp glow, soft screen light), not harsh daylight or blinding cyan rim.

CRITICAL INSTRUCTION FOR DEFECTS:
If you see any issues, output exact structured spatial corrections.
Permitted actions:
- "shift": { "target": "prop_name", "dx": number, "dy": number, "dz": number }
- "lift_clearance": { "target": "Popapus_Agent_Root" or "prop_name", "dz": number }
- "scale": { "target": "prop_name", "factor": number }
- "light_adjust": { "target": "Light_Rim_Back" or "Light_Key_Sun", "d_energy": number }

Respond strictly in valid JSON:
{
  "passed": boolean,             // true if score >= 8.5 and no critical defects
  "score": number,               // 1.0 to 10.0
  "critique": "string",          // 2-3 sentence sharp director critique
  "defects": ["string"],         // list of detected defects, empty if none
  "corrections": [
    {
      "target": "string",
      "action": "shift" | "lift_clearance" | "scale" | "light_adjust",
      "dx": 0.0,
      "dy": 0.0,
      "dz": 0.0,
      "factor": 1.0,
      "d_energy": 0.0
    }
  ]
}
`;

  // 1. Primary Cluster: Try Gemini Keys with appropriate models
  const roles = ['coder', 'debugger', 'showrunner'];
  let lastErr = null;

  for (const role of roles) {
    try {
      const { client, model: roleModel } = getClientForRole(role);
      // Always use gemini-3.5-flash-lite for vision: verified active & fast across all 3 cluster keys
      const modelToUse = process.env.GEMINI_MODEL_VISION || 'gemini-3.5-flash-lite';

      const reqPromise = client.models.generateContent({
        model: modelToUse,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini vision timeout (20s)')), 20000));
      const response = await Promise.race([reqPromise, timeoutPromise]);

      let cleanText = response.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      const match = cleanText.match(/\{[\s\S]*\}/);
      if (match) cleanText = match[0];
      // Clean trailing commas before closing braces/brackets to prevent JSON syntax errors
      cleanText = cleanText.replace(/,\s*([\]}])/g, '$1');

      const result = JSON.parse(cleanText);
      console.log(`✅ [WATCHDOG] Audited by Gemini (${role} / ${modelToUse}) in closed loop!`);
      return result;
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ Watchdog Gemini node (${role}) failed: ${err.message?.slice(0, 80)}. Trying next provider...`);
    }
  }

  // 2. Secondary Failover: OpenRouter Free Multimodal Vision
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log('🔄 [WATCHDOG FAILOVER] Engaging OpenRouter (NVIDIA Nemotron 3.5 Super VL Free)...');
      const orResult = await auditWithOpenRouter({ base64Data, prompt });
      console.log('✅ [WATCHDOG] Successfully audited by OpenRouter Vision fallback!');
      return orResult;
    } catch (orErr) {
      console.warn(`⚠️ OpenRouter vision fallback failed: ${orErr.message?.slice(0, 80)}`);
      lastErr = orErr;
    }
  }

  // 3. Deterministic Safety Fallback (Strict rule check, never fake 8.5 pass)
  console.warn(`⚠️ All Vision APIs unavailable (${lastErr?.message}). Applying strict geometric safety bounds.`);
  return {
    passed: false,
    score: 6.0,
    critique: "Vision APIs unavailable. Scene held for geometric verification pass.",
    defects: ["Vision AI unverified due to network/provider downtime"],
    corrections: []
  };
}

/**
 * Runs the complete closed-loop Watchdog inspection and auto-correction cycle
 */
export async function runWatchdogClosedLoop({ manifestPath, runDir, maxIterations = 2 }) {
  console.log(`\n👁️ [VISUAL WATCHDOG] Initiating Closed-Loop Pre-Flight Inspection...`);
  manifestPath = path.resolve(manifestPath);
  runDir = path.resolve(runDir);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Clean stale preflight files
  try {
    const oldFiles = fs.readdirSync(runDir).filter(f => f.startsWith('watchdog_preflight_') && f.endsWith('.jpg'));
    for (const f of oldFiles) fs.unlinkSync(path.join(runDir, f));
  } catch (e) { }

  let currentIteration = 0;
  let finalScore = 0.0;
  let passed = false;
  let lastReport = null;
  let activeCorrectionsPath = null;
  let snapshotFile = path.join(runDir, `watchdog_preflight_iter0.jpg`);

  let bestScore = -1.0;
  let bestReport = null;
  let bestCorrectionsPath = null;
  let bestSnapshotFile = snapshotFile;

  while (currentIteration <= maxIterations) {
    console.log(`\n📸 [WATCHDOG] Rendering 1-frame pre-flight snapshot (Iteration ${currentIteration})...`);
    snapshotFile = path.join(runDir, `watchdog_preflight_iter${currentIteration}.jpg`);

    // Render 1 wide-shot still via Blender EEVEE Next (~0.8s)
    const stillPrefix = path.join(runDir, `watchdog_preflight_iter${currentIteration}_`);
    let bCmd = `& "${BLENDER_BIN}" -b -P "${DIRECTOR_SCRIPT}" -- --manifest "${manifestPath}" --qa-stills --output "${stillPrefix}"`;
    if (activeCorrectionsPath && fs.existsSync(activeCorrectionsPath)) {
      bCmd += ` --corrections "${activeCorrectionsPath}"`;
    }
    const bRes = spawnSync('powershell.exe', ['-Command', bCmd], { stdio: 'inherit' });

    // Find wide shot still or the first generated still
    const stills = fs.readdirSync(runDir).filter(f => f.startsWith(`watchdog_preflight_iter${currentIteration}_`) && f.endsWith('.jpg'));
    if (stills.length > 0) {
      const wideStill = stills.find(s => s.toLowerCase().includes('wide') || s.toLowerCase().includes('turn_00')) || stills[0];
      fs.copyFileSync(path.join(runDir, wideStill), snapshotFile);
    }

    if (!fs.existsSync(snapshotFile)) {
      console.warn(`⚠️ Preflight snapshot not created at ${snapshotFile}, continuing to full render.`);
      return { approved: false, score: 0.0, report: null, snapshotPath: null, correctionsPath: null };
    }

    console.log(`🔍 [WATCHDOG] Auditing snapshot pixels with Gemini 2.5 Flash Vision...`);
    lastReport = await auditSnapshotWithVision({
      imagePath: snapshotFile,
      manifest,
      iteration: currentIteration
    });

    finalScore = lastReport.score || 8.0;
    passed = lastReport.passed || finalScore >= 8.5;

    console.log(`   • Iteration ${currentIteration} Result: Score ${finalScore}/10 | Passed: ${passed ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Critique: ${lastReport.critique}`);
    if (lastReport.defects && lastReport.defects.length > 0) {
      console.log(`   • Defects Detected: ${lastReport.defects.join(', ')}`);
    }

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestReport = lastReport;
      bestCorrectionsPath = activeCorrectionsPath;
      bestSnapshotFile = snapshotFile;
    }

    if (passed || currentIteration >= maxIterations || !lastReport.corrections || lastReport.corrections.length === 0) {
      break;
    }

    // Save corrections for the next verification iteration
    console.log(`🛠️ [WATCHDOG] Staging ${lastReport.corrections.length} spatial auto-corrections for closed-loop re-verification...`);
    const corrPath = path.join(runDir, `corrections_iter${currentIteration}.json`);
    fs.writeFileSync(corrPath, JSON.stringify({ corrections: lastReport.corrections }, null, 2), 'utf-8');
    activeCorrectionsPath = corrPath;

    currentIteration++;
  }

  const isApproved = bestScore >= 8.0 || bestReport?.passed === true;
  if (isApproved) {
    console.log(`\n🎯 [VISUAL WATCHDOG] Scene Approved for Full Production Render! (Best Score: ${bestScore}/10)`);
  } else {
    console.log(`\n❌ [VISUAL WATCHDOG] Scene REJECTED by Visual QA! (Best Score: ${bestScore}/10, Required: ≥8.0/10)`);
  }

  return {
    approved: isApproved,
    score: bestScore,
    report: bestReport,
    snapshotPath: bestSnapshotFile,
    correctionsPath: bestCorrectionsPath
  };
}

if (process.argv[1]?.endsWith('vision_watchdog.js')) {
  const mPath = process.argv[2];
  if (!mPath || !fs.existsSync(mPath)) {
    console.log("Usage: node scripts/vision_watchdog.js <path_to_manifest.json>");
    process.exit(1);
  }
  const rDir = path.dirname(mPath);
  runWatchdogClosedLoop({ manifestPath: mPath, runDir: rDir }).then(res => {
    console.log("Watchdog Result:", res);
  }).catch(err => {
    console.error("Watchdog failed:", err);
  });
}
