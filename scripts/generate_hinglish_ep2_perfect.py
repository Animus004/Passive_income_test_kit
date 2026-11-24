import asyncio
import edge_tts
import json
import os
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
TEMP_DIR = os.path.join(PUBLIC_DIR, "temp_tts_hi")
os.makedirs(TEMP_DIR, exist_ok=True)

SENTENCES = [
    {
        "id": 1,
        "hi": "क्या हो अगर पूरी दुनिया का इंटरनेट बहत्तर घंटों के लिए हमेशा के लिए बंद हो जाए?",
        "hinglish": "Kya ho agar poori duniya ka internet 72 ghante ke liye band ho jaye?"
    },
    {
        "id": 2,
        "hi": "रात बारह बजकर एक मिनट पर दुनिया की हर स्क्रीन फ्रीज हो जाती है।",
        "hinglish": "Raat 12:01 AM par duniya ki har screen freeze ho jati hai."
    },
    {
        "id": 3,
        "hi": "अगले ही पल तीस हज़ार हवाई जहाज़ अपना जीपीएस खो देते हैं और हवा में अंधे हो जाते हैं!",
        "hinglish": "Agle hi pal 30,000 hawai jahaz GPS kho dete hain aur andhe ho jate hain!"
    },
    {
        "id": 4,
        "hi": "सुबह आठ बजे तक दुनिया का हर एटीएम और क्रेडिट कार्ड ठप हो जाता है।",
        "hinglish": "Subah 8:00 AM tak duniya ka har ATM aur credit card dead ho jata hai."
    },
    {
        "id": 5,
        "hi": "सप्लाई चेन पूरी तरह जम जाती है क्योंकि डिलीवरी ट्रक डिजिटल डिस्पैच पर निर्भर होते हैं।",
        "hinglish": "Supply chains freeze ho jati hain kyunki delivery trucks digital dispatch par chalte hain."
    },
    {
        "id": 6,
        "hi": "अड़तालीस घंटों में पावर ग्रिड्स बंद होने लगते हैं और पूरे महाद्वीप घुप अंधेरे में डूब जाते हैं!",
        "hinglish": "48 ghanton mein power grids band hote hain aur poore continents andhere mein doob jate hain!"
    },
    {
        "id": 7,
        "hi": "बारह ट्रिलियन डॉलर की डिजिटल दौलत गायब हो जाती है।",
        "hinglish": "12 trillion dollars ki digital daulat gayab ho jati hai."
    },
    {
        "id": 8,
        "hi": "यानी आधुनिक दुनिया पैसे से नहीं अदृश्य डेटा पैकेट्स से चलती है।",
        "hinglish": "Yani modern duniya paise se nahi invisible data packets se chalti hai."
    },
    {
        "id": 9,
        "hi": "और यही वजह है कि अगर अचानक आपका वाई-फाई बंद हो जाए...",
        "hinglish": "Aur yahi wajah hai agar aapka Wi-Fi achanak gayab ho jaye..."
    }
]

async def synth_sentence(idx, text):
    out_file = os.path.join(TEMP_DIR, f"sent_{idx:02d}.mp3")
    comm = edge_tts.Communicate(text, "hi-IN-MadhurNeural", rate="+10%")
    await comm.save(out_file)
    return out_file

def get_duration(file_path):
    cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{file_path.replace(os.sep, "/")}"'
    out = subprocess.check_output(cmd, shell=True).decode().strip()
    return float(out)

async def main():
    print("🎙️ Synthesizing 9 Sentence Beats for Hindi Episode #2...")
    audio_files = []
    sentence_data = []
    
    current_time = 0.100  # Start with 100ms cushion
    all_hinglish_words = []
    
    for item in SENTENCES:
        idx = item["id"]
        fpath = await synth_sentence(idx, item["hi"])
        dur = get_duration(fpath)
        
        words = item["hinglish"].split()
        word_dur = dur / len(words)
        
        # Space words within this sentence's exact time window
        for w_idx, w in enumerate(words):
            w_start = round(current_time + (w_idx * word_dur), 3)
            w_end = round(w_start + word_dur, 3)
            # Ensure strict non-overlap
            if all_hinglish_words and w_start < all_hinglish_words[-1]["end"]:
                w_start = all_hinglish_words[-1]["end"]
            all_hinglish_words.append({
                "word": w,
                "start": w_start,
                "end": max(w_start + 0.05, w_end)
            })
            
        print(f"  Beat {idx}: {current_time:.2f}s -> {current_time + dur:.2f}s (dur: {dur:.2f}s, {len(words)} words)")
        audio_files.append(fpath)
        sentence_data.append({
            "id": idx,
            "start": round(current_time, 3),
            "end": round(current_time + dur, 3),
            "duration": round(dur, 3)
        })
        current_time = round(current_time + dur, 3)

    # Concat all audio files using ffmpeg concat demuxer
    concat_list = os.path.join(TEMP_DIR, "concat.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for af in audio_files:
            clean_p = af.replace(os.sep, "/")
            f.write(f"file '{clean_p}'\n")

    final_audio = os.path.join(PUBLIC_DIR, "voiceover_ep2_hi.mp3")
    concat_cmd = f'ffmpeg -y -f concat -safe 0 -i "{concat_list.replace(os.sep, "/")}" -c copy "{final_audio.replace(os.sep, "/")}"'
    subprocess.check_call(concat_cmd, shell=True)

    final_dur = get_duration(final_audio)
    print(f"\n✅ Perfect Hindi Master Audio generated: {final_audio} ({final_dur:.2f}s)")

    # Save subtitles
    final_subs = os.path.join(PUBLIC_DIR, "subtitles_ep2_hi.json")
    with open(final_subs, "w", encoding="utf-8") as f:
        json.dump(all_hinglish_words, f, indent=2)
    print(f"✅ Hinglish Subtitles generated: {final_subs} ({len(all_hinglish_words)} words)")

    # Save sentence timings manifest for scene sync
    manifest_file = os.path.join(PUBLIC_DIR, "manifest_ep2_hi_timing.json")
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump({
            "totalDuration": final_dur,
            "totalFrames": int(round(final_dur * 30)),
            "sentences": sentence_data
        }, f, indent=2)
    print(f"✅ Timing Manifest saved: {manifest_file} (Total Frames: {int(round(final_dur * 30))})")

if __name__ == "__main__":
    asyncio.run(main())
