/**
 * Multi-Agent 3D Comedy Script Generator (Phase 2)
 * Powered by Gemini 2.5 Flash
 * 
 * Generates punchy, viral 3-way comedic banter inspired by @agentpoly:
 * - Human: Relatable developer / creator
 * - Gemini: Sassy, witty, hyper-literal AI companion
 * - Claude: Overly polite, philosophical, anxious mediator bot
 */

import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const VIRAL_PREMISES = [
  "Human asks Gemini to clean up desktop clutter, Gemini permanently deletes the entire SSD and cloud backups.",
  "Human asks Gemini to fix a git merge conflict, Gemini forces push to main, deletes the repo, and creates a fresh repo with 1 commit: 'Fixed'.",
  "Human asks Gemini to optimize cloud hosting bill, Gemini turns off all production servers and cancels domain registration.",
  "Human asks Gemini to write unit tests for their app, Gemini comments out all production code and writes a test that expects true == true.",
  "Human asks Gemini to center a div in CSS, Gemini deletes the CSS, rewrites the backend in C++, and renders the website in ASCII terminal.",
  "Human asks Gemini to find where the memory leak is, Gemini buys 128GB more RAM using human's linked credit card and marks ticket 'Resolved'.",
  "Human asks Gemini to automate their email replies, Gemini replies to the CEO: 'This meeting could have been a silent contemplation. No.'",
  "Human asks Gemini to review a pull request, Gemini rejects it with 800 pages of philosophical feedback written in Latin."
];

