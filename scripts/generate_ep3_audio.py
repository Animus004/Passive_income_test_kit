import os
import sys
import json
import asyncio
import subprocess
import edge_tts

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
TEMP_DIR_HI = os.path.join(PUBLIC_DIR, "temp_tts_ep3_hi")
TEMP_DIR_EN = os.path.join(PUBLIC_DIR, "temp_tts_ep3_en")
os.makedirs(TEMP_DIR_HI, exist_ok=True)
os.makedirs(TEMP_DIR_EN, exist_ok=True)

# 8 Dramatic Scenes for Episode #3
BEATS = [
    {
        "id": 1,
        "name": "The 7-Day Sleep Hook",
        "en": "What if every single human on Earth fell into a deep sleep for seven days straight? At midnight, eight billion people simultaneously collapse.",
        "hi": "क्या हो अगर पूरी दुनिया के सारे इंसान सात दिनों के लिए एक साथ सो जाएं? रात ठीक बारह बजे, आठ सौ करोड़ लोग एक साथ बेहोश होकर गिर पड़ते हैं!",
        "hinglish": "Kya ho agar poori duniya ke saare insaan 7 dino ke liye ek saath so jayein? Raat 12:00 baje 800 crore log ek saath behosh hokar gir padte hain!"
    },
    {
        "id": 2,
        "name": "Empty Streets & Drifting Vehicles",
        "en": "Instantly, millions of moving cars and high-speed trains roll to a dead halt or crash into barricades with zero drivers awake.",
        "hi": "सड़कों पर दौड़ती करोड़ों गाड़ियां और हाई-स्पीड ट्रेनें बिना ड्राइवर के डिवाइडर और दीवारों से टकराने लगती हैं!",
        "hinglish": "Sadkon par daudti karodon gaadiyan aur trains bina driver ke divider aur deewaron se takrane lagti hain!"
    },
    {
        "id": 3,
        "name": "Airplanes Falling Silent",
        "en": "Thirty thousand commercial airliners fly on autopilot until fuel runs dry, dropping from thirty thousand feet.",
        "hi": "हवा में उड़ते तीस हज़ार हवाई जहाज़ ऑटोपायलट पर उड़ते हैं, लेकिन फ्यूल खत्म होते ही आसमान से नीचे गिरने लगते हैं!",
        "hinglish": "Hawa mein udte 30,000 airplanes autopilot par chalte hain, lekin fuel khatam hote hi aasmaan se girne lagte hain!"
    },
    {
        "id": 4,
        "name": "Automated Grid & Nuclear Scram",
        "en": "Nuclear power plants detect zero operator response and automatically drop their control rods to prevent catastrophic meltdowns.",
        "hi": "न्यूक्लियर प्लांट्स कोई ऑपरेटर न पाकर ऑटोमैटिकली कंट्रोल रॉड्स गिरा देते हैं ताकि बड़ा महा-विनाश रोका जा सके!",
        "hinglish": "Nuclear plants koi operator na paakar automatically control rods gira dete hain taaki bada meltdown roka ja sake!"
    },
    {
        "id": 5,
        "name": "Total Continental Blackout",
        "en": "Within seventy-two hours, coal and gas turbines exhaust their fuel. The electrical grid collapses, plunging continents into pitch-black darkness.",
        "hi": "बहत्तर घंटों में बिजली ग्रिड्स ठप हो जाते हैं, और पूरे महाद्वीप घुप अंधेरे में डूब जाते हैं!",
        "hinglish": "72 ghanton mein bijli grids thap ho jaate hain, aur poore continents andhere mein doob jaate hain!"
    },
    {
        "id": 6,
        "name": "Animals Reclaim the Cities",
        "en": "With zero human activity, city skies clear completely. Wild wolves and deer cautiously wander down empty highways.",
        "hi": "इंसानों के गायब होते ही आसमान का प्रदूषण खत्म हो जाता है, और जंगली जानवर खाली सड़कों पर घूमने लगते हैं!",
        "hinglish": "Insaano ke gayab hote hi pollution gayab ho jata hai, aur jungle ke janwar khali sadkon par ghoomne lagte hain!"
    },
    {
        "id": 7,
        "name": "The Day 7 Awakening",
        "en": "On Day Seven, eight billion severely dehydrated humans wake up to dead phones, dark cities, and overgrown streets.",
        "hi": "सातवें दिन जब आठ सौ करोड़ लोग एक साथ जागते हैं, तो उनके फोन डेड, घर अंधेरे में, और दुनिया बदल चुकी होती है!",
        "hinglish": "Saatvein din jab 800 crore log ek saath jaagte hain, toh unke phone dead, ghar andhere mein, aur duniya badal chuki hoti hai!"
    },
    {
        "id": 8,
        "name": "The Infinite Loop",
        "en": "Proving that human consciousness is the only glue holding reality together. Which is why, if everyone suddenly went to sleep...",
        "hi": "यानी इंसान ही इस मॉडर्न दुनिया को ज़िंदा रखते हैं। और यही वजह है कि अगर सब एक साथ सो जाएं...",
        "hinglish": "Yani insaan hi is modern duniya ko zinda rakhte hain. Aur yahi wajah hai agar sab ek saath so jayein..."
    }
]

