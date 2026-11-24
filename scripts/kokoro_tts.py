"""
Kokoro-82M High-Fidelity Local Voice Synthesizer
Zero-quota, offline, on-demand replacement for ElevenLabs.
Trained for hyper-natural cadence, pauses, and expressive acting.
"""

import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import json
import argparse
import subprocess
import soundfile as sf
import numpy as np

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models", "kokoro")
MODEL_PATH = os.path.join(MODELS_DIR, "kokoro-v0_19.onnx")
VOICES_PATH = os.path.join(MODELS_DIR, "voices-v1.0.bin")
VOICES_BIN_LEGACY = os.path.join(MODELS_DIR, "voices.bin")
VOICES_JSON_PATH = os.path.join(MODELS_DIR, "voices.json")

# Map of friendly character presets to Kokoro voice embeddings
# af_ = American Female, am_ = American Male, bf_ = British Female, bm_ = British Male
VOICE_PRESETS = {
    # Phase 2 Character Lore: Gemini (Sassy, playful, affectionate roasting AI companion)
    "gemini": "af_bella",         # Primary Gemini: Lively, teasing, sassy ("Oh honey... darling, baby...")
    "gemini_sarah": "af_sarah",   # Gemini Deadpan: Sharp, crisp sarcasm
    "gemini_playful": "af_bella", # Gemini Playful (Alias)
    "gemini_collab": "af_nicole", # Gemini Collab / Smooth ("for when the channel goes viral lol")
    "popapus": "af_bella",        # Backward-compat alias -> Gemini
    # Human / Developer Presets (Eric selected as user's official voice)
    "human": "am_eric",           # Official Human Voice: Eric (Warm, friendly, soft, pleasant youthful dev)
    "human_eric": "am_eric",      # Eric (Official)
    "human_soft": "am_liam",      # Liam (Alternative soft)
    "human_puck": "am_puck",      # Puck (Light, relaxed, playful tone)
    "human_echo": "am_echo",      # Echo (Quiet, ambient, smooth)
    "human_michael": "am_michael",# Michael (Conversational 20-something dev)
    "human_deep": "am_adam",      # Adam (Deep baritone)
    # Documentary / Narrator Presets
    "narrator": "am_adam",        # Deep cinematic US documentary narrator
    "storyteller": "bm_george",   # Classic British cinematic storyteller
    "news": "bf_emma",            # Formal, authoritative news anchor
    # Default fallbacks
    "default_male": "am_eric",
    "default_female": "af_bella",
}

# Recognized tech/system acronyms that SHOULD be spelled out letter-by-letter in TTS
ALLOWED_ACRONYMS = {
    'AI', 'API', 'UI', 'UX', 'CPU', 'GPU', 'RAM', 'SSD', 'URL', 'HTTP', 'HTTPS',
    'HTML', 'CSS', 'JS', 'JSON', 'SQL', 'OS', 'ID', 'TV', 'PC', 'PR', 'CEO',
    'CTO', 'CFO', 'HR', 'IT', 'AM', 'PM', 'WIFI', 'WI-FI', 'DM', 'PDF', 'GIF',
    'JPEG', 'PNG', 'LLM', 'TTS', 'GCS', 'GCP', 'AWS', 'VS', 'OK', 'NASA', 'FBI', 'CIA'
}

def normalize_caps_for_kokoro(text):
    """
    Prevent espeak-ng from interpreting short common capitalized words as acronyms.
    e.g., 'winning BIG' -> 'winning big', 'so SAD' -> 'so sad'.
    Retains legitimate tech acronyms like 'AI', 'API', 'UI', 'CPU'.
    """
    import re
    def replace_short_cap(m):
        w = m.group(0)
        if len(w) <= 3 and w.isupper() and w not in ALLOWED_ACRONYMS:
            return w.lower()
        return w
    return re.sub(r'\b[A-Z]{2,3}\b', replace_short_cap, text)

def generate_word_timestamps(text, total_duration):
    """
    Generate proportional word-level timestamps based on phoneme/character weight
    aligned to total generated audio duration.
    """
    words = [w.strip() for w in text.split() if w.strip()]
    if not words:
        return []
    
    # Weight words by character length with a base weight
    weights = [max(1, len(w)) for w in words]
    total_weight = sum(weights)
    
    result = []
    current_time = 0.0
    for w, weight in zip(words, weights):
        duration = (weight / total_weight) * total_duration
        result.append({
            "word": w,
            "start": round(current_time, 3),
            "end": round(current_time + duration, 3)
        })
        current_time += duration
        
    return result

