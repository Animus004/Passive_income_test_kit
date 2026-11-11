# 🎬 Free Programmatic YouTube Shorts & Reels Generator

A 100% free, local programmatic vertical video generator built with **Remotion**, **Microsoft Neural edge-tts**, and the **YouTube Data API v3**. Zero paid third-party API keys required.

---

## ⚡ Highlights

- **Zero Cost / Zero Paid APIs**: Uses Microsoft's online Edge TTS engine via `edge-tts` to produce studio-grade neural voiceovers (`en-US-ChristopherNeural`, `en-US-GuyNeural`, etc.) with exact millisecond word timestamps.
- **High-Retention Kinetic Typography**: 
  - Dynamic grouping into rapid 2 to 3-word chunks centered on screen.
  - Active word spring bounce (`damping: 10, stiffness: 240`) with vibrant Neon Yellow (`#FFE600`) and Cyan (`#00F5FF`) highlights, bold strokes, and glow.
- **Vertical 1080x1920 (9:16) Remotion Engine**:
  - Procedural cybernetic gradient mesh + floating glow particle field.
  - High-retention neon progress bar at the top (0% to 100%).
  - Top curiosity hook badge and bottom CTA safely placed to avoid native YouTube Shorts/Reels UI buttons.
- **Audio Mixing**:
  - Voiceover at 100% volume (0 dB).
  - Ambient synth background music mixed softly at `-18 dB` (~12% volume).
- **Automated YouTube Data API v3 Uploader**:
  - OAuth 2.0 with token caching (`tokens.json`).
  - Terminal-based authorization flow on initial run.
  - Automatic metadata injection (curiosity hook title, tags, description, and private/unlisted verification status).

---

## 📁 Project Architecture

```
d:\New folder (2)\
├── out/
│   └── final_short.mp4             <-- Final 1080x1920 MP4 vertical video
├── public/
│   ├── ambient.mp3                 <-- Ambient synth background track (-18dB)
│   ├── voiceover.mp3               <-- Neural TTS voiceover output
│   ├── subtitles.json              <-- Extracted word timestamps (start, end, duration)
│   └── metadata.json               <-- Audio stats & frame duration calculation
├── scripts/
│   ├── generate_audio.py           <-- Python edge-tts worker extracting WordBoundary events
│   ├── generate_audio.js           <-- Node wrapper for script synthesis & timestamp extraction
│   ├── upload_youtube.js           <-- YouTube Data API v3 OAuth2 uploader
│   └── run_pipeline.js             <-- Master end-to-end automation runner
├── src/
│   ├── components/
│   │   ├── Background.tsx          <-- Procedural gradient mesh & floating particles
│   │   ├── KineticSubtitles.tsx    <-- 2-3 word chunks with active word spring pop & glow
│   │   └── ProgressOverlay.tsx     <-- Neon retention progress bar & hook badges
│   ├── Composition.tsx             <-- Master Remotion vertical composition & audio mixer
│   ├── Root.tsx                    <-- Dynamic duration calculateMetadata & registration
│   ├── types.ts                    <-- TypeScript interfaces for words, chunks, metadata
│   └── index.ts                    <-- Remotion entry point
├── remotion.config.ts
├── package.json
└── .env.example
```

---

## 🚀 Quick Start Commands

### 1. Run the Complete End-to-End Pipeline
Generates speech, word timestamps, calculates duration, and renders the video:
```bash
npm run build-short
```

### 2. Live Preview in Remotion Studio
Preview animations, subtitles, and typography in real-time in your browser:
```bash
npm run dev
```

### 3. Generate Audio Only
```bash
npm run generate-audio
```
Or pass a custom script:
```bash
node scripts/generate_audio.js "Your custom engaging script here..." "en-US-GuyNeural"
```

### 4. Render Video Only
```bash
npm run render
```
Or with custom Remotion CLI flags:
```bash
npx remotion render src/index.ts ShortVideo out/final_short.mp4
```

---

## 📤 Automated YouTube Upload Setup

1. Enable the **YouTube Data API v3** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Application Type: **Desktop app**).
3. Download the JSON and save it as `client_secret.json` in the project root (or set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`).
4. Run the upload script:
   ```bash
   npm run upload
   ```
5. On the first run, the script outputs an authorization link. Open the link, sign in to your YouTube account, copy the code, and paste it back into your terminal.
6. The script caches the refresh tokens in `tokens.json`. Subsequent runs will upload automatically without requiring manual authorization!

By default, videos are uploaded as **`private`** so you can review video quality and audio balance in YouTube Studio before going public. To change privacy status:
```bash
node scripts/upload_youtube.js out/final_short.mp4 --privacy unlisted
```
