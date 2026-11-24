"""
High-fidelity audio & word-level timestamp generation.
Supports:
1. ElevenLabs with frame-accurate character & word alignment (default if ELEVENLABS_API_KEY is present)
2. Free Edge-TTS fallback (rate +18%, en-US-ChristopherNeural) with zero downtime
"""

import sys
import os
import json
import base64
import asyncio
import argparse
import urllib.request
import urllib.error
import edge_tts

DEFAULT_EDGE_VOICE = "en-US-ChristopherNeural"
# Liam: Confident, energetic social media creator voice
DEFAULT_ELEVEN_VOICE = "TX3LPaxmHKxFdv7VOQHJ"

def get_elevenlabs_api_key():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        return key

    # Check local .env
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if line.strip().startswith("ELEVENLABS_API_KEY="):
                    return line.strip().split("=", 1)[1]

    # Check external local.properties fallback
    prop_path = r"D:\AnimusSmartRoom\local.properties"
    if os.path.exists(prop_path):
        with open(prop_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                if line.strip().startswith("elevenlabs.api.key="):
                    return line.strip().split("=", 1)[1]

    return None

def parse_elevenlabs_alignment(alignment, original_text):
    chars = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])

    words = []
    current_word = []
    word_start = None
    word_end = None

    for i, ch in enumerate(chars):
        s = starts[i]
        e = ends[i]

        if ch.isspace():
            if current_word:
                w_str = "".join(current_word)
                words.append({
                    "word": w_str,
                    "start": round(word_start, 3),
                    "end": round(word_end, 3),
                    "duration": round(word_end - word_start, 3),
                })
                current_word = []
                word_start = None
                word_end = None
        else:
            if word_start is None:
                word_start = s
            word_end = e
            current_word.append(ch)

    if current_word and word_start is not None and word_end is not None:
        w_str = "".join(current_word)
        words.append({
            "word": w_str,
            "start": round(word_start, 3),
            "end": round(word_end, 3),
            "duration": round(word_end - word_start, 3),
        })

    # Map original script tokens back to timestamped words
    original_tokens = original_text.split()
    orig_idx = 0
    for w in words:
        if orig_idx < len(original_tokens):
            clean_orig = "".join(c for c in original_tokens[orig_idx] if c.isalnum() or c in "%").lower()
            clean_w = "".join(c for c in w["word"] if c.isalnum() or c in "%").lower()
            if clean_orig == clean_w:
                w["word"] = original_tokens[orig_idx]
                orig_idx += 1
            else:
                for search_offset in range(1, 4):
                    if orig_idx + search_offset < len(original_tokens):
                        clean_cand = "".join(c for c in original_tokens[orig_idx + search_offset] if c.isalnum() or c in "%").lower()
                        if clean_cand == clean_w:
                            orig_idx += search_offset
                            w["word"] = original_tokens[orig_idx]
                            orig_idx += 1
                            break

    return words

def generate_elevenlabs(text: str, voice_id: str, api_key: str, audio_path: str, subtitles_path: str, meta_path: str):
    print(f"[ElevenLabs] Synthesizing voiceover with voice: {voice_id} (eleven_turbo_v2_5)...")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps"

    payload = {
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.15,
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
        }
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    audio_bytes = base64.b64decode(data.get("audio_base64", ""))
    alignment = data.get("alignment", {})

    words = parse_elevenlabs_alignment(alignment, text)

    os.makedirs(os.path.dirname(os.path.abspath(audio_path)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(subtitles_path)), exist_ok=True)

    with open(audio_path, "wb") as f:
        f.write(audio_bytes)

    with open(subtitles_path, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

    total_duration = words[-1]["end"] if words else 0.0
    fps = 30
    # Seamless Infinite Loop: Only add a 0.06s (~2 frame) cushion so speech finishes cleanly without dead air
    total_duration_padded = total_duration + 0.06
    total_frames = int(round(total_duration_padded * fps))

    metadata = {
        "engine": "elevenlabs",
        "voice": voice_id,
        "wordCount": len(words),
        "speechDurationSeconds": round(total_duration, 2),
        "totalDurationSeconds": round(total_duration_padded, 2),
        "totalFrames": total_frames,
        "fps": fps,
        "width": 1080,
        "height": 1920,
    }

    if meta_path:
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"[ElevenLabs] Successfully generated:")
    print(f"  - Audio: {audio_path} ({len(audio_bytes)} bytes)")
    print(f"  - Subtitles: {subtitles_path} ({len(words)} words)")
    print(f"  - Duration: {total_duration:.2f}s (~{total_frames} frames at 30 fps)")