def synthesize(text, voice_name="human", speed=1.0, emotion=None, sentence_pause=None, clause_pause=None, out_path=None):
    from kokoro_onnx import Kokoro

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Kokoro model not found at {MODEL_PATH}")
    
    voices_file = VOICES_PATH if os.path.exists(VOICES_PATH) else VOICES_JSON_PATH
    if not os.path.exists(voices_file):
        raise FileNotFoundError(f"Kokoro voices not found at {voices_file}")

    kokoro = Kokoro(MODEL_PATH, voices_file)

    # Clean text: replace [beat] or [pause] with natural ellipses and prevent acronym spell-out on short capitalized words
    clean_text = normalize_caps_for_kokoro(text.replace("[beat]", " ... ").replace("[pause]", " ... ").strip())

    # Default pause durations tuned for punchy comedy and dramatic realism
    actual_sentence_pause = 0.38 if sentence_pause is None else float(sentence_pause)
    actual_clause_pause = 0.22 if clause_pause is None else float(clause_pause)
    actual_speed = float(speed)

    # Resolve preset name
    v_key = voice_name.lower()
    actual_voice = VOICE_PRESETS.get(v_key, voice_name)

    # Dynamic Emotional Trigger Blending
    voice_target = actual_voice
    emotion_str = (emotion or "").lower()

    if emotion_str in ["roast", "sassy", "condescending", "sassy_tilt", "smug_spin", "agent_wink"]:
        v_bella = kokoro.get_voice_style("af_bella")
        v_nicole = kokoro.get_voice_style("af_nicole")
        voice_target = 0.78 * v_bella + 0.22 * v_nicole
        if speed == 1.0:
            actual_speed = 0.95
        actual_sentence_pause = max(actual_sentence_pause, 0.40)
        actual_clause_pause = max(actual_clause_pause, 0.28)
    elif emotion_str in ["smug", "proud", "triumphant", "finger_guns_pride", "chest_puff_proud"]:
        v_bella = kokoro.get_voice_style("af_bella")
        v_sarah = kokoro.get_voice_style("af_sarah")
        voice_target = 0.85 * v_bella + 0.15 * v_sarah
        if speed == 1.0:
            actual_speed = 1.04
    elif emotion_str in ["stressed", "panicked", "anxious", "panic_head_clutch", "table_slam_shock", "double_take"]:
        v_eric = kokoro.get_voice_style("am_eric")
        v_puck = kokoro.get_voice_style("am_puck")
        voice_target = 0.85 * v_eric + 0.15 * v_puck
        if speed == 1.0:
            actual_speed = 1.06
        actual_clause_pause = max(actual_clause_pause, 0.25)
    elif emotion_str in ["sad_slump", "head_in_hands_slump", "pleading_hands", "vulnerable", "burnout"]:
        v_eric = kokoro.get_voice_style("am_eric")
        v_echo = kokoro.get_voice_style("am_echo")
        voice_target = 0.70 * v_eric + 0.30 * v_echo
        actual_speed = 0.92 if speed == 1.0 else speed * 0.92
        actual_sentence_pause = max(actual_sentence_pause, 0.44)
        actual_clause_pause = max(actual_clause_pause, 0.30)
    elif emotion_str in ["gentle_nudge", "whisper_lean", "comforting", "reassurance"]:
        v_bella = kokoro.get_voice_style("af_bella")
        v_nicole = kokoro.get_voice_style("af_nicole")
        voice_target = 0.75 * v_bella + 0.25 * v_nicole
        actual_speed = 0.94 if speed == 1.0 else speed * 0.94
        actual_sentence_pause = max(actual_sentence_pause, 0.45)
        actual_clause_pause = max(actual_clause_pause, 0.28)
    elif emotion_str in ["chill", "tired", "exhausted", "coffee_stare_daze"]:
        if speed == 1.0:
            actual_speed = 0.94
        actual_sentence_pause = max(actual_sentence_pause, 0.38)
        actual_clause_pause = max(actual_clause_pause, 0.25)

    # Generate audio samples (24kHz numpy array)
    samples, sample_rate = kokoro.create(
        clean_text,
        voice=voice_target,
        speed=actual_speed,
        sentence_pause=actual_sentence_pause,
        clause_pause=actual_clause_pause,
        lang="en-us"
    )

    total_duration = len(samples) / float(sample_rate)

    # Save to disk
    temp_wav = out_path if out_path.endswith(".wav") else out_path.rsplit(".", 1)[0] + "_temp.wav"
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    sf.write(temp_wav, samples, sample_rate)

    # If target is MP3, convert cleanly with ffmpeg
    if out_path.endswith(".mp3"):
        cmd = [
            "ffmpeg", "-y", "-i", temp_wav,
            "-b:a", "192k",
            out_path
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        if temp_wav != out_path and os.path.exists(temp_wav):
            try:
                os.remove(temp_wav)
            except OSError:
                pass

    # Save word timestamps for Remotion / Watchdog
    timestamps = generate_word_timestamps(clean_text, total_duration)
    timestamps_path = out_path.rsplit(".", 1)[0] + "_words.json"
    with open(timestamps_path, "w", encoding="utf-8") as f:
        json.dump(timestamps, f, indent=2)

    return {
        "engine": "kokoro-82m",
        "voice": actual_voice if isinstance(actual_voice, str) else "custom_blend",
        "emotion": emotion_str or "natural",
        "duration": round(total_duration, 2),
        "sample_rate": sample_rate,
        "output": out_path,
        "timestamps": timestamps_path,
        "word_count": len(timestamps)
    }

def main():
    parser = argparse.ArgumentParser(description="Kokoro-82M High-Fidelity TTS Synthesizer")
    parser.add_argument("--text", required=True, help="Text to speak")
    parser.add_argument("--voice", default="human", help="Voice preset or ID (human, gemini, narrator, etc.)")
    parser.add_argument("--emotion", default=None, help="Emotional intensity trigger (roast, sassy, smug, stressed, chill)")
    parser.add_argument("--speed", type=float, default=1.0, help="Speech speed multiplier")
    parser.add_argument("--sentence-pause", type=float, default=None, help="Pause after sentences (seconds)")
    parser.add_argument("--clause-pause", type=float, default=None, help="Pause after commas/clauses (seconds)")
    parser.add_argument("--output", required=True, help="Output audio file path (.wav or .mp3)")
    
    args = parser.parse_args()
    res = synthesize(
        args.text,
        voice_name=args.voice,
        speed=args.speed,
        emotion=args.emotion,
        sentence_pause=args.sentence_pause,
        clause_pause=args.clause_pause,
        out_path=args.output
    )
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