def get_duration(file_path):
    cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{file_path.replace(os.sep, "/")}"'
    out = subprocess.check_output(cmd, shell=True).decode().strip()
    return float(out)

async def synth_en_beat(idx, text):
    out_file = os.path.join(TEMP_DIR_EN, f"beat_en_{idx:02d}.mp3")
    # Crisp, high-energy dramatic narrator cadence for viral retention (<58s)
    comm = edge_tts.Communicate(text, "en-US-ChristopherNeural", rate="+24%")
    await comm.save(out_file)
    return out_file

async def synth_hi_beat(idx, text):
    out_file = os.path.join(TEMP_DIR_HI, f"beat_hi_{idx:02d}.mp3")
    comm = edge_tts.Communicate(text, "hi-IN-MadhurNeural", rate="+26%")
    await comm.save(out_file)
    return out_file

async def generate_language(lang="en"):
    is_hi = (lang == "hi")
    print(f"\n🎙️ Synthesizing {lang.upper()} Audio & Word Subtitles for Episode #3...")
    
    current_time = 0.100
    all_words = []
    beat_files = []
    cut_timings = []
    
    for item in BEATS:
        idx = item["id"]
        text = item["hi"] if is_hi else item["en"]
        sub_text = item["hinglish"] if is_hi else item["en"]
        
        fpath = await (synth_hi_beat(idx, text) if is_hi else synth_en_beat(idx, text))
        dur = get_duration(fpath)
        beat_files.append(fpath)
        
        beat_start_frame = int(round(current_time * 30))
        beat_end_frame = int(round((current_time + dur + 0.150) * 30))
        
        cut_timings.append({
            "sceneIndex": idx,
            "name": item["name"],
            "startFrame": beat_start_frame,
            "endFrame": beat_end_frame,
            "startSec": round(current_time, 3),
            "endSec": round(current_time + dur, 3),
            "text": text,
            "subText": sub_text
        })
        
        words = sub_text.split()
        word_dur = dur / len(words)
        for w_idx, w in enumerate(words):
            w_start = round(current_time + (w_idx * word_dur), 3)
            w_end = round(w_start + word_dur, 3)
            all_words.append({
                "word": w,
                "start": w_start,
                "end": w_end
            })
            
        current_time += dur + 0.080  # 80ms natural breath pause
        
    total_duration = current_time
    total_frames = int(round(total_duration * 30))
    
    # Concatenate all beats into master MP3
    list_path = os.path.join(PUBLIC_DIR, f"concat_list_ep3_{lang}.txt")
    with open(list_path, "w", encoding="utf-8") as f:
        for bf in beat_files:
            f.write(f"file '{bf.replace(os.sep, '/')}'\n")
            
    master_mp3 = os.path.join(PUBLIC_DIR, f"voiceover_ep3_{lang}.mp3")
    concat_cmd = f'ffmpeg -y -f concat -safe 0 -i "{list_path.replace(os.sep, "/")}" -c copy "{master_mp3.replace(os.sep, "/")}"'
    subprocess.check_call(concat_cmd, shell=True)
    
    # Write subtitles json
    subs_path = os.path.join(PUBLIC_DIR, f"subtitles_ep3_{lang}.json")
    with open(subs_path, "w", encoding="utf-8") as f:
        json.dump(all_words, f, indent=2, ensure_ascii=False)
        
    print(f"✅ {lang.upper()} Master Generated: {master_mp3}")
    print(f"   Duration: {total_duration:.2f}s | Total Frames: {total_frames} @ 30fps")
    print(f"   Subtitles saved: {subs_path} ({len(all_words)} words)")
    
    return {
        "lang": lang,
        "masterMp3": master_mp3,
        "subsPath": subs_path,
        "totalFrames": total_frames,
        "totalDuration": total_duration,
        "cuts": cut_timings
    }

async def main():
    en_res = await generate_language("en")
    hi_res = await generate_language("hi")
    
    manifest = {
        "title": "What If Every Human Slept for 7 Days Straight?",
        "seriesNumber": "#3",
        "en": en_res,
        "hi": hi_res,
        "totalFramesEn": en_res["totalFrames"],
        "totalFramesHi": hi_res["totalFrames"]
    }
    
    manifest_path = os.path.join(PROJECT_ROOT, "src", "data", "whatif_ep3_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    print(f"\n🎉 Episode #3 Manifest saved to: {manifest_path}")

if __name__ == "__main__":
    asyncio.run(main())
