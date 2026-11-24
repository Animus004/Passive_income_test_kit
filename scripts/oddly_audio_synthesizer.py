"""
Oddly Told Dual-Channel Audio & Sync Synthesizer
- English: High-fidelity Local Kokoro-82M TTS ('am_michael')
- Hindi: Edge-TTS ('hi-IN-MadhurNeural') with Enhanced Indian Phonetic Normalizer
- Lossless 48kHz Concat + Ducked Lo-Fi Music + Micro-SFX Foley
"""

import os
import sys
import re
import time
import json
import base64
import asyncio
import subprocess
import requests
import edge_tts
import numpy as np
import soundfile as sf
from dotenv import load_dotenv

load_dotenv()

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH_DIR = os.path.join(PROJECT_ROOT, "scratch", "oddly_dual_build")
os.makedirs(SCRATCH_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. Hindi Phonetic & Number Normalizer
# -------------------------------------------------------------
HINDI_NUMBERS = {
    0: "शून्य", 1: "एक", 2: "दो", 3: "तीन", 4: "चार", 5: "पांच",
    6: "छह", 7: "सात", 8: "आठ", 9: "नौ", 10: "दस",
    11: "ग्यारह", 12: "बारह", 13: "तेरह", 14: "चौदह", 15: "पंद्रह",
    16: "सोलह", 17: "सत्रह", 18: "अठारह", 19: "उन्नीस", 20: "बीस",
    21: "इक्कीस", 22: "बाईस", 23: "तेईस", 24: "चौबीस", 25: "पच्चीस",
    26: "छब्बीस", 27: "सत्ताईस", 28: "अट्ठाईस", 29: "उनतीस", 30: "तीस",
    35: "पैंतीस", 40: "चालीस", 45: "पैंतालीस", 48: "अड़तालीस", 50: "पचास",
    60: "साठ", 70: "सत्तर", 80: "अस्सी", 90: "नब्बे", 99: "निन्यानवे", 100: "सौ",
    200: "दो सौ", 300: "तीन सौ", 400: "चार सौ", 500: "पाँच सौ",
    1000: "एक हज़ार", 2000: "दो हज़ार", 5000: "पाँच हज़ार", 10000: "दस हज़ार",
    100000: "एक लाख", 1000000: "दस लाख"
}

def num_to_hindi(n):
    if n in HINDI_NUMBERS:
        return HINDI_NUMBERS[n]
    if n < 100:
        tens = (n // 10) * 10
        rem = n % 10
        t_str = HINDI_NUMBERS.get(tens, str(tens))
        r_str = HINDI_NUMBERS.get(rem, str(rem))
        return f"{t_str} {r_str}"
    if n < 1000:
        hundreds = n // 100
        rem = n % 100
        h_str = f"{HINDI_NUMBERS.get(hundreds, str(hundreds))} सौ"
        if rem > 0:
            return f"{h_str} {num_to_hindi(rem)}"
        return h_str
    if n < 100000:
        thousands = n // 1000
        rem = n % 1000
        th_str = f"{num_to_hindi(thousands)} हज़ार"
        if rem > 0:
            return f"{th_str} {num_to_hindi(rem)}"
        return th_str
    return str(n)

PHONETIC_REPLACEMENTS = [
    # Percentage
    (r'(\d+)\s*%', lambda m: f"{num_to_hindi(int(m.group(1)))} परसेंट"),
    # Currency
    (r'\$(\d+[\d,]*)\s*(million|k|bn)?', lambda m: "दस लाख डॉलर" if ("1,000,000" in m.group(1) or "1000000" in m.group(1)) else f"{num_to_hindi(int(m.group(1).replace(',', '')))} डॉलर"),
    (r'₹(\d+)', lambda m: f"{num_to_hindi(int(m.group(1)))} रुपये"),
    # Time
    (r'(\d+):(\d+)\s*(AM|am)', lambda m: f"{'सुबह' if int(m.group(1)) > 4 else 'रात'} के {num_to_hindi(int(m.group(1)))} बजकर {num_to_hindi(int(m.group(2)))} मिनट"),
    (r'(\d+):00\s*(AM|am)', lambda m: f"{'सुबह' if int(m.group(1)) > 4 else 'रात'} के {num_to_hindi(int(m.group(1)))} बजे"),
    (r'(\d+)\s*(AM|am)', lambda m: f"{'सुबह' if int(m.group(1)) > 4 else 'रात'} के {num_to_hindi(int(m.group(1)))} बजे"),
    (r'(\d+):(\d+)\s*(PM|pm)', lambda m: f"{'दोपहर' if int(m.group(1)) < 5 else 'रात'} के {num_to_hindi(int(m.group(1)))} बजकर {num_to_hindi(int(m.group(2)))} मिनट"),
    (r'(\d+)\s*(PM|pm)', lambda m: f"{'दोपहर' if int(m.group(1)) < 5 else 'रात'} के {num_to_hindi(int(m.group(1)))} बजे"),
    # Specific years
    (r'\b2016\b', "दो हज़ार सोलह"),
    (r'\b2024\b', "दो हज़ार चौबीस"),
    (r'\b2025\b', "दो हज़ार पच्चीस"),
    (r'\b2026\b', "दो हज़ार छब्बीस"),
    # Conversational loanwords to natural Devanagari phonetics
    (r'\bWi-Fi\b|\bwifi\b|\bwifi\b', "वाई-फ़ाई"),
    (r'\bMath\b|\bmath\b|\bमैथ\b', "कैलकुलस और गणित"),
    (r'\bDecisions\b|\bdecisions\b|\bडिसीजन्स\b', "फैसले"),
    (r'\bAutopilot\b|\bautopilot\b', "ऑटोपायलट"),
    (r'\bStartup\b|\bstartup\b', "स्टार्टअप"),
    (r'\bAlgorithm\b|\balgorithm\b', "एल्गोरिदम"),
    (r'\bReboot\b|\breboot\b', "रीबूट"),
    (r'\bOffice\b|\boffice\b', "ऑफिस"),
    (r'\bCoffee\b|\bcoffee\b', "कॉफ़ी"),
    (r'\bMeeting\b|\bmeeting\b', "मीटिंग"),
    (r'\bSlack\b|\bslack\b', "स्लैक"),
    (r'\bOverthinking\b|\boverthinking\b', "ओवरथिंकिंग"),
    (r'\bNotification\b|\bnotification\b', "नोटिफ़िकेशन"),
    (r'\bNotifications\b|\bnotifications\b', "नोटिफ़िकेशन्स"),
    (r'\bBrain\b|\bbrain\b', "दिमाग"),
]

def normalize_hindi_text(text):
    clean = text
    for pattern, repl in PHONETIC_REPLACEMENTS:
        if callable(repl):
            clean = re.sub(pattern, repl, clean, flags=re.IGNORECASE)
        else:
            clean = re.sub(pattern, repl, clean, flags=re.IGNORECASE)
    clean = clean.replace("&", "और").replace("+", "प्लस").replace("@", "एट")
    # Replace sentence-breaking dandas, full stops, and ellipses with gentle commas so Edge-TTS never inserts 1.5s pauses
    clean = clean.replace("...", ", ").replace("..", ", ")
    clean = re.sub(r'[\।\.!?]\s*', ', ', clean)
    clean = re.sub(r',\s*,+', ', ', clean)
    return clean.strip()

# -------------------------------------------------------------
# 2. English Audio Synthesis via Local Kokoro-82M
# -------------------------------------------------------------
def synthesize_kokoro_beat(text, beat_id, voice="am_michael", speed=1.05):
    from kokoro_onnx import Kokoro
    import soundfile as sf

    models_dir = os.path.join(PROJECT_ROOT, "models", "kokoro")
    model_path = os.path.join(models_dir, "kokoro-v0_19.onnx")
    voices_path = os.path.join(models_dir, "voices-v1.0.bin")
    if not os.path.exists(voices_path):
        voices_path = os.path.join(models_dir, "voices.json")

    kokoro = Kokoro(model_path, voices_path)
    samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")

    out_wav = os.path.join(SCRATCH_DIR, f"en_beat_{beat_id}_raw.wav")
    sf.write(out_wav, samples, sr)

    probe_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_wav}"'
    dur = float(subprocess.check_output(probe_cmd, shell=True).decode().strip())
    return out_wav, dur

# -------------------------------------------------------------
# 3. Hindi Audio Synthesis Engines:
#    - Local Piper (Rohan/Pratham - 100% Offline, Zero Quotas, Permanent Free)
#    - Cartesia API (Rohan - sonic-latest)
#    - ElevenLabs API (Multilingual v2)
#    - Edge-TTS (Failover)
# -------------------------------------------------------------
CARTESIA_ROHAN_VOICE_ID = "4877b818-c7fe-4c89-b1cf-eadf8e23da72"
ELEVENLABS_DEFAULT_VOICE = "pNInz6obpgDQGcFmaJgB"  # Adam / Multilingual

def synthesize_piper_hindi_beat(text, beat_id, voice="rohan", speed=1.0):
    """
    Synthesizes Hindi using local Piper ONNX neural model.
    100% offline, zero internet, zero quotas, permanent forever.
    Configured for Option B: Deep Storyteller (rich baritone, natural breath variance).
    """
    piper_exe = os.path.join(PROJECT_ROOT, "models", "piper", "bin", "piper", "piper.exe")
    voices_dir = os.path.join(PROJECT_ROOT, "models", "piper", "voices")

    onnx_file = os.path.join(voices_dir, f"hi_IN-{voice}-medium.onnx")
    json_file = os.path.join(voices_dir, f"hi_IN-{voice}-medium.onnx.json")

    if not os.path.exists(onnx_file):
        onnx_file = os.path.join(voices_dir, "hi_IN-rohan-medium.onnx")
        json_file = os.path.join(voices_dir, "hi_IN-rohan-medium.onnx.json")

    clean_text = normalize_hindi_text(text)
    out_wav = os.path.join(SCRATCH_DIR, f"piper_hi_beat_{beat_id}_raw.wav")

    length_scale = str(round(1.0 / speed, 2))
    cmd = [
        piper_exe,
        "--model", onnx_file,
        "--config", json_file,
        "--output_file", out_wav,
        "--length_scale", length_scale,
        "--noise_scale", "0.72",     # Natural human vocal breath & subtle pitch modulation
        "--noise_scale_w", "0.85"   # Dynamic conversational rhythm variance
    ]

    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8")
    stdout, stderr = p.communicate(input=clean_text)
    if p.returncode != 0:
        raise RuntimeError(f"Piper TTS error: {stderr}")

    dur = float(subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_wav}"', shell=True).decode().strip())
    return out_wav, dur

def synthesize_cartesia_hindi_beat(text, beat_id, voice_id=CARTESIA_ROHAN_VOICE_ID):
    api_key = os.getenv("CARTESIA_API_KEY") or "sk_car_iPyiYxrNJY6XdWSQZHFiDE"
    if not api_key:
        raise ValueError("CARTESIA_API_KEY not configured")

    clean_text = normalize_hindi_text(text)
    headers = {
        "X-API-Key": api_key,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json"
    }

    payload = {
        "model_id": "sonic-latest",
        "transcript": clean_text,
        "voice": {
            "mode": "id",
            "id": voice_id
        },
        "output_format": {
            "container": "wav",
            "encoding": "pcm_s16le",
            "sample_rate": 44100
        },
        "language": "hi"
    }

    url = "https://api.cartesia.ai/tts/bytes"
    resp = requests.post(url, headers=headers, json=payload, timeout=25)
    if resp.status_code != 200:
        raise RuntimeError(f"Cartesia TTS error ({resp.status_code}): {resp.text}")

    out_wav = os.path.join(SCRATCH_DIR, f"cartesia_hi_beat_{beat_id}_raw.wav")
    with open(out_wav, "wb") as f:
        f.write(resp.content)

    dur = float(subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_wav}"', shell=True).decode().strip())
    return out_wav, dur

def synthesize_elevenlabs_hindi_beat(text, beat_id, voice_id=ELEVENLABS_DEFAULT_VOICE):
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY not configured")

    clean_text = normalize_hindi_text(text)
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "text": clean_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.45,
            "similarity_boost": 0.75
        }
    }
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"ElevenLabs TTS error ({resp.status_code}): {resp.text}")

    out_mp3 = os.path.join(SCRATCH_DIR, f"eleven_hi_beat_{beat_id}_raw.mp3")
    with open(out_mp3, "wb") as f:
        f.write(resp.content)

    dur = float(subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_mp3}"', shell=True).decode().strip())
    return out_mp3, dur

