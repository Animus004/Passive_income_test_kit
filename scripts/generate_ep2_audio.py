import urllib.request
import json
import base64
import os
import asyncio
import edge_tts
from generate_audio import get_elevenlabs_api_key, parse_elevenlabs_alignment

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)

key = get_elevenlabs_api_key()

# 1. English Script (Crafted for dramatic cadence, emotional pauses, and infinite loop)
script_en = (
    "What if the entire global internet was deleted for seventy-two hours? "
    "At 12:01 AM... every screen on Earth freezes. "
    "Instantly, thirty thousand commercial airplanes lose GPS navigation and are forced to fly blind! "
    "By 8:00 AM, every credit card and ATM on the planet is dead, leaving billions of people unable to buy food. "
    "Supply chains completely freeze because delivery trucks rely on digital dispatch. "
    "Within forty-eight hours, power grids begin desyncing, plunging entire continents into pitch black darkness! "
    "Erasing over twelve trillion dollars in digital wealth. "
    "Proving that modern civilization doesn't run on money... it runs on invisible data packets. "
    "Which is why, if your Wi-Fi suddenly disappeared..."
)

print("[EP2] Synthesizing English (Adam) voiceover...")
url = "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB/with-timestamps"
payload = {
    "text": script_en,
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {
        "stability": 0.28,
        "similarity_boost": 0.85,
        "style": 0.52,
        "use_speaker_boost": True,
    },
}
req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"xi-api-key": key, "Content-Type": "application/json"},
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    audio_bytes = base64.b64decode(data.get("audio_base64", ""))
    alignment = data.get("alignment", {})
    words = parse_elevenlabs_alignment(alignment, script_en)
    with open(os.path.join(PUBLIC_DIR, "voiceover_ep2_en.mp3"), "wb") as f:
        f.write(audio_bytes)
    with open(os.path.join(PUBLIC_DIR, "subtitles_ep2_en.json"), "w", encoding="utf-8") as f:
        json.dump(words, f, indent=2)
    print("✅ English audio generated! Duration:", words[-1]["end"] if words else 0)

# 2. Hindi Script (Colloquial, punchy, high-stakes curiosity)
script_hi = (
    "क्या हो अगर पूरी दुनिया का इंटरनेट बहत्तर घंटों के लिए हमेशा के लिए बंद हो जाए? "
    "रात बारह बजकर एक मिनट पर, दुनिया की हर स्क्रीन फ्रीज हो जाती है। "
    "अगले ही पल, तीस हज़ार हवाई जहाज़ अपना जीपीएस खो देते हैं और हवा में अंधे हो जाते हैं। "
    "सुबह आठ बजे तक, दुनिया का हर एटीएम और क्रेडिट कार्ड ठप हो जाता है। "
    "खाने-पीने की सप्लाई रुक जाती है क्योंकि डिलीवरी ट्रक बिना इंटरनेट के चल ही नहीं सकते। "
    "अड़तालीस घंटों में पावर ग्रिड्स बंद होने लगते हैं और पूरे महाद्वीप अंधेरे में डूब जाते हैं। "
    "यानी हमारी आधुनिक दुनिया पैसे से नहीं... अदृश्य इंटरनेट डेटा से चलती है। "
    "और यही वजह है कि अगर अचानक आपका इंटरनेट बंद हो जाए..."
)

async def run_hi():
    print("[EP2] Synthesizing Hindi (Madhur) voiceover...")
    comm = edge_tts.Communicate(script_hi, "hi-IN-MadhurNeural", boundary="WordBoundary", rate="+20%")
    words_hi = []
    audio_hi = bytearray()
    async for chunk in comm.stream():
        if chunk.get("type") == "audio":
            audio_hi.extend(chunk["data"])
        elif chunk.get("type") == "WordBoundary":
            w_text = chunk.get("text", "").strip()
            if w_text:
                words_hi.append({
                    "word": w_text,
                    "start": round(chunk["offset"] / 10_000_000.0, 3),
                    "end": round((chunk["offset"] + chunk["duration"]) / 10_000_000.0, 3),
                    "duration": round(chunk["duration"] / 10_000_000.0, 3),
                })
    with open(os.path.join(PUBLIC_DIR, "voiceover_ep2_hi.mp3"), "wb") as f:
        f.write(audio_hi)
    with open(os.path.join(PUBLIC_DIR, "subtitles_ep2_hi.json"), "w", encoding="utf-8") as f:
        json.dump(words_hi, f, indent=2, ensure_ascii=False)
    print("✅ Hindi audio generated! Duration:", words_hi[-1]["end"] if words_hi else 0)

asyncio.run(run_hi())
