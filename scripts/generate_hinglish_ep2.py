import asyncio
import edge_tts
import json
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")

SENTENCE_PAIRS = [
    {
        "hi": "क्या हो अगर पूरी दुनिया का इंटरनेट बहत्तर घंटों के लिए हमेशा के लिए डिलीट हो जाए?",
        "hinglish": "Kya ho agar poori duniya ka internet 72 ghante ke liye delete ho jaye?"
    },
    {
        "hi": "रात बारह बजकर एक मिनट पर, दुनिया की हर स्क्रीन फ्रीज हो जाती है।",
        "hinglish": "Raat 12:01 AM par, duniya ki har screen freeze ho jati hai."
    },
    {
        "hi": "अगले ही पल, तीस हज़ार हवाई जहाज़ अपना जीपीएस खो देते हैं और हवा में अंधे हो जाते हैं!",
        "hinglish": "Agle hi pal, 30,000 hawai jahaz GPS kho dete hain aur andhe ho jate hain!"
    },
    {
        "hi": "सुबह आठ बजे तक, दुनिया का हर एटीएम और क्रेडिट कार्ड ठप हो जाता है, जिससे अरबों लोग खाना भी नहीं खरीद पाते।",
        "hinglish": "Subah 8:00 AM tak, duniya ka har ATM aur credit card dead ho jata hai."
    },
    {
        "hi": "सप्लाई चेन पूरी तरह जम जाती है क्योंकि डिलीवरी ट्रक डिजिटल डिस्पैच पर निर्भर होते हैं।",
        "hinglish": "Supply chains freeze ho jati hain kyunki delivery trucks digital dispatch par chalte hain."
    },
    {
        "hi": "अड़तालीस घंटों में पावर ग्रिड्स बंद होने लगते हैं और पूरे महाद्वीप घुप अंधेरे में डूब जाते हैं!",
        "hinglish": "48 ghanton mein power grids band hote hain aur poore continents andhere mein doob jate hain!"
    },
    {
        "hi": "बारह ट्रिलियन डॉलर की डिजिटल दौलत गायब हो जाती है।",
        "hinglish": "12 trillion dollars ki digital wealth gayab ho jati hai."
    },
    {
        "hi": "यानी आधुनिक दुनिया पैसे से नहीं... अदृश्य डेटा पैकेट्स से चलती है।",
        "hinglish": "Yani modern duniya paise se nahi, invisible data packets se chalti hai."
    },
    {
        "hi": "और यही वजह है कि अगर अचानक आपका वाई-फाई बंद हो जाए...",
        "hinglish": "Aur yahi wajah hai, agar aapka Wi-Fi achanak gayab ho jaye..."
    }
]

async def main():
    print("🎙️ Generating Hindi Audio + Hinglish Subtitles (Madhur Neural @ +10%)...")
    full_hi_text = " ".join([p["hi"] for p in SENTENCE_PAIRS])
    comm = edge_tts.Communicate(full_hi_text, "hi-IN-MadhurNeural", boundary="SentenceBoundary", rate="+10%")

    sentence_timings = []
    audio_chunks = []

    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            start_sec = chunk["offset"] / 10_000_000
            dur_sec = chunk["duration"] / 10_000_000
            sentence_timings.append({
                "text": chunk["text"],
                "start": round(start_sec, 3),
                "end": round(start_sec + dur_sec, 3)
            })

    audio_path = os.path.join(PUBLIC_DIR, "voiceover_ep2_hi.mp3")
    with open(audio_path, "wb") as f:
        f.write(b"".join(audio_chunks))

    print(f"✓ Audio saved to {audio_path}. Sentences detected: {len(sentence_timings)}")

    # Map to Hinglish words
    hinglish_words = []
    for i, timing in enumerate(sentence_timings):
        pair = SENTENCE_PAIRS[min(i, len(SENTENCE_PAIRS) - 1)]
        h_words = pair["hinglish"].split()
        if not h_words:
            continue
        s_start = timing["start"]
        s_end = timing["end"]
        s_dur = max(0.2, s_end - s_start)
        word_dur = s_dur / len(h_words)

        for w_idx, w in enumerate(h_words):
            w_start = round(s_start + w_idx * word_dur, 3)
            w_end = round(w_start + word_dur, 3)
            hinglish_words.append({
                "word": w,
                "start": w_start,
                "end": w_end
            })

    subs_path = os.path.join(PUBLIC_DIR, "subtitles_ep2_hi.json")
    with open(subs_path, "w", encoding="utf-8") as f:
        json.dump(hinglish_words, f, indent=2)

    total_dur = sentence_timings[-1]["end"] if sentence_timings else 0
    print(f"✅ Hinglish Subtitles generated ({len(hinglish_words)} words, total {total_dur:.2f}s) -> {subs_path}")

if __name__ == "__main__":
    asyncio.run(main())
