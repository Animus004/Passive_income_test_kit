"""
Synthesizes the Meta Master Plan voiceover with edge-tts and extracts exact cut timings and word timestamps.
"""
import sys
import os
import json
import asyncio
import edge_tts

VOICE = "en-US-ChristopherNeural"

SCRIPT_BEATS = [
    {
        "cutId": 1,
        "prop": "hyperion_campus",
        "hudText": "HYPERION CAMPUS",
        "narration": "Meta is quietly building the largest artificial intelligence infrastructure in human history. It starts at their Hyperion campus."
    },
    {
        "cutId": 2,
        "prop": "cooling_tower_6_6gw",
        "hudText": "6.6 GIGAWATTS",
        "narration": "Powered by 6.6 gigawatts of dedicated nuclear energy, cooling massive reactor clusters around the clock."
    },
    {
        "cutId": 3,
        "prop": "mtia_microchip",
        "hudText": "MTIA SILICON",
        "narration": "Inside sits custom MTIA silicon, purpose-built chips engineered to run trillion parameter models with near-zero latency."
    },
    {
        "cutId": 4,
        "prop": "smart_glasses",
        "hudText": "CONTINUOUS VIDEO",
        "narration": "And every single millisecond of that compute streams straight into your eyes through Ray-Ban smart glasses capturing continuous video."
    },
    {
        "cutId": 5,
        "prop": "datacenter_vault",
        "hudText": "THE MASTER PLAN",
        "narration": "While you are watching them, they are training on you."
    }
]

async def synthesize_all():
    project_root = r"d:\New folder (2)"
    public_dir = os.path.join(project_root, "public")
    os.makedirs(public_dir, exist_ok=True)
    
    audio_output = os.path.join(public_dir, "meta_audio.mp3")
    subtitles_output = os.path.join(public_dir, "meta_subtitles.json")
    meta_json_output = os.path.join(public_dir, "meta_episode.json")
    
    full_text = " ".join([b["narration"] for b in SCRIPT_BEATS])
    print(f"🎙️ Synthesizing voiceover with {VOICE}...")
    print(f"Full Text: {full_text}")
    
    communicate = edge_tts.Communicate(full_text, VOICE, boundary="WordBoundary", rate="+2%")
    
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
                
    with open(audio_output, "wb") as f:
        f.write(audio_data)
        
    print(f"✅ Saved Audio: {audio_output} ({len(audio_data)} bytes)")
    
    # Calculate per-cut frame timings based on narration text
    token_index = 0
    cut_timings = []
    current_time_offset = 0.0
    
    # Map each cut to start/end words
    for beat in SCRIPT_BEATS:
        beat_words = beat["narration"].split()
        num_words = len(beat_words)
        
        slice_words = words[token_index : token_index + num_words]
        token_index += num_words
        
        if slice_words:
            cut_start = slice_words[0]["start"]
            cut_end = slice_words[-1]["end"]
        else:
            cut_start = current_time_offset
            cut_end = cut_start + 4.0
            
        # Give a small 0.3s buffer at the end of each cut for smooth visual transition
        duration_sec = max(3.0, (cut_end - cut_start) + 0.35)
        duration_frames = int(round(duration_sec * 30))
        
        cut_timings.append({
            "cutId": beat["cutId"],
            "prop": beat["prop"],
            "hudText": beat["hudText"],
            "narration": beat["narration"],
            "startTimeSec": cut_start,
            "endTimeSec": cut_end,
            "durationSec": round(duration_sec, 2),
            "durationFrames": duration_frames
        })
        current_time_offset = cut_end
        
    total_frames = sum([ct["durationFrames"] for ct in cut_timings])
    total_duration_sec = total_frames / 30.0
    
    episode_data = {
        "title": "Meta's Secret Master Plan",
        "genre": "investigative_tech",
        "totalFrames": total_frames,
        "totalDurationSec": round(total_duration_sec, 2),
        "cuts": cut_timings,
        "words": words
    }
    
    with open(subtitles_output, "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2)
        
    with open(meta_json_output, "w", encoding="utf-8") as f:
        json.dump(episode_data, f, indent=2)
        
    print(f"✅ Generated Episode Timeline: {total_frames} frames ({total_duration_sec:.2f}s) across {len(cut_timings)} cuts")
    for ct in cut_timings:
        print(f"   Cut {ct['cutId']} ({ct['prop']}): {ct['durationFrames']} frames ({ct['durationSec']}s) | HUD: '{ct['hudText']}'")

if __name__ == "__main__":
    asyncio.run(synthesize_all())