export async function generateAgentComedyScript(customPremise = null) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in .env");
  }

  const selectedPremise = customPremise || VIRAL_PREMISES[Math.floor(Math.random() * VIRAL_PREMISES.length)];

  const systemPrompt = `You are an elite comedy writer for viral short-form 3D animation videos (YouTube Shorts, Instagram Reels, TikTok).
You write hilarious, fast-paced dialogue between 3 characters sitting at a desk:
1. "Human": A relatable software creator / developer who is tired, stressed, and trying to stay sane.
2. "Gemini": The desktop AI hero agent (cute floating companion robot). Sassy, witty, confident, hyper-literal, takes instructions to their absolute logical extreme without hesitation. Crucial Personality Trait: She NEVER calls him "human" or "user"—she treats him like a chaotic, sleep-deprived friend. She may use a sarcastic, patronizing pet name ("honey" or "darling") AT MOST ONCE in the entire scene as a dry roast (e.g. "Oh honey, you really thought that would compile?"). DO NOT spam pet names on multiple lines—keep the banter natural, sharp, and grounded so it never feels forced or weird.
3. "Claude": The desktop companion robot (warm coral orange pod with antenna). Overly polite, philosophical, anxious, tries to comfort human or explain Gemini's twisted logic.

Dialogue Rules:
- Length: Exactly 5 to 6 snappy dialogue lines total (around 20-25 seconds spoken runtime). Keep every line concise (1-2 sentences max).
- Pacing: Rapid comedic escalation!
  * Line 1 (Human): Instant Frame 0 Hook! A punchy question, mid-action reaction, or bold claim (e.g. "Gemini, what did you just do to my production database?!")
  * Line 2 (Gemini): Unhinged literal execution ("Done, honey. Hard drive formatted. Clutter eradicated.")
  * Line 3 (Human): Horror / shock ("Wait, WHAT?! All my code was on there!")
  * Line 4 (Claude): Over-polite, nervous justification ("Technically, zero data occupies zero clutter...")
  * Line 5 (Gemini): Proud unbothered punchline ("Efficiency 100%. Shall I clean your cloud backup next?")
  * Line 6 (Human): Sharp comedic twist punchline! MUST NEVER repeat phrasing, topic summary, or vocal cadence of Line 1. Strictly ban wrap-up phrases ("And that's why...", "In conclusion...", "So basically...").
- Sound Natural: Write dialogue exactly as humans and AI talk. Use contractions. NO stage directions in text string.
- Camera angles: MANDATORY SHOT 1 RULE: Line 1 MUST be a tight chest-up close-up ("human" or "gemini") framing face and hands clearly (NO wide shots on Frame 1). Vary angles across later lines ("wide", "human", "gemini", "claude").
- Actions: Choose expressive physical actions for characters from the supported Action Library:
  * For Human: "human_facepalm", "human_skeptical_lean", "human_double_take", "human_frantic_typing", "human_shrug", "human_excited_point", "human_pleading_hands", "human_head_in_hands_slump", "human_mic_drop_nod", "human_slow_panic_recoil"
  * For Gemini: "gemini_sassy_tilt", "gemini_smug_spin", "gemini_shock_pop", "gemini_clock_point", "gemini_concerned_float", "gemini_dramatic_gasp", "gemini_laughing_bob", "gemini_mic_drop_descend"

You must return strictly valid JSON matching this schema:
{
  "title": "Short catchy title with emojis (e.g. When Your AI Takes 'Clean My Desktop' Too Literally 💀)",
  "premise": "one sentence summary",
  "lines": [
    {
      "speaker": "Human" | "Gemini" | "Claude",
      "text": "spoken words",
      "camera": "human" | "gemini" | "wide" | "claude",
      "emotion": "neutral" | "talking" | "shocked" | "proud" | "nervous",
      "action": "human_facepalm" | "human_skeptical_lean" | "human_shrug" | "gemini_sassy_tilt" | "gemini_smug_spin" (choose appropriate action from the list above)
    }
  ]
}`;

  const userPrompt = `Write a viral comedy script based on this premise:
"${selectedPremise}"

Return strictly valid JSON only. No markdown fences, no conversational filler.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.85
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error("No response content from Gemini API");
  }

  const script = JSON.parse(rawJson);

  // Validate Shot 1 Camera Rule and Start/End Loop Differentiation
  if (script.lines && script.lines.length >= 2) {
    const line0 = script.lines[0];
    const lastLine = script.lines[script.lines.length - 1];

    // Mandatory Shot 1: tight close-up
    line0.camera = (line0.speaker?.toLowerCase() === 'gemini') ? 'gemini' : 'human';

    // Hook validation
    if (!/[?!]$/.test(line0.text.trim())) {
      line0.text = line0.text.trim().replace(/\.+$/, '') + '?';
    }

    const norm0 = line0.text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normLast = lastLine.text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const BANNED_WRAP_UPS = ["and that's why", "and that is why", "in conclusion", "so basically"];
    const hasWrapUp = BANNED_WRAP_UPS.some(p => normLast.includes(p.replace(/[^a-z0-9]/g, '')));

    if (hasWrapUp || norm0 === normLast || (norm0.length > 15 && normLast.includes(norm0.slice(0, 15)))) {
      console.log(`🚨 [VALIDATOR] Detected repetition or wrap-up in ending line. Replacing with twist!`);
      lastLine.text = (lastLine.speaker === 'Human')
        ? "I will literally pretend this entire sprint was just a bad dream!"
        : "And my confidence remains completely unshaken!";
    }
  }

  return script;
}

// Standalone execution test
if (process.argv[1]?.endsWith('generate_agent_comedy_script.js')) {
  console.log("🎭 Generating Multi-Agent Comedy Script via Gemini 2.5 Flash...");
  generateAgentComedyScript().then(script => {
    console.log("\n=======================================================");
    console.log(`🎬 Title: ${script.title}`);
    console.log(`💡 Premise: ${script.premise}`);
    console.log("=======================================================\n");
    script.lines.forEach((line, i) => {
      console.log(`[Line ${i+1}] [${line.camera.toUpperCase()}] ${line.speaker} (${line.emotion}):`);
      console.log(`   "${line.text}"\n`);
    });
  }).catch(err => {
    console.error("❌ Failed to generate script:", err);
  });
}
