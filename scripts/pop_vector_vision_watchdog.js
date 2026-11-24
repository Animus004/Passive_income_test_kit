/**
 * Gemini Multimodal Pop-Vector Visual QA Watchdog (The Dog with Eyes)
 * 
 * Inspects rendered proof still frames of generated 2D Pop-Vector scenes.
 * Evaluates:
 * 1. Bold Pop-Vector aesthetic (thick black borders, vibrant flat colors, halftone/speedline BG)
 * 2. Googly eyes presence & expressive placement
 * 3. Screen centering & balance (no 70% empty voids, no clipping)
 * 4. Text & badge readability (zero overlapping text pills or collisions)
 * 5. Direct topical grounding to the spoken words
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { getClientForRole } from './gemini_cluster.js';

export async function auditPopVectorStill({
  imagePath,
  topic = '',
  sceneIndex = 1,
  narration = '',
  expectedHero = '',
}) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`QA Proof Image not found at: ${imagePath}`);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Data = imageBuffer.toString('base64');

  const prompt = `
You are the Senior Art Director & Ruthless Quality Watchdog for a top-tier viral 2D Pop-Vector animation studio ("Oddly Told" / "Kurzgesagt" comedy style).
Inspect this rendered snapshot frame from Scene ${sceneIndex} of our automated pipeline.

Context:
- Video Topic: "${topic}"
- Spoken Narration: "${narration}"
- Expected Hero Element: "${expectedHero}"

RUTHLESS ART CRITIQUE & SPATIAL STAGING CRITERIA (BE STRICT - DO NOT RUBBER-STAMP):
1. NO CHARACTER-PROP COLLISIONS OR AWKWARD OCCLUSION:
   - Does a HeroProp (card, phone, scroll, chest, siren) overlap or cover the character's face, eyes, or torso?
   - Are multiple objects crammed on top of each other into an unreadable clump?
   - Rule: If both a Character and a HeroProp exist in the scene, they MUST be cleanly separated into Split Duo Staging (Prop centered at X≈320-360, Character centered at X≈720-760, with at least 80px clear buffer between their bounding boxes).
   - If overlapping or occluded: IMMEDIATE FAIL (collision_detected = true).

2. STRICT SPATIAL GROUNDING (NO MID-AIR LEVITATION):
   - Is the character or prop floating awkwardly in empty mid-air with no contact with the floor or desk?
   - The floor horizon or desk plane is at Y=1220. Characters must stand or sit firmly with feet/base anchored to this line.
   - If floating in mid-air without narrative context (like a ghost): IMMEDIATE FAIL (floating_detected = true).

3. STAGING ARCHETYPE ADHERENCE (NO WEIRD CORNER CRAMMING):
   - Must clearly follow one of 3 professional staging archetypes:
     * Archetype A: Solo Hero Centered (Object/Character centered at X=540, Y=820, scale 1.3-1.5).
     * Archetype B: Clean Split Duo (Prop at X=340, Character at X=740, floor-anchored at Y=900).
     * Archetype C: Reaction Face Close-Up (Centered at X=540, Y=800, scale 1.4-1.6).
   - If elements are bunched into an awkward off-center corner or cropped by screen edges: IMMEDIATE FAIL (staging_defect_detected = true).

4. NO MUTANT / DUPLICATE EYES:
   - Does the character have more than 2 eyes?
   - Did the animator mistakenly draw SVG eye circles AND put <GooglyEyes /> over them, creating 4 eyes or overlapping pupil glitches?
   - If yes: IMMEDIATE FAIL (mutant_eyes_detected = true).

5. NO EMPTY STERILE VOIDS (>35% VOID = FAIL):
   - Is the character or hero prop tiny, leaving 70-80% of the screen as an empty beige/black desert?
   - The hero composition must feel commanding, spanning 450px-750px width between Y=250 and Y=1280.
   - If tiny: IMMEDIATE FAIL (empty_void_detected = true).
   - EXCEPTION FOR THEATRICAL STAGING: In 'puppet_stage_shadow', a deep midnight blue stage illuminated by a conical spotlight, suspended puppet strings, and floor reflections is an intentional director metaphor for psychological warfare/manipulation. It is NOT an empty void!

6. ENVIRONMENT GROUNDING & DRAMATIC ATMOSPHERE:
   - The scene MUST have a matching environmental backdrop:
     * Architectural backdrops: 'ancient_palace', 'temple_vault', 'chaupar_board_arena', 'durbar_throne_room', 'subterranean_dungeon_vault', 'modern_finance', 'office_desk' with defined floor perspective and pillars/props.
     * Theatrical / Psychological Metaphor backdrops: 'puppet_stage_shadow' (deep midnight blue '#0F172A' with a conical overhead spotlight beam, stage floor reflection oval at Y=1220, and puppeteer cords). When the scene concept is psychological warfare, mind games, or conspiracy, this theatrical shadow staging is intentional, dramatic, and 10/10 director-grade quality!
   - If it looks like a primitive child's doodle with no context: IMMEDIATE FAIL (primitive_doodle_detected = true).

7. ZERO TEXT / BADGE OVERLAPS & SUBTITLE INTEGRATION:
   - Status badge at top (Y=120-220) must be 100% clean and unblocked.
   - The region between Y=1320 and Y=1750 contains the global kinetic captions pill (e.g. "KABHI MAT BATAO!"). Character faces, eyes, and hero props must remain above Y=1300 so captions remain readable.
   - If character faces or props intersect or collide with captions: FAIL (text_overlap_detected = true).

8. ZERO FALLBACK CARDS OR UNSTYLED PLACEHOLDERS:
   - Does the frame show a generic rectangular card with an "ACTIVE PROP" banner or raw truncated placeholder text?
   - If yes: IMMEDIATE CATASTROPHIC FAIL (fallback_card_detected = true).

9. STRICT GENRE & ERA PURITY (NO ANACHRONISMS):
   - If the video is about Ancient History, Chanakya, Mahabharata, or Temple Mysteries: Are there modern laptops, smartphones, Slack notifications, or salary slips present?
   - If yes: IMMEDIATE FAIL (anachronism_detected = true).

10. NO MASSIVE SCREEN-BLOCKING MONOLITHS:
    - Is there a flat monochromatic solid block (e.g., solid white, gray, or single-color rectangle covering >20% of canvas)?
    - If yes: IMMEDIATE FAIL (screen_block_detected = true).

11. NO DUPLICATE OR COMPETING SUBTITLE TRACKS:
    - Note: The single bottom captions pill (OddlyCaptions) is EXPECTED and REQUIRED.
    - Does the scene draw a SECOND competing subtitle track, raw hardcoded English text spans, or extra unstyled caption divs?
    - If there are multiple competing subtitle tracks: IMMEDIATE FAIL (duplicate_subtitles_detected = true).

12. NO ASSET DUMPING (MAX 1 HERO PROP PER SCENE):
    - Are multiple unrelated hero objects crammed into one scene (e.g. chest + bear trap + salary statement + snakes all at once)?
    - If yes: IMMEDIATE FAIL (asset_dump_detected = true).

SCORING RULES:
- Minimum passing score is 8.0 / 10.0.
- If ANY defect (collision, floating, staging defect, mutant eyes, empty void, text collision, fallback card, anachronism, screen block, duplicate subtitles, asset dump) is detected: score MUST be below 4.0 and passed MUST be false!
- Recommendations MUST provide SURGICAL NUMERIC COORDINATE FIXES (e.g. "Move CharacterRig to x=740, y=900; Move HeroProp to x=340, y=860; Remove modern smartphone; Switch environment to ancient_palace").

Respond strictly in valid JSON matching this exact structure:
{
  "passed": boolean,             // true ONLY if score >= 8.0 and zero critical defects
  "score": number,               // 1.0 to 10.0
  "collision_detected": boolean,
  "floating_detected": boolean,
  "staging_defect_detected": boolean,
  "mutant_eyes_detected": boolean,
  "empty_void_detected": boolean,
  "primitive_doodle_detected": boolean,
  "text_overlap_detected": boolean,
  "fallback_card_detected": boolean,
  "anachronism_detected": boolean,
  "screen_block_detected": boolean,
  "duplicate_subtitles_detected": boolean,
  "asset_dump_detected": boolean,
  "critique": "string",          // 1-2 sentence blunt art director critique
  "recommendations": ["string"]  // exact numeric coordinate and sizing fixes for the coder
}
`;

  const roles = ['showrunner', 'coder', 'debugger'];
  let lastErr = null;

  for (const role of roles) {
    try {
      const { client, model } = getClientForRole(role);
      const response = await client.models.generateContent({
        model: model || 'gemini-3.5-flash-lite',
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
      });

      const raw = response.text || '';
      const startIdx = raw.indexOf('{');
      const endIdx = raw.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        return JSON.parse(raw.slice(startIdx, endIdx + 1));
      }
      return JSON.parse(raw.trim());
    } catch (err) {
      lastErr = err;
      console.warn(`   ⚠️ Watchdog inspection attempt on role "${role}" failed: ${err.message?.slice(0, 80)}. Retrying next...`);
    }
  }

  // OpenRouter Multimodal Fallback for Watchdog
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log('   👀 [WATCHDOG FAILOVER] Engaging OpenRouter Vision (nvidia/nemotron-3.5-super-vl:free)...');
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-3.5-super-vl:free',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt + '\nRespond strictly with raw valid JSON.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
              ]
            }
          ]
        })
      });

      if (orRes.ok) {
        const orData = await orRes.json();
        const text = orData.choices?.[0]?.message?.content || '';
        const orStart = text.indexOf('{');
        const orEnd = text.lastIndexOf('}');
        if (orStart !== -1 && orEnd !== -1 && orEnd > orStart) {
          return JSON.parse(text.slice(orStart, orEnd + 1));
        }
      }
    } catch (orErr) {
      console.warn(`   ⚠️ OpenRouter vision watchdog fallback failed: ${orErr.message?.slice(0, 80)}`);
    }
  }

  throw new Error(`Watchdog with Eyes failed across all cluster nodes: ${lastErr?.message}`);
}