async def generate_edge(text: str, voice: str, audio_path: str, subtitles_path: str, meta_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(audio_path)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(subtitles_path)), exist_ok=True)

    print(f"[edge-tts] Synthesizing voiceover with voice: {voice}")
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary", rate="+18%")

    words = []
    audio_data = bytearray()

    async for chunk in communicate.stream():
        chunk_type = chunk.get("type")
        if chunk_type == "audio":
            audio_data.extend(chunk["data"])
        elif chunk_type == "WordBoundary":
            offset_sec = chunk["offset"] / 10_000_000.0
            duration_sec = chunk["duration"] / 10_000_000.0
            word_text = chunk.get("text", "").strip()

            if word_text:
                words.append({
                    "word": word_text,
                    "start": round(offset_sec, 3),
                    "end": round(offset_sec + duration_sec, 3),
                    "duration": round(duration_sec, 3),
                })

    original_tokens = text.split()
    orig_idx = 0
    for w in words:
        if orig_idx < len(original_tokens):
            clean_orig = "".join(c for c in original_tokens[orig_idx] if c.isalnum() or c in "%").lower()
            clean_w = "".join(c for c in w["word"] if c.isalnum() or c in "%").lower()
            if clean_orig == clean_w:
                w["word"] = original_tokens[orig_idx]
                orig_idx += 1
            else:
                for search_offset in range(1, 4):
                    if orig_idx + search_offset < len(original_tokens):
                        clean_cand = "".join(c for c in original_tokens[orig_idx + search_offset] if c.isalnum() or c in "%").lower()
                        if clean_cand == clean_w:
                            orig_idx += search_offset
                            w["word"] = original_tokens[orig_idx]
                            orig_idx += 1
                            break

    with open(audio_path, "wb") as f:
        f.write(audio_data)

    with open(subtitles_path, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

    total_duration = words[-1]["end"] if words else 0.0
    fps = 30
    total_duration_padded = total_duration + 0.06
    total_frames = int(round(total_duration_padded * fps))

    metadata = {
        "engine": "edge-tts",
        "voice": voice,
        "wordCount": len(words),
        "speechDurationSeconds": round(total_duration, 2),
        "totalDurationSeconds": round(total_duration_padded, 2),
        "totalFrames": total_frames,
        "fps": fps,
        "width": 1080,
        "height": 1920,
    }

    if meta_path:
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"[edge-tts] Successfully generated:")
    print(f"  - Audio: {audio_path} ({len(audio_data)} bytes)")
    print(f"  - Subtitles: {subtitles_path} ({len(words)} words)")
    print(f"  - Duration: {total_duration:.2f}s (~{total_frames} frames at 30 fps)")

def main():
    parser = argparse.ArgumentParser(description="Generate voiceover and word timestamps via ElevenLabs or edge-tts")
    parser.add_argument("--text", type=str, default=None, help="Script text to speak")
    parser.add_argument("--text-file", type=str, default=None, help="Path to file containing script text")
    parser.add_argument("--engine", type=str, default="auto", choices=["auto", "elevenlabs", "edge-tts"], help="TTS Engine to use")
    parser.add_argument("--voice", type=str, default=None, help="Voice identifier (ElevenLabs ID or Edge-TTS name)")
    parser.add_argument("--audio", type=str, default="public/voiceover.mp3", help="Output audio file path")
    parser.add_argument("--subtitles", type=str, default="public/subtitles.json", help="Output subtitles JSON file path")
    parser.add_argument("--meta", type=str, default="public/metadata.json", help="Output metadata JSON file path")
    args = parser.parse_args()

    script_text = args.text
    if args.text_file and os.path.exists(args.text_file):
        with open(args.text_file, "r", encoding="utf-8") as f:
            script_text = f.read()

    if not script_text:
        print("Error: Either --text or --text-file must be provided.")
        sys.exit(1)

    eleven_key = get_elevenlabs_api_key()
    use_elevenlabs = (args.engine == "elevenlabs") or (args.engine == "auto" and eleven_key is not None)

    if use_elevenlabs and eleven_key:
        voice_to_use = args.voice or DEFAULT_ELEVEN_VOICE
        try:
            generate_elevenlabs(script_text, voice_to_use, eleven_key, args.audio, args.subtitles, args.meta)
            return
        except Exception as e:
            print(f"⚠️ ElevenLabs voice synthesis failed: {e}. Falling back to Edge-TTS...")

    # Fallback to Edge-TTS
    edge_voice = args.voice if (args.voice and args.voice.startswith("en-")) else DEFAULT_EDGE_VOICE
    asyncio.run(generate_edge(script_text, edge_voice, args.audio, args.subtitles, args.meta))

if __name__ == "__main__":
    main()
