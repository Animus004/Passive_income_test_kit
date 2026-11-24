import os
import sys
import zipfile
import requests
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models", "piper")
BIN_DIR = os.path.join(MODELS_DIR, "bin")
VOICES_DIR = os.path.join(MODELS_DIR, "voices")

os.makedirs(BIN_DIR, exist_ok=True)
os.makedirs(VOICES_DIR, exist_ok=True)

PIPER_ZIP_URL = "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip"
PIPER_EXE = os.path.join(BIN_DIR, "piper", "piper.exe")

ROHAN_ONNX_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/hi/hi_IN/rohan/medium/hi_IN-rohan-medium.onnx"
ROHAN_JSON_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/hi/hi_IN/rohan/medium/hi_IN-rohan-medium.onnx.json"

ROHAN_ONNX_PATH = os.path.join(VOICES_DIR, "hi_IN-rohan-medium.onnx")
ROHAN_JSON_PATH = os.path.join(VOICES_DIR, "hi_IN-rohan-medium.onnx.json")

def download_file(url, target_path, desc):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        print(f"✅ {desc} already exists.")
        return target_path
    print(f"📥 Downloading {desc}...")
    resp = requests.get(url, stream=True, timeout=60)
    resp.raise_for_status()
    with open(target_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=65536):
            if chunk:
                f.write(chunk)
    print(f"✅ Downloaded {desc} ({os.path.getsize(target_path) / (1024*1024):.2f} MB)")
    return target_path

def setup_piper():
    # 1. Download & Extract Piper binary
    if not os.path.exists(PIPER_EXE):
        zip_path = os.path.join(MODELS_DIR, "piper_windows_amd64.zip")
        download_file(PIPER_ZIP_URL, zip_path, "Piper Windows standalone executable")
        print("📦 Extracting Piper...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(BIN_DIR)
        print("✅ Piper extracted successfully.")

    # 2. Download Rohan ONNX Model + JSON
    download_file(ROHAN_ONNX_URL, ROHAN_ONNX_PATH, "Hindi Rohan ONNX Neural Model (60 MB)")
    download_file(ROHAN_JSON_URL, ROHAN_JSON_PATH, "Hindi Rohan ONNX Config JSON")

    # 3. Test execution
    test_text = "नमस्ते, यह एक स्थायी और मुफ़्त हिंदी आवाज़ का परीक्षण है।"
    test_wav = os.path.join(PROJECT_ROOT, "scratch", "test_piper_rohan.wav")
    print("\n🎙️ Running local Piper test...")

    cmd = [
        PIPER_EXE,
        "--model", ROHAN_ONNX_PATH,
        "--config", ROHAN_JSON_PATH,
        "--output_file", test_wav
    ]

    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8")
    stdout, stderr = p.communicate(input=test_text)
    if p.returncode != 0:
        raise RuntimeError(f"Piper execution failed: {stderr}")

    dur = subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{test_wav}"', shell=True).decode().strip()
    print(f"🎉 SUCCESS! Local Hindi voice synthesized in real-time ({float(dur):.2f}s) -> {test_wav}")

if __name__ == "__main__":
    setup_piper()
