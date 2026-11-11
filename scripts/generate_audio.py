"""
Free programmatic audio and word-level timestamp generation using edge-tts.
Extracts exact start and end times for each spoken word without any paid API keys.
"""

import sys
import os
import json
import asyncio
import argparse
import edge_tts

DEFAULT_VOICE = "en-US-ChristopherNeural"
# High quality alternatives: en-US-GuyNeural, en-US-EricNeural, en-GB-RyanNeural

async def generate(text: str, voice: str, audio_path: str, subtitles_path: str, meta_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(audio_path)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(subtitles_path)), exist_ok=True)

    print(f"[edge-tts] Synthesizing voiceover with voice: {voice}")
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary", rate="+4%")

    words = []
    audio_data = bytearray()

    async for chunk in communicate.stream():
        chunk_type = chunk.get("type")
        if chunk_type == "audio":
            audio_data.extend(chunk["data"])
        elif chunk_type == "WordBoundary":
            # offset and duration are in 100ns units (ticks). 10,000,000 ticks = 1 second.
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

    # Map original script tokens with full punctuation back to timestamped words
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
    # Add a 0.8-second cushion after the last word so speech does not cut abruptly
    total_duration_padded = total_duration + 0.8
    total_frames = int(round(total_duration_padded * fps))

    metadata = {
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
    parser = argparse.ArgumentParser(description="Generate voiceover and word timestamps via edge-tts")
    parser.add_argument("--text", type=str, required=True, help="Script text to speak")
    parser.add_argument("--voice", type=str, default=DEFAULT_VOICE, help="edge-tts voice identifier")
    parser.add_argument("--audio", type=str, default="public/voiceover.mp3", help="Output audio file path")
    parser.add_argument("--subtitles", type=str, default="public/subtitles.json", help="Output subtitles JSON file path")
    parser.add_argument("--meta", type=str, default="public/metadata.json", help="Output metadata JSON file path")
    args = parser.parse_args()

    asyncio.run(generate(args.text, args.voice, args.audio, args.subtitles, args.meta))

if __name__ == "__main__":
    main()

