"""
AI4Bharat IndicF5 Cloud Synthesizer
Zero-Cost, Unlimited, Permanent Cloud GPU Speech Synthesizer
Powered by AI4Bharat IndicF5 on Hugging Face ZeroGPU (NVIDIA A10G)

No quotas, no credit cards, no local VRAM overhead.
"""

import os
import sys
import json
import time
import requests
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH_DIR = os.path.join(PROJECT_ROOT, "scratch", "indicf5")
os.makedirs(SCRATCH_DIR, exist_ok=True)

BASE_URL = "https://ai4bharat-indicf5.hf.space"

# Preset authentic voice reference prompts from AI4Bharat
VOICE_PROMPTS = {
    # Charismatic male narrator (Marathi/Hindi accent, deep, steady, confident)
    "male_narrator": {
        "url": "https://github.com/AI4Bharat/IndicF5/raw/refs/heads/main/prompts/MAR_M_WIKI_00001.wav",
        "ref_text": "दिगंतराव्दारे अंतराळ कक्षेतला कचरा चिन्हित करण्यासाठी प्रयत्न केले जात आहे.",
        "filename": "mar_m_prompt.wav"
    },
    # Energetic friendly female (warm, cheerful, expressive)
    "female_expressive": {
        "url": "https://github.com/AI4Bharat/IndicF5/raw/refs/heads/main/prompts/PAN_F_HAPPY_00001.wav",
        "ref_text": "ਭਹੰਪੀ ਵਿੱਚ ਸਮਾਰਕਾਂ ਦੇ ਭਵਨ ਨਿਰਮਾਣ ਕਲਾ ਦੇ ਵੇਰਵੇ ਗੁੰਝਲਦਾਰ ਅਤੇ ਹੈਰਾਨ ਕਰਨ ਵਾਲੇ ਹਨ, ਜੋ ਮੈਨੂੰ ਖੁਸ਼ ਕਰਦੇ ਹਨ।",
        "filename": "pan_f_prompt.wav"
    }
}

cached_uploads = {}

def get_or_upload_prompt(preset_key="male_narrator"):
    if preset_key in cached_uploads:
        return cached_uploads[preset_key]

    preset = VOICE_PROMPTS.get(preset_key, VOICE_PROMPTS["male_narrator"])
    local_path = os.path.join(SCRATCH_DIR, preset["filename"])

    if not os.path.exists(local_path):
        print(f"📥 Downloading reference voice prompt ({preset_key})...")
        resp = requests.get(preset["url"], timeout=30)
        with open(local_path, "wb") as f:
            f.write(resp.content)

    print(f"📤 Uploading voice prompt to IndicF5 cloud engine...")
    with open(local_path, "rb") as f:
        files = {"files": (preset["filename"], f, "audio/wav")}
        up_resp = requests.post(f"{BASE_URL}/gradio_api/upload", files=files, timeout=30)

    if up_resp.status_code != 200:
        raise RuntimeError(f"Prompt upload failed: {up_resp.status_code} - {up_resp.text}")

    cloud_path = up_resp.json()[0]
    cached_uploads[preset_key] = (cloud_path, preset["ref_text"])
    return cached_uploads[preset_key]

def synthesize_indicf5(text, out_path, voice_preset="male_narrator", max_retries=3):
    """
    Synthesizes Hindi text to speech using AI4Bharat IndicF5 on Cloud A10G GPU.
    """
    cloud_prompt_path, ref_text = get_or_upload_prompt(voice_preset)

    payload = {
        "data": [
            text,
            {"path": cloud_prompt_path, "meta": {"_type": "gradio.FileData"}},
            ref_text
        ]
    }

    for attempt in range(1, max_retries + 1):
        try:
            call_resp = requests.post(f"{BASE_URL}/gradio_api/call/synthesize_speech", json=payload, timeout=30)
            if call_resp.status_code != 200:
                raise RuntimeError(f"API call error: {call_resp.status_code} {call_resp.text}")

            event_id = call_resp.json().get("event_id")
            if not event_id:
                raise RuntimeError(f"Missing event_id in response: {call_resp.text}")

            stream_url = f"{BASE_URL}/gradio_api/call/synthesize_speech/{event_id}"
            s_resp = requests.get(stream_url, stream=True, timeout=60)

            result_url = None
            for line in s_resp.iter_lines():
                if line:
                    decoded = line.decode("utf-8")
                    if "data:" in decoded:
                        try:
                            res_json = json.loads(decoded.replace("data: ", "").strip())
                            if isinstance(res_json, list) and len(res_json) > 0:
                                result_url = res_json[0].get("url")
                        except Exception:
                            pass

            file_path = None
            if not result_url:
                raise RuntimeError("No audio URL returned from IndicF5 stream")

            # Gradio on HF Spaces sometimes duplicates '/gradio_api/gradio_api/' in result_url
            # Fix URL: ensure single /gradio_api/file=
            if "/gradio_api/gradio_api/" in result_url:
                dl_url = result_url.replace("/gradio_api/gradio_api/", "/gradio_api/")
            elif result_url.startswith("http"):
                dl_url = result_url
            else:
                dl_url = f"{BASE_URL}/gradio_api/file={result_url}"

            # Download synthesized audio
            dl_resp = requests.get(dl_url, timeout=30)
            if dl_resp.status_code != 200:
                raise RuntimeError(f"Failed to download audio from {dl_url}: {dl_resp.status_code}")

            raw_wav = out_path + ".raw24k.wav"
            with open(raw_wav, "wb") as f:
                f.write(dl_resp.content)

            # Convert to 48kHz stereo, remove dead air silence
            subprocess.run([
                "ffmpeg", "-y", "-i", raw_wav,
                "-af", "silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-40dB,silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse",
                "-ar", "48000", "-ac", "2", out_path
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            dur = float(subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{out_path}"', shell=True).decode().strip())
            return out_path, dur

        except Exception as err:
            if attempt == max_retries:
                raise err
            print(f"      ⚠️ IndicF5 attempt {attempt} failed ({err}). Retrying in 2s...")
            time.sleep(2)

if __name__ == "__main__":
    test_text = "क्या आप जानते हैं कि क्रेडिट कार्ड कैसे काम करता है? चलिए जानते हैं।"
    test_out = os.path.join(SCRATCH_DIR, "test_indicf5_standalone.wav")
    print(f"🎙️ Testing IndicF5 standalone synthesis...")
    path, dur = synthesize_indicf5(test_text, test_out, "male_narrator")
    print(f"✅ Success! Audio saved to {path} ({dur:.2f}s)")
