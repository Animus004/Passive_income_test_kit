"""
Universal Voice Synthesizer for Phase 2 & Autonomous Engines.
Supports:
1. ElevenLabs (Cloud Ultra-High Quality, subject to API quota)
2. Kokoro-82M (Local Offline High-Fidelity, 100% Free & Unlimited, on-demand GPU/CPU)
3. Edge-TTS (Emergency cloud fallback)
"""

import sys
import os

os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import json
import base64
import argparse
import urllib.request
import urllib.error
import asyncio
from dotenv import load_dotenv

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

sys.path.insert(0, os.path.join(PROJECT_ROOT, "scripts"))
from generate_audio import get_elevenlabs_api_key, parse_elevenlabs_alignment

# Popular viral voice presets for ElevenLabs
VOICE_PRESETS = {
    "human": "bIHbv24MWmeRgasZH58o",      # Will (soft, youthful, expressive, panic/vulnerability)
    "human_warm": "iP95p4xoKVk53GoZ742B", # Chris (charming, casual conversational)
    "human_deep": "pNInz6obpgDQGcFmaJgB", # Adam (deep baritone / dramatic narration)
    "gemini": "cgSgspJ2msm6clMCkdW9",     # Jessica (playful, bright, warm, sassy teasing companion)
    "gemini_laura": "FGY2WhTYpPnrIDTdsKH5",# Laura (enthusiast, quirky, sassy)
    "gemini_lily": "pFZP5JQG7iQjIQuC4Bku",# Lily (velvety, soft, sarcastic actress)
    "gemini_deadpan": "EXAVITQu4vr4xnSDxMaL", # Sarah (confident, witty)
    "gemini_alt": "Xb7hH8MSUJpSbSDYk0k2", # Alice (crisp, articulate)
    "popapus": "cgSgspJ2msm6clMCkdW9",    # Legacy alias mapped to Jessica
    "storyteller": "JBFqnCBsd6RMkjVDRZzb",# George (warm, captivating)
    "narrator": "pNInz6obpgDQGcFmaJgB",   # Adam (deep baritone)
}

def synthesize_elevenlabs(text, voice_id, out_path, stability=0.32, style=0.65, similarity=0.76, model_id="eleven_multilingual_v2"):
    api_key = get_elevenlabs_api_key()
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY not found in environment or .env")

    # Resolve preset if name passed
    actual_voice = VOICE_PRESETS.get(voice_id, voice_id)

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{actual_voice}/with-timestamps"
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": float(stability),
            "similarity_boost": float(similarity),
            "style": float(style),
            "use_speaker_boost": True,
        },
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    audio_bytes = base64.b64decode(data.get("audio_base64", ""))
    alignment = data.get("alignment", {})
    words = parse_elevenlabs_alignment(alignment, text)

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(audio_bytes)

    duration = words[-1]["end"] if words else 0.0

    # Also save timestamps if requested
    timestamps_path = out_path.rsplit(".", 1)[0] + "_words.json"
    with open(timestamps_path, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2)

    return {"engine": "elevenlabs", "voice": actual_voice, "duration": duration, "words": len(words)}

async def fallback_edge(text, voice_type, out_path):
    import edge_tts
    edge_voice = "en-US-ChristopherNeural" if voice_type in ["human", "narrator"] else "en-US-AvaMultilingualNeural"
    comm = edge_tts.Communicate(text, edge_voice, rate="+14%")
    await comm.save(out_path)
    return {"engine": "edge-tts", "voice": edge_voice}

def main():
    parser = argparse.ArgumentParser(description="Multi-Tier Autonomous Voice Synthesizer")
    parser.add_argument("--text", required=True, help="Text to speak")
    parser.add_argument("--voice", default="human", help="Voice ID or Preset (human, popapus, narrator)")
    parser.add_argument("--output", required=True, help="Output audio path (.mp3 or .wav)")
    parser.add_argument("--engine", default=os.getenv("TTS_ENGINE", "auto"), choices=["auto", "elevenlabs", "kokoro", "edge"], help="TTS Engine to use")
    parser.add_argument("--speed", type=float, default=1.0, help="Speed multiplier (Kokoro/Edge)")
    parser.add_argument("--stability", type=float, default=0.30, help="Stability (0.0 to 1.0, ElevenLabs)")
    parser.add_argument("--style", type=float, default=0.45, help="Style exaggeration (0.0 to 1.0, ElevenLabs)")
    parser.add_argument("--similarity", type=float, default=0.85, help="Similarity boost (ElevenLabs)")
    args = parser.parse_args()

    engine_order = []
    if args.engine == "kokoro":
        engine_order = ["kokoro", "edge"]
    elif args.engine == "elevenlabs":
        engine_order = ["elevenlabs", "kokoro", "edge"]
    elif args.engine == "edge":
        engine_order = ["edge"]
    else:  # auto
        engine_order = ["elevenlabs", "kokoro", "edge"]

    last_error = None
    for eng in engine_order:
        try:
            if eng == "elevenlabs":
                res = synthesize_elevenlabs(args.text, args.voice, args.output, args.stability, args.style, args.similarity)
                print(f"[OK] ElevenLabs TTS Success: {args.output} (duration: {res['duration']:.2f}s, voice: {res['voice']})")
                return
            elif eng == "kokoro":
                from kokoro_tts import synthesize as synthesize_kokoro
                res = synthesize_kokoro(args.text, voice_name=args.voice, speed=args.speed, out_path=args.output)
                print(f"[OK] Kokoro-82M TTS Success: {args.output} (duration: {res['duration']}s, voice: {res['voice']})")
                return
            elif eng == "edge":
                asyncio.run(fallback_edge(args.text, args.voice, args.output))
                print(f"[OK] Edge-TTS fallback written: {args.output}")
                return
        except Exception as e:
            print(f"[WARN] Engine '{eng}' failed: {e}. Trying next engine in failover chain...")
            last_error = e

    print(f"[ERROR] All TTS engines failed. Last error: {last_error}")
    sys.exit(1)

if __name__ == "__main__":
    main()