def synthesize_gemini_hindi_beat(text, beat_id, voice="Puck", max_retries=2):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    clean_text = normalize_hindi_text(text)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": clean_text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": voice
                    }
                }
            }
        }
    }

    for attempt in range(max_retries + 1):
        resp = requests.post(url, json=payload, timeout=25)
        data = resp.json()
        if "candidates" in data and data["candidates"][0]["content"]["parts"][0].get("inlineData"):
            b64 = data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
            raw_bytes = base64.b64decode(b64)
            raw_pcm = os.path.join(SCRATCH_DIR, f"gemini_hi_beat_{beat_id}.raw")
            with open(raw_pcm, "wb") as f:
                f.write(raw_bytes)

            out_wav = os.path.join(SCRATCH_DIR, f"gemini_hi_beat_{beat_id}_raw.wav")
            # Convert 24kHz mono PCM to WAV
            subprocess.run([
                "ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1",
                "-i", raw_pcm, out_wav
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            dur = float(subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_wav}"', shell=True).decode().strip())
            return out_wav, dur
        else:
            err_msg = data.get("error", {}).get("message", "Unknown Gemini TTS error")
            if "retry in" in err_msg and attempt < max_retries:
                m = re.search(r'retry in ([0-9.]+)s', err_msg)
                wait_time = float(m.group(1)) + 0.6 if m else 4.5
                print(f"      ⏳ [Gemini Rate Limit] Cooling down {wait_time:.1f}s before retry...")
                time.sleep(wait_time)
                continue
            raise RuntimeError(f"Gemini TTS failed: {err_msg}")

async def synthesize_edge_hindi_beat(text, beat_id, voice="hi-IN-MadhurNeural", rate="+0%"):
    clean_text = normalize_hindi_text(text)
    out_mp3 = os.path.join(SCRATCH_DIR, f"hi_beat_{beat_id}_raw.mp3")

    communicate = edge_tts.Communicate(clean_text, voice=voice, boundary="WordBoundary", rate=rate)
    raw_words = []

    with open(out_mp3, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                offset_sec = chunk["offset"] / 10_000_000.0
                duration_sec = chunk["duration"] / 10_000_000.0
                w_text = chunk.get("text", "").strip()
                if w_text:
                    raw_words.append({
                        "word": w_text,
                        "offset": offset_sec,
                        "duration": duration_sec
                    })

    probe_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_mp3}"'
    dur = float(subprocess.check_output(probe_cmd, shell=True).decode().strip())
    return out_mp3, dur, raw_words

# -------------------------------------------------------------
# 4. Master Synthesizer Function
# -------------------------------------------------------------
gemini_tts_disabled = False

async def synthesize_oddly_channel(script_data, lang_code="en", hindi_engine="piper"):
    """
    Synthesizes complete master audio & manifest for either English or Hindi.
    """
    global gemini_tts_disabled
    fps = 30
    lead_in_sec = 0.06
    pause_sec = 0.14
    outro_sec = 0.25

    print(f"\n🎙️ [SYNTHESIZER] Generating {lang_code.upper()} Audio (Hindi Engine: {hindi_engine})...")
    wav_files = []
    beat_durations = []
    beat_raw_words = []

    for i, beat in enumerate(script_data["beats"]):
        beat_id = beat.get("id", i + 1)
        raw_text = beat.get("audio_text") or beat.get("narration") or beat.get("title", f"Scene {beat_id}")

        if lang_code == "en":
            raw_file, _ = synthesize_kokoro_beat(raw_text, beat_id, voice="am_michael", speed=1.08)
            wav_48k = os.path.join(SCRATCH_DIR, f"{lang_code}_beat_{beat_id}_48k.wav")
            # Convert to 48kHz stereo, remove leading/trailing empty silence, and compact internal pauses > 0.35s
            subprocess.run([
                "ffmpeg", "-y", "-i", raw_file,
                "-af", "silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-40dB,silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse",
                "-ar", "48000", "-ac", "2", wav_48k
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            dur = float(subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{wav_48k}"', shell=True).decode().strip())
            wav_files.append(wav_48k)
            beat_durations.append(dur)
            beat_raw_words.append([])
            print(f"   • Beat {beat_id} [Kokoro-82M]: {dur:.2f}s")
        else:
            engine_name = f"Piper ({hindi_engine})"
            raw_words = []
            raw_file = None

            if hindi_engine == "cartesia":
                try:
                    raw_file, _ = synthesize_cartesia_hindi_beat(raw_text, beat_id, voice_id=CARTESIA_ROHAN_VOICE_ID)
                    engine_name = "Cartesia (Rohan)"
                except Exception as cart_err:
                    print(f"      ⚠️ Cartesia TTS failed ({cart_err}). Falling back to Local Piper...")
                    try:
                        raw_file, _ = synthesize_piper_hindi_beat(raw_text, beat_id, voice="rohan", speed=1.05)
                        engine_name = "Piper (Rohan-Local)"
                    except Exception as pip_err:
                        print(f"      ⚠️ Piper fallback failed ({pip_err}). Falling back to Edge-TTS...")
                        raw_file, _, raw_words = await synthesize_edge_hindi_beat(raw_text, beat_id, voice="hi-IN-MadhurNeural", rate="+14%")
                        engine_name = "Edge-TTS (Madhur)"
            elif hindi_engine == "elevenlabs":
                try:
                    raw_file, _ = synthesize_elevenlabs_hindi_beat(raw_text, beat_id)
                    engine_name = "ElevenLabs (Hindi)"
                except Exception as el_err:
                    print(f"      ⚠️ ElevenLabs TTS failed ({el_err}). Falling back to Local Piper...")
                    raw_file, _ = synthesize_piper_hindi_beat(raw_text, beat_id, voice="rohan", speed=1.05)
                    engine_name = "Piper (Rohan-Local)"
            else: # Default: 100% Offline, Zero-Cost, Permanent Local Piper
                try:
                    raw_file, _ = synthesize_piper_hindi_beat(raw_text, beat_id, voice="rohan", speed=1.05)
                    engine_name = "Piper (Rohan-Local)"
                except Exception as pip_err:
                    print(f"      ⚠️ Piper TTS failed ({pip_err}). Falling back to Edge-TTS...")
                    raw_file, _, raw_words = await synthesize_edge_hindi_beat(raw_text, beat_id, voice="hi-IN-MadhurNeural", rate="+14%")
                    engine_name = "Edge-TTS (Madhur)"

            wav_48k = os.path.join(SCRATCH_DIR, f"{lang_code}_beat_{beat_id}_48k.wav")
            subprocess.run([
                "ffmpeg", "-y", "-i", raw_file,
                "-af", "silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-40dB,silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse",
                "-ar", "48000", "-ac", "2", wav_48k
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            dur = float(subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{wav_48k}"', shell=True).decode().strip())
            wav_files.append(wav_48k)
            beat_durations.append(dur)
            beat_raw_words.append(raw_words)
            print(f"   • Beat {beat_id} [{engine_name}]: {dur:.2f}s")

    # Generate silence cushions
    sil_lead = os.path.join(SCRATCH_DIR, "sil_008.wav")
    sil_pause = os.path.join(SCRATCH_DIR, "sil_022.wav")
    sil_outro = os.path.join(SCRATCH_DIR, "sil_030.wav")
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(lead_in_sec), sil_lead], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(pause_sec), sil_pause], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(outro_sec), sil_outro], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Concat file
    concat_txt = os.path.join(SCRATCH_DIR, f"{lang_code}_concat_final.txt")
    with open(concat_txt, "w") as f:
        f.write(f"file '{os.path.abspath(sil_lead).replace(chr(92), '/')}'\n")
        for i, w in enumerate(wav_files):
            f.write(f"file '{os.path.abspath(w).replace(chr(92), '/')}'\n")
            if i < len(wav_files) - 1:
                f.write(f"file '{os.path.abspath(sil_pause).replace(chr(92), '/')}'\n")
            else:
                f.write(f"file '{os.path.abspath(sil_outro).replace(chr(92), '/')}'\n")

    full_voice_wav = os.path.join(SCRATCH_DIR, f"{lang_code}_full_voice_final.wav")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt, "-c:a", "pcm_s16le", full_voice_wav], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    probe_full = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{full_voice_wav}"'
    full_dur = float(subprocess.check_output(probe_full, shell=True).decode().strip())
    total_frames = int(round(full_dur * fps))

    # Beat manifest calculation
    current_time = lead_in_sec
    manifest_beats = []
    beat_starts_ms = []

    for i, dur in enumerate(beat_durations):
        beat_id = i + 1
        b_data = script_data["beats"][i]
        start_sec = round(current_time, 2)
        start_frame = int(round(start_sec * fps))
        card_dur_sec = dur + (pause_sec if i < len(beat_durations) - 1 else outro_sec)
        card_frames = int(round(card_dur_sec * fps))

        # Copy all props from b_data, then set timing
        beat_entry = {
            **b_data,
            "id": beat_id,
            "title": b_data.get("title", f"SCENE {beat_id}"),
            "badge": b_data.get("badge", ""),
            "startSec": start_sec,
            "durationSec": round(dur, 2),
            "startFrame": start_frame,
            "durationInFrames": card_frames,
            "endFrame": start_frame + card_frames
        }
        manifest_beats.append(beat_entry)
        beat_starts_ms.append(int(start_sec * 1000))
        current_time += card_dur_sec

    # Subtitle word timing mapping
    all_words = []
    for i, b_data in enumerate(script_data["beats"]):
        b_info = manifest_beats[i]
        b_start = b_info["startSec"]
        b_dur = b_info["durationSec"]
        tokens = b_data.get("display_tokens") or [w for w in (b_data.get("audio_text") or b_data.get("narration") or "").split() if w]
        num_tok = len(tokens)
        raw_words = beat_raw_words[i]
        num_raw = len(raw_words)

        if num_raw > 0 and lang_code == "hi":
            for idx, tok in enumerate(tokens):
                raw_idx = min(int(idx * (num_raw / num_tok)), num_raw - 1)
                w_start = round(b_start + raw_words[raw_idx]["offset"], 2)
                w_dur = max(0.20, raw_words[raw_idx]["duration"])
                w_end = round(w_start + w_dur, 2)
                all_words.append({"word": tok, "start": w_start, "end": w_end})
        else:
            weights = [max(1, len(tok)) for tok in tokens]
            tot_weight = sum(weights) or 1
            curr_w_time = b_start
            for idx, tok in enumerate(tokens):
                w_dur = (weights[idx] / tot_weight) * b_dur
                w_start = round(curr_w_time, 2)
                w_end = round(w_start + w_dur, 2)
                all_words.append({"word": tok, "start": w_start, "end": w_end})
                curr_w_time += w_dur

    # -------------------------------------------------------------
    # Multi-Beat Procedural Sound Design Engine (Zero-Latency NumPy Staging)
    # -------------------------------------------------------------
    ambient_mp3 = os.path.join(PROJECT_ROOT, "public", "ambient.mp3").replace("\\", "/")
    master_mp3 = os.path.join(PROJECT_ROOT, "public", f"oddly_master_{lang_code}.mp3")

    sfx_dir = os.path.join(PROJECT_ROOT, "public", "sfx")
    sfx_files = {
        "whoosh": os.path.join(sfx_dir, "whoosh.mp3"),
        "pop": os.path.join(sfx_dir, "pop.mp3"),
        "thud": os.path.join(sfx_dir, "thud.mp3"),
        "stamp": os.path.join(sfx_dir, "stamp_slam.mp3"),
        "sub_boom": os.path.join(sfx_dir, "sub_boom.mp3"),
        "blip": os.path.join(sfx_dir, "blip.mp3"),
        "paper_slide": os.path.join(sfx_dir, "paper_slide.mp3"),
    }

    sample_rate = 48000
    total_samples = int(full_dur * sample_rate) + sample_rate
    sfx_track = np.zeros(total_samples, dtype=np.float32)

    cached_sfx = {}
    for name, fpath in sfx_files.items():
        if os.path.exists(fpath):
            try:
                data, sr = sf.read(fpath, dtype='float32')
                if data.ndim > 1:
                    data = data.mean(axis=1)  # Mono
                if sr != sample_rate:
                    dur = len(data) / sr
                    new_len = int(dur * sample_rate)
                    data = np.interp(np.linspace(0, len(data), new_len, endpoint=False), np.arange(len(data)), data)
                cached_sfx[name] = data
            except Exception as e:
                pass

    def overlay_sfx(name, time_sec, volume=0.35):
        if name not in cached_sfx:
            return
        audio = cached_sfx[name] * volume
        start_idx = int(time_sec * sample_rate)
        end_idx = min(start_idx + len(audio), total_samples)
        add_len = end_idx - start_idx
        if add_len > 0:
            sfx_track[start_idx:end_idx] += audio[:add_len]

    # Procedurally schedule multi-beat micro-SFX across all beats
    total_beats = len(manifest_beats)
    for idx, beat in enumerate(manifest_beats):
        b_start = beat["startSec"]
        if idx == 0:
            # Beat 1: Frame 0 Seismic Sub-Bass Drop, Hook Swish, Badge Pop & Heavy Impact
            overlay_sfx("sub_boom", 0.0, volume=0.58)
            overlay_sfx("whoosh", 0.02, volume=0.45)
            overlay_sfx("pop", 0.12, volume=0.42)
            overlay_sfx("thud", 0.28, volume=0.45)
        else:
            # Scene Cut Transition Whoosh
            overlay_sfx("whoosh", max(0, b_start - 0.04), volume=0.28)
            # Badge Punch Pop (snappy Frame 4 = ~0.13s)
            overlay_sfx("pop", b_start + 0.13, volume=0.35)

            # Prop impact / Climax Revelation
            if idx == total_beats - 1:
                # Comment Trap / Outro Call
                overlay_sfx("blip", b_start + 0.35, volume=0.40)
            elif idx >= total_beats - 3:
                # Climax Revelation
                overlay_sfx("sub_boom", b_start + 0.28, volume=0.42)
            else:
                overlay_sfx("stamp" if idx % 2 == 0 else "thud", b_start + 0.26, volume=0.32)

    # Normalize to prevent clipping
    max_val = np.max(np.abs(sfx_track))
    if max_val > 0.95:
        sfx_track = sfx_track / max_val * 0.95

    sfx_track_wav = os.path.join(SCRATCH_DIR, f"procedural_sfx_{lang_code}.wav")
    sf.write(sfx_track_wav, sfx_track, sample_rate)

    # Option B: Deep Storyteller Broadcast Mastering Chain
    # - highpass=f=75: Cuts sub-rumble
    # - equalizer=f=120:g=4.2:w=1.2: Deep chest resonance & warm baritone punch
    # - equalizer=f=350:g=-2.4:w=1.0: Removes hollow nasal mid-frequency mud
    # - equalizer=f=3600:g=3.0:w=1.0: Crisp presence so diction cuts through clearly
    # - acompressor: Smooth broadcast vocal compression with punchy makeup gain
    vocal_mastering = (
        "highpass=f=75,"
        "equalizer=f=120:width_type=o:width=1.2:g=4.2,"
        "equalizer=f=350:width_type=o:width=1.0:g=-2.4,"
        "equalizer=f=3600:width_type=o:width=1.0:g=3.0,"
        "acompressor=threshold=-18dB:ratio=3.5:attack=8:release=60:makeup=2.8dB"
    )

    filter_complex = (
        f"[0:a]{vocal_mastering}[vocal];"
        f"[1:a]volume=0.065[bg];"
        f"[2:a]volume=0.90[sfx];"
        f"[vocal][bg][sfx]amix=inputs=3:duration=first:dropout_transition=0:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=10[aout]"
    )

    cmd_mix = [
        "ffmpeg", "-y",
        "-i", full_voice_wav,
        "-stream_loop", "-1", "-i", ambient_mp3,
        "-i", sfx_track_wav,
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        master_mp3
    ]
    subprocess.run(cmd_mix, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Manifest Output
    manifest_data = {
        "language": lang_code,
        "totalFrames": total_frames,
        "totalDurationSec": round(full_dur, 2),
        "fps": fps,
        "beats": manifest_beats,
        "words": all_words
    }

    manifest_dest = os.path.join(PROJECT_ROOT, "src", "data", f"oddly_manifest_{lang_code}.json")
    with open(manifest_dest, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    print(f"✅ {lang_code.upper()} Master Audio & Manifest Generated ({full_dur:.2f}s, {total_frames} frames)!")
    return manifest_data

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", required=True, help="Path to json script file")
    parser.add_argument("--lang", default="all", choices=["en", "hi", "all"])
    parser.add_argument("--hindi-engine", default="piper", choices=["piper", "cartesia", "elevenlabs", "edge"], help="Hindi speech engine (piper is 100% free offline local)")
    args = parser.parse_args()

    with open(args.script, "r", encoding="utf-8") as f:
        data = json.load(f)

    if args.lang in ["en", "all"]:
        en_script = data["en"] if "en" in data else data
        asyncio.run(synthesize_oddly_channel(en_script, "en", hindi_engine=args.hindi_engine))

    if args.lang in ["hi", "all"]:
        hi_script = data["hi"] if "hi" in data else data
        asyncio.run(synthesize_oddly_channel(hi_script, "hi", hindi_engine=args.hindi_engine))
